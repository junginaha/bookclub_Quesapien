import { NextRequest, NextResponse } from "next/server";

type Candidate = {
  provider: "naver" | "kakao" | "google";
  title: string;
  authors: string[];
  coverUrl: string;
  quality: number;
  isbn?: string;
};

type GoogleItem = {
  volumeInfo?: {
    title?: string;
    authors?: string[];
    industryIdentifiers?: Array<{ type?: string; identifier?: string }>;
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
      extraLarge?: string;
    };
  };
};

type NaverItem = {
  title?: string;
  image?: string;
  author?: string;
  isbn?: string;
};

type KakaoDocument = {
  title?: string;
  authors?: string[];
  thumbnail?: string;
  isbn?: string;
};

function kakaoKey() {
  return process.env.KAKAO_REST_API_KEY?.trim() || process.env.KAKAO_API?.trim();
}

// Kakao returns a 120px thumbnail proxy; its fname param is the full-size original.
function kakaoOriginal(thumbnail: string) {
  try {
    const original = new URL(thumbnail).searchParams.get("fname");
    if (original) return original.replace(/^http:/, "https:");
  } catch {}
  return thumbnail.replace(/^http:/, "https:");
}

function norm(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]/gu, "");
}

function authorsMatch(authors: string[], query: string) {
  const expected = query.split(/[·,|;&]/).map(norm).filter(Boolean);
  const actual = authors.map(norm).filter(Boolean);
  return !expected.length || expected.some((name) =>
    actual.some((value) => value.includes(name) || name.includes(value)));
}

// Verified Korean editions: book21.com/book/book_view.html?bookSID=6920
// and yes24.com/product/goods/64620409. ISBN avoids subtitle/author-order ambiguity.
function knownIsbn(title: string, author: string, explicit?: string) {
  if (explicit && /^97[89]\d{10}$/.test(explicit)) return explicit;
  if (["불통독단야망", "위험한리더는어떻게만들어지는가"].includes(norm(title)) &&
      norm(author).includes("스티브테일러")) return "9791173570650";
  if (norm(title) === "어떻게민주주의는무너지는가" &&
      authorsMatch(["스티븐 레비츠키", "대니얼 지블랫"], author) && author.trim())
    return "9791160560589";
  return undefined;
}

function matchScore(candidate: Candidate, title: string, author: string, explicitIsbn?: string) {
  const isbn = knownIsbn(title, author, explicitIsbn);
  if (isbn && candidate.isbn?.split(/\s+/).includes(isbn)) return 200 + candidate.quality;
  const qt = norm(title);
  const qa = norm(author);
  const ct = norm(candidate.title);
  const ca = norm(candidate.authors.join(" "));

  let score = 0;
  if (ct === qt) score += 100;
  else if (ct.includes(qt) || qt.includes(ct)) score += 72;
  else return 0;

  if (qa && ca) {
    if (ca === qa) score += 36;
    else if (authorsMatch(candidate.authors, author)) score += 28;
    else score -= 18;
  }

  return score + candidate.quality;
}

async function searchNaver(title: string, author: string, explicitIsbn?: string): Promise<Candidate[]> {
  const id = process.env.NAVER_CLIENT_ID?.trim();
  const secret = process.env.NAVER_CLIENT_SECRET?.trim();
  if (!id || !secret) return [];

  const url = new URL("https://openapi.naver.com/v1/search/book.json");
  const isbn = knownIsbn(title, author, explicitIsbn);
  url.searchParams.set("query", isbn || [title, author].filter(Boolean).join(" "));
  url.searchParams.set("display", "10");
  url.searchParams.set("sort", "sim");

  try {
    const response = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": id,
        "X-Naver-Client-Secret": secret,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.warn("[book-cover] naver HTTP", response.status);
      return [];
    }
    const data = await response.json() as { items?: NaverItem[] };
    return (data.items ?? [])
      .filter((item) => item.image && item.title)
      .map((item) => ({
        provider: "naver" as const,
        title: item.title?.replace(/<[^>]+>/g, "") ?? "",
        authors: (item.author ?? "").split("|").map((v) => v.trim()).filter(Boolean),
        coverUrl: item.image!.replace(/^http:/, "https:"),
        quality: 18,
        isbn: item.isbn,
      }));
  } catch {
    console.warn("[book-cover] naver request failed or timed out");
    return [];
  }
}

