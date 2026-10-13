import { NextRequest, NextResponse } from "next/server";

// 읽고 싶은 책 찾기 — 홈에서 "이 책으로 북클럽 열어주세요" 요청 후보를 보여준다.
// 카카오 → 네이버 → 구글 순으로 시도하고, 키가 없거나 실패하면 빈 결과(화면은 직접 요청으로 대체).
type Book = { title: string; author: string; coverUrl: string | null; isbn: string | null };

const strip = (v: string) => v.replace(/<[^>]+>/g, "").trim();
const https = (v?: string) => (v ? v.replace(/^http:/, "https:") : null);
const isbn13 = (v?: string) => v?.split(/\s+/).find((x) => /^\d{13}$/.test(x)) ?? null;

async function kakao(q: string): Promise<Book[]> {
  const key = process.env.KAKAO_REST_API_KEY?.trim() || process.env.KAKAO_API?.trim();
  if (!key) return [];
  const url = new URL("https://dapi.kakao.com/v3/search/book");
  url.searchParams.set("query", q);
  url.searchParams.set("size", "8");
  try {
    const res = await fetch(url, { headers: { Authorization: "KakaoAK " + key }, signal: AbortSignal.timeout(5000), next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = await res.json() as { documents?: Array<{ title?: string; authors?: string[]; thumbnail?: string; isbn?: string }> };
    return (data.documents ?? []).filter((d) => d.title).map((d) => ({
      title: strip(d.title!), author: (d.authors ?? []).join(", "), coverUrl: https(d.thumbnail), isbn: isbn13(d.isbn),
    }));
  } catch { return []; }
}

async function naver(q: string): Promise<Book[]> {
  const id = process.env.NAVER_CLIENT_ID?.trim();
  const secret = process.env.NAVER_CLIENT_SECRET?.trim();
  if (!id || !secret) return [];
  const url = new URL("https://openapi.naver.com/v1/search/book.json");
  url.searchParams.set("query", q);
  url.searchParams.set("display", "8");
  try {
    const res = await fetch(url, { headers: { "X-Naver-Client-Id": id, "X-Naver-Client-Secret": secret }, signal: AbortSignal.timeout(5000), next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = await res.json() as { items?: Array<{ title?: string; author?: string; image?: string; isbn?: string }> };
    return (data.items ?? []).filter((d) => d.title).map((d) => ({
      title: strip(d.title!), author: strip(d.author ?? "").split("^").join(", "), coverUrl: https(d.image), isbn: isbn13(d.isbn),
    }));
  } catch { return []; }
}

async function google(q: string): Promise<Book[]> {
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", q);
  url.searchParams.set("maxResults", "8");
  url.searchParams.set("printType", "books");
  url.searchParams.set("langRestrict", "ko");
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (key) url.searchParams.set("key", key);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000), next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = await res.json() as { items?: Array<{ volumeInfo?: { title?: string; authors?: string[]; imageLinks?: { thumbnail?: string }; industryIdentifiers?: Array<{ type?: string; identifier?: string }> } }> };
    return (data.items ?? []).flatMap((item) => {
      const v = item.volumeInfo;
      if (!v?.title) return [];
      return [{
        title: v.title, author: (v.authors ?? []).join(", "), coverUrl: https(v.imageLinks?.thumbnail),
        isbn: v.industryIdentifiers?.find((i) => i.type === "ISBN_13")?.identifier ?? null,
      }];
    });
  } catch { return []; }
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").normalize("NFKC").replace(/\s+/g, " ").trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ books: [] }, { status: 400 });

  let books = await kakao(q);
  if (!books.length) books = await naver(q);
  if (!books.length) books = await google(q);

  const seen = new Set<string>();
  const unique = books.filter((b) => {
    const key = b.isbn ?? `${b.title}|${b.author}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 5);

  return NextResponse.json({ books: unique }, {
    headers: { "Cache-Control": unique.length ? "public, s-maxage=86400, stale-while-revalidate=604800" : "no-store" },
  });
}
