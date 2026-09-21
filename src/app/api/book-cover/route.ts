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

function norm(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]/gu, "");
}

function matchScore(candidate: Candidate, title: string, author: string) {
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
    else if (ca.includes(qa) || qa.includes(ca)) score += 28;
    else score -= 18;
  }

  return score + candidate.quality;
}

async function searchNaver(title: string, author: string): Promise<Candidate[]> {
  const id = process.env.NAVER_CLIENT_ID;
  const secret = process.env.NAVER_CLIENT_SECRET;
  if (!id || !secret) return [];

  const url = new URL("https://openapi.naver.com/v1/search/book.json");
  url.searchParams.set("query", [title, author].filter(Boolean).join(" "));
  url.searchParams.set("display", "10");
  url.searchParams.set("sort", "sim");

  try {
    const response = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": id,
        "X-Naver-Client-Secret": secret,
      },
      next: { revalidate: 604800 },
    });
    if (!response.ok) return [];
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
    return [];
  }
}

async function searchKakao(title: string, author: string): Promise<Candidate[]> {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) return [];

  const url = new URL("https://dapi.kakao.com/v3/search/book");
  url.searchParams.set("query", title);
  url.searchParams.set("target", "title");
  url.searchParams.set("size", "20");
  url.searchParams.set("sort", "accuracy");

  try {
    const response = await fetch(url, {
      headers: { Authorization: "KakaoAK " + key },
      next: { revalidate: 604800 },
    });
    if (!response.ok) return [];
    const data = await response.json() as { documents?: KakaoDocument[] };
    return (data.documents ?? [])
      .filter((item) => item.thumbnail && item.title)
      .map((item) => ({
        provider: "kakao" as const,
        title: item.title ?? "",
        authors: item.authors ?? [],
        coverUrl: item.thumbnail!.replace(/^http:/, "https:"),
        quality: 12,
        isbn: item.isbn,
      }))
      .filter((item) => !author || norm(item.authors.join(" ")).includes(norm(author)) || norm(author).includes(norm(item.authors.join(" "))));
  } catch {
    return [];
  }
}

async function searchGoogle(title: string, author: string): Promise<Candidate[]> {
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", author ? `intitle:"${title}" inauthor:"${author}"` : `intitle:"${title}"`);
  url.searchParams.set("maxResults", "10");
  url.searchParams.set("printType", "books");
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (key) url.searchParams.set("key", key);

  try {
    const response = await fetch(url, { next: { revalidate: 604800 } });
    if (!response.ok) return [];
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
    return [];
  }
}

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title")?.trim() ?? "";
  const author = request.nextUrl.searchParams.get("author")?.trim() ?? "";
  if (!title) return NextResponse.json({ coverUrl: null }, { status: 400 });

  const [naver, kakao, google] = await Promise.all([
    searchNaver(title, author),
    searchKakao(title, author),
    searchGoogle(title, author),
  ]);

  const ranked = [...naver, ...kakao, ...google]
    .map((candidate) => ({ candidate, score: matchScore(candidate, title, author) }))
    .filter((item) => item.score >= 72)
    .sort((a, b) => b.score - a.score);

  const best = ranked[0]?.candidate;
  const response = NextResponse.json({
    coverUrl: best?.coverUrl ?? null,
    provider: best?.provider ?? null,
    matchedTitle: best?.title ?? null,
    matchedAuthors: best?.authors ?? [],
    isbn: best?.isbn ?? null,
    sourcesAvailable: {
      naver: Boolean(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
      kakao: Boolean(process.env.KAKAO_REST_API_KEY),
      google: true,
    },
  });

  response.headers.set("Cache-Control", "public, s-maxage=604800, stale-while-revalidate=2592000");
  return response;
}
