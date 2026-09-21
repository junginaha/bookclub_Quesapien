import { NextRequest, NextResponse } from "next/server";

type GoogleItem = {
  volumeInfo?: {
    title?: string;
    authors?: string[];
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

function norm(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
}

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title")?.trim() ?? "";
  const author = request.nextUrl.searchParams.get("author")?.trim() ?? "";
  if (!title) return NextResponse.json({ coverUrl: null }, { status: 400 });

  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", author ? `intitle:"${title}" inauthor:"${author}"` : `intitle:"${title}"`);
  url.searchParams.set("maxResults", "8");
  url.searchParams.set("printType", "books");
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (key) url.searchParams.set("key", key);

  try {
    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (!response.ok) return NextResponse.json({ coverUrl: null });
    const data = await response.json() as { items?: GoogleItem[] };
    const qt = norm(title);
    const qa = norm(author);

    const ranked = (data.items ?? []).map((item) => {
      const info = item.volumeInfo ?? {};
      const ct = norm(info.title ?? "");
      const ca = norm((info.authors ?? []).join(" "));
      let score = ct === qt ? 80 : ct.includes(qt) || qt.includes(ct) ? 60 : 0;
      if (qa && ca) score += ca.includes(qa) || qa.includes(ca) ? 30 : 0;
      return { item, score };
    }).sort((a, b) => b.score - a.score);

    const info = ranked[0]?.score >= 60 ? ranked[0].item.volumeInfo : undefined;
    const images = info?.imageLinks;
    const coverUrl = images?.extraLarge || images?.large || images?.medium || images?.small || images?.thumbnail || images?.smallThumbnail || null;
    return NextResponse.json({
      coverUrl: coverUrl?.replace(/^http:/, "https:") ?? null,
      matchedTitle: info?.title ?? null,
      matchedAuthors: info?.authors ?? [],
    });
  } catch {
    return NextResponse.json({ coverUrl: null });
  }
}