async function searchKakao(title: string, author: string, explicitIsbn?: string): Promise<Candidate[]> {
  const key = kakaoKey();
  if (!key) return [];

  const url = new URL("https://dapi.kakao.com/v3/search/book");
  const isbn = knownIsbn(title, author, explicitIsbn);
  url.searchParams.set("query", isbn || title);
  url.searchParams.set("target", isbn ? "isbn" : "title");
  url.searchParams.set("size", "20");
  url.searchParams.set("sort", "accuracy");

  try {
    const response = await fetch(url, {
      headers: { Authorization: "KakaoAK " + key },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.warn("[book-cover] kakao HTTP", response.status);
      return [];
    }
    const data = await response.json() as { documents?: KakaoDocument[] };
    return (data.documents ?? [])
      .filter((item) => item.thumbnail && item.title)
      .map((item) => ({
        provider: "kakao" as const,
        title: item.title ?? "",
        authors: item.authors ?? [],
        coverUrl: kakaoOriginal(item.thumbnail!),
        quality: 12,
        isbn: item.isbn,
      }))
      .filter((item) => isbn ? Boolean(item.isbn?.split(/\s+/).includes(isbn)) : authorsMatch(item.authors, author));
  } catch {
    console.warn("[book-cover] kakao request failed or timed out");
    return [];
  }
}

async function searchGoogle(title: string, author: string, explicitIsbn?: string): Promise<Candidate[]> {
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  const isbn = knownIsbn(title, author, explicitIsbn);
  url.searchParams.set("q", isbn ? `isbn:${isbn}` : author ? `intitle:"${title}" inauthor:"${author}"` : `intitle:"${title}"`);
  url.searchParams.set("maxResults", "10");
  url.searchParams.set("printType", "books");
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (key) url.searchParams.set("key", key);

  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      console.warn("[book-cover] google HTTP", response.status);
      return [];
    }
    const data = await response.json() as { items?: GoogleItem[] };

    return (data.items ?? []).flatMap((item) => {
      const info = item.volumeInfo;
      if (!info?.title || !info.imageLinks) return [];
      const images = info.imageLinks;
      const cover =
        images.extraLarge ? { url: images.extraLarge, q: 42 } :
        images.large ? { url: images.large, q: 38 } :
        images.medium ? { url: images.medium, q: 32 } :
        images.small ? { url: images.small, q: 25 } :
        images.thumbnail ? { url: images.thumbnail, q: 10 } :
        images.smallThumbnail ? { url: images.smallThumbnail, q: 5 } : null;
      if (!cover) return [];

      const isbn = info.industryIdentifiers?.find((id) => id.type === "ISBN_13")?.identifier
        ?? info.industryIdentifiers?.[0]?.identifier;

      return [{
        provider: "google" as const,
        title: info.title,
        authors: info.authors ?? [],
        coverUrl: cover.url.replace(/^http:/, "https:"),
        quality: cover.q,
        isbn,
      }];
    });
  } catch {
    console.warn("[book-cover] google request failed or timed out");
    return [];
  }
}

// ─── 자리표시 표지 걸러내기 ──────────────────────────────────────────
// 교보문고 'no image'(연회색 바탕에 로고만) 같은 자리표시 이미지는 크기가 멀쩡해서
// 클라이언트의 가로·세로 검사로는 못 잡는다. 서버에서 작게 줄여 픽셀 분산을 재고,
// 거의 단색이면 표지가 아니라고 본다 — 실제 표지는 글자·그림 때문에 분산이 크다.
const PLACEHOLDER_STDEV = 22;
async function looksLikePlaceholder(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(4000) });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 800) return true;
    const sharp = (await import("sharp")).default;
    const stats = await sharp(buf).resize(64, 64, { fit: "inside" }).removeAlpha().stats();
    const stdev = stats.channels.reduce((m, c) => Math.max(m, c.stdev), 0);
    return stdev < PLACEHOLDER_STDEV;
  } catch {
    return false; // 검사 자체가 실패하면 표지를 믿는다(과잉 차단 방지)
  }
}

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title")?.trim() ?? "";
  const author = request.nextUrl.searchParams.get("author")?.trim() ?? "";
  const isbnParam = request.nextUrl.searchParams.get("isbn")?.replace(/\D/g, "") || undefined;
  if (!title) return NextResponse.json({ coverUrl: null }, { status: 400 });

  const [naver, kakao, google] = await Promise.all([
    searchNaver(title, author, isbnParam),
    searchKakao(title, author, isbnParam),
    searchGoogle(title, author, isbnParam),
  ]);

  const ranked = [...naver, ...kakao, ...google]
    .map((candidate) => ({ candidate, score: matchScore(candidate, title, author, isbnParam) }))
    .filter((item) => item.score >= 72)
    .sort((a, b) => b.score - a.score);

  // 상위 후보부터 자리표시 여부를 확인해 첫 '진짜' 표지를 고른다(최대 3개).
  let best: (typeof ranked)[number]["candidate"] | undefined;
  for (const { candidate } of ranked.slice(0, 3)) {
    if (!(await looksLikePlaceholder(candidate.coverUrl))) { best = candidate; break; }
  }
  const response = NextResponse.json({
    coverUrl: best?.coverUrl ?? null,
    provider: best?.provider ?? null,
    matchedTitle: best?.title ?? null,
    matchedAuthors: best?.authors ?? [],
    isbn: best?.isbn ?? null,
    sourcesAvailable: {
      naver: Boolean(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
      kakao: Boolean(kakaoKey()),
      google: true,
    },
  });

  // Missing keys and temporary provider failures must never become a cached blank cover.
  response.headers.set("Cache-Control", best
    ? "public, max-age=0, s-maxage=86400, stale-while-revalidate=3600"
    : "no-store");
  return response;
}
