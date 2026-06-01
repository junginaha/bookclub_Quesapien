import { NextRequest, NextResponse } from "next/server";

// 거인 슬러그 → Gutendex 검색어 매핑 (저작권 만료 도서만)
const GUTENDEX_SEARCH: Record<string, string> = {
  "friedrich-nietzsche": "nietzsche",
  "immanuel-kant": "kant",
  "arthur-schopenhauer": "schopenhauer",
  "georg-hegel": "hegel",
  "socrates": "plato",           // 소크라테스 저작은 플라톤 기록
  "fyodor-dostoevsky": "dostoevsky",
  "leo-tolstoy": "tolstoy",
  "franz-kafka": "kafka",
  "virginia-woolf": "virginia woolf",
  "albert-einstein": "einstein",
  "leo-da-vinci": "vinci",
  "marcus-aurelius": "marcus aurelius",
};

// 저자별 선호 도서 키워드
const PREFERRED_BOOKS: Record<string, string[]> = {
  "friedrich-nietzsche": ["thus spoke zarathustra", "beyond good and evil", "birth of tragedy"],
  "immanuel-kant": ["critique of pure reason", "groundwork"],
  "arthur-schopenhauer": ["world as will", "essays and aphorisms"],
  "fyodor-dostoevsky": ["brothers karamazov", "crime and punishment", "idiot"],
  "leo-tolstoy": ["anna karenina", "war and peace", "death of ivan", "resurrection"],
  "franz-kafka": ["metamorphosis", "trial", "castle"],
  "virginia-woolf": ["mrs dalloway", "to the lighthouse", "orlando", "room of one's own"],
  "marcus-aurelius": ["meditations"],
  "socrates": ["apology", "republic", "symposium", "phaedo"],
};

interface GutendexBook {
  id: number;
  title: string;
  formats: Record<string, string>;
}

const cache = new Map<string, { title: string; text: string; ts: number }>();
const TTL = 1000 * 60 * 60 * 24; // 24h

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") ?? "";

  if (!slug) return NextResponse.json({ error: "slug 필요" }, { status: 400 });

  const cached = cache.get(slug);
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json({ title: cached.title, preview: cached.text.slice(0, 200), length: cached.text.length });
  }

  const searchTerm = GUTENDEX_SEARCH[slug];
  if (!searchTerm) return NextResponse.json({ title: "", text: "", source: "none" });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    // Gutendex API 호출
    const searchRes = await fetch(
      `https://gutendex.com/books/?search=${encodeURIComponent(searchTerm)}&languages=en&mime_type=text`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!searchRes.ok) throw new Error("gutendex search failed");
    const searchData = await searchRes.json();
    const books: GutendexBook[] = searchData.results ?? [];

    // 선호 도서 우선 선택
    const preferred = PREFERRED_BOOKS[slug] ?? [];
    let selected = books.find((b) =>
      preferred.some((p) => b.title.toLowerCase().includes(p))
    );
    if (!selected) selected = books[0];
    if (!selected) return NextResponse.json({ title: "", text: "", source: "none" });

    // text/plain URL 추출
    const textUrl = selected.formats["text/plain; charset=utf-8"]
      ?? selected.formats["text/plain; charset=us-ascii"]
      ?? selected.formats["text/plain"]
      ?? Object.entries(selected.formats).find(([k]) => k.startsWith("text/plain"))?.[1];

    if (!textUrl) return NextResponse.json({ title: selected.title, text: "", source: "no-text" });

    // 원문 다운로드 (최대 80KB만)
    const textController = new AbortController();
    const textTimeout = setTimeout(() => textController.abort(), 10000);
    const textRes = await fetch(textUrl, { signal: textController.signal });
    clearTimeout(textTimeout);

    if (!textRes.ok) throw new Error("text download failed");

    // 스트림에서 처음 80KB만 읽기
    const reader = textRes.body?.getReader();
    if (!reader) throw new Error("no reader");

    let rawText = "";
    const decoder = new TextDecoder("utf-8", { fatal: false });
    while (rawText.length < 80000) {
      const { done, value } = await reader.read();
      if (done) break;
      rawText += decoder.decode(value, { stream: !done });
    }
    reader.cancel().catch(() => {});

    // Project Gutenberg 헤더/푸터 제거 (저작권 고지 섹션)
    const startMarkers = ["*** START OF THE PROJECT", "*** START OF THIS PROJECT", "CHAPTER I", "CHAPTER 1", "BOOK I", "PREFACE", "INTRODUCTION", "PROLOGUE"];
    let startIdx = 0;
    for (const marker of startMarkers) {
      const idx = rawText.toUpperCase().indexOf(marker.toUpperCase());
      if (idx > 0 && idx < 5000) { startIdx = idx; break; }
    }

    // 5,000자 ~ 10,000자 슬라이싱 (서문 + 핵심 챕터)
    const sliced = rawText.slice(startIdx, startIdx + 10000).trim();

    cache.set(slug, { title: selected.title, text: sliced, ts: Date.now() });

    return NextResponse.json({
      title: selected.title,
      bookId: selected.id,
      source: "gutendex",
      preview: sliced.slice(0, 300),
      length: sliced.length,
    });

  } catch (err) {
    console.error("Gutendex init error:", err);
    return NextResponse.json({ title: "", text: "", source: "error", error: String(err) });
  }
}

// 내부 전용: 전체 텍스트 반환 (chat API에서 호출)
export async function POST(req: NextRequest) {
  const { slug } = await req.json();
  if (!slug) return NextResponse.json({ text: "" });

  const cached = cache.get(slug);
  if (cached) return NextResponse.json({ title: cached.title, text: cached.text });

  // 캐시 없으면 GET 흐름 실행
  const url = new URL(req.url);
  url.searchParams.set("slug", slug);
  const getRes = await GET(new NextRequest(url.toString()));
  const _ = await getRes.json(); void _;

  const refreshed = cache.get(slug);
  return NextResponse.json({ title: refreshed?.title ?? "", text: refreshed?.text ?? "" });
}
