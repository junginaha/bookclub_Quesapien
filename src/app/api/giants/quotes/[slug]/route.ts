import { NextRequest, NextResponse } from "next/server";
import { GIANTS } from "@/data/giants";

// Quotable API slug mappings (사후 70년+ 공개 도메인 인물만)
const QUOTABLE_SLUGS: Record<string, string> = {
  "friedrich-nietzsche": "friedrich-nietzsche",
  "immanuel-kant": "immanuel-kant",
  "arthur-schopenhauer": "arthur-schopenhauer",
  "virginia-woolf": "virginia-woolf",
  "leo-tolstoy": "leo-tolstoy",
  "fyodor-dostoevsky": "fyodor-dostoevsky",
  "franz-kafka": "franz-kafka",
  "albert-einstein": "albert-einstein",
  "marcus-aurelius": "marcus-aurelius",
  "socrates": "socrates",
  "georg-hegel": "g-w-f-hegel",
  "leo-da-vinci": "leonardo-da-vinci",
};

// 큐레이티드 명언 (Quotable에 없는 인물)
const EXTRA_QUOTES: Record<string, { content: string; source: string }[]> = {
  "socrates": [
    { content: "검토되지 않은 삶은 살 가치가 없다.", source: "소크라테스의 변론 (플라톤)" },
    { content: "나는 내가 모른다는 것을 안다.", source: "소크라테스" },
    { content: "지혜는 자기 자신을 아는 것에서 시작된다.", source: "플라톤 기록" },
  ],
  "marcus-aurelius": [
    { content: "당신이 통제할 수 없는 것에 시간을 낭비하지 말라.", source: "명상록" },
    { content: "오늘 하루를 마치 마지막인 것처럼 살되, 또한 영원히 살 것처럼 계획하라.", source: "명상록" },
    { content: "장애물이 곧 길이다.", source: "명상록" },
  ],
  "leo-da-vinci": [
    { content: "단순함은 궁극의 정교함이다.", source: "레오나르도 다 빈치" },
    { content: "아는 것으로 충분하지 않다. 적용해야 한다.", source: "레오나르도 다 빈치" },
    { content: "배움은 마음을 움직이지 않고는 사랑을 결코 이룰 수 없다.", source: "레오나르도 다 빈치" },
  ],
};

// In-memory cache (resets on each cold start, fine for Vercel edge)
const cache = new Map<string, { quotes: unknown[]; ts: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Return cached if fresh
  const cached = cache.get(slug);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({ quotes: cached.quotes, source: "cache" });
  }

  const giant = GIANTS.find((g) => g.slug === slug);
  const fallbackQuote = giant
    ? [{ content: giant.signature_quote, author: giant.name, source: giant.key_works[0] ?? "" }]
    : [];

  // Korean authors — use curated list
  if (EXTRA_QUOTES[slug]) {
    const quotes = EXTRA_QUOTES[slug].map((q) => ({
      content: q.content,
      author: giant?.name ?? slug,
      source: q.source,
    }));
    cache.set(slug, { quotes, ts: Date.now() });
    return NextResponse.json({ quotes, source: "curated" });
  }

  // Try Quotable API for Western figures
  const quotableSlug = QUOTABLE_SLUGS[slug];
  if (quotableSlug) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(
        `https://api.quotable.io/quotes?author=${quotableSlug}&limit=6`,
        { signal: controller.signal, next: { revalidate: 3600 } }
      );
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const quotes = (data.results ?? []).map((q: { content: string; author: string }) => ({
          content: q.content,
          author: q.author,
          source: "Quotable.io",
        }));
        if (quotes.length > 0) {
          // Prepend our curated signature quote
          const all = [
            { content: giant!.signature_quote, author: giant!.name, source: giant!.key_works[0] ?? "" },
            ...quotes.slice(0, 5),
          ];
          cache.set(slug, { quotes: all, ts: Date.now() });
          return NextResponse.json({ quotes: all, source: "quotable" });
        }
      }
    } catch {
      // Fall through to local data
    }
  }

  // Final fallback: local signature_quote + related_questions as prompts
  cache.set(slug, { quotes: fallbackQuote, ts: Date.now() });
  return NextResponse.json({ quotes: fallbackQuote, source: "local" });
}
