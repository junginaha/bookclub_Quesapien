export interface EvidenceSource {
  provider: "Google Books" | "Open Library";
  label: string;
  url: string;
  matchedTitle: string;
  matchedAuthors: string[];
}

export interface BookEvidence {
  verified: boolean;
  confidence: "high" | "medium" | "low";
  queryTitle: string;
  queryAuthor: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  firstPublishYear?: number;
  isbn13?: string;
  isbn10?: string;
  categories: string[];
  subjects: string[];
  description?: string;
  sources: EvidenceSource[];
}

type GoogleVolume = {
  id?: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    categories?: string[];
    industryIdentifiers?: { type?: string; identifier?: string }[];
    infoLink?: string;
  };
};

type OpenLibraryDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  publisher?: string[];
  isbn?: string[];
  subject?: string[];
};

function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]/gu, "");
}

function tokenOverlap(a: string, b: string): number {
  const tokensA = a.normalize("NFKC").toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const tokensB = new Set(b.normalize("NFKC").toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean));
  if (tokensA.length === 0) return 0;
  return tokensA.filter((token) => tokensB.has(token)).length / tokensA.length;
}

function matchScore(queryTitle: string, queryAuthor: string, title = "", authors: string[] = []) {
  const qt = normalize(queryTitle);
  const ct = normalize(title);
  const qa = normalize(queryAuthor);
  const ca = normalize(authors.join(" "));
  let titleScore = 0;
  let authorScore = 0;

  if (qt && ct) {
    if (qt === ct) titleScore = 70;
    else if (ct.includes(qt) || qt.includes(ct)) titleScore = 58;
    else titleScore = Math.round(tokenOverlap(queryTitle, title) * 48);
  }

  if (qa && ca) {
    if (qa === ca) authorScore = 30;
    else if (ca.includes(qa) || qa.includes(ca)) authorScore = 25;
    else authorScore = Math.round(tokenOverlap(queryAuthor, authors.join(" ")) * 22);
  }

  return { total: titleScore + authorScore, titleScore, authorScore };
}

async function fetchJson<T>(url: string, headers?: HeadersInit): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, {
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function googleLookup(title: string, author: string) {
  const query = `intitle:"${title}" inauthor:"${author}"`;
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", query);
  url.searchParams.set("printType", "books");
  url.searchParams.set("maxResults", "5");
  url.searchParams.set("projection", "full");
  if (key) url.searchParams.set("key", key);

  const data = await fetchJson<{ items?: GoogleVolume[] }>(url.toString());
  const ranked = (data?.items ?? [])
    .map((item) => {
      const info = item.volumeInfo ?? {};
      return {
        item,
        info,
        score: matchScore(title, author, info.title, info.authors ?? []),
      };
    })
    .sort((a, b) => b.score.total - a.score.total);

  return ranked[0] ?? null;
}

async function openLibraryLookup(title: string, author: string) {
  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("title", title);
  url.searchParams.set("author", author);
  url.searchParams.set("fields", "key,title,author_name,first_publish_year,publisher,isbn,subject");
  url.searchParams.set("limit", "5");

  const headers = {
    "User-Agent": "Qsapiens/1.0 (https://www.qsapiens.com)",
  };
  const data = await fetchJson<{ docs?: OpenLibraryDoc[] }>(url.toString(), headers);
  const ranked = (data?.docs ?? [])
    .map((doc) => ({
      doc,
      score: matchScore(title, author, doc.title, doc.author_name ?? []),
    }))
    .sort((a, b) => b.score.total - a.score.total);

  const best = ranked[0] ?? null;
  if (!best?.doc.key || best.score.total < 58) return best ? { ...best, work: null } : null;

  const work = await fetchJson<{
    description?: string | { value?: string };
    subjects?: string[];
    title?: string;
  }>(`https://openlibrary.org${best.doc.key}.json`, headers);

  return { ...best, work };
}

function pickIsbns(values: string[] = []) {
  const clean = values.map((value) => value.replace(/[^0-9X]/gi, ""));
  return {
    isbn13: clean.find((value) => value.length === 13),
    isbn10: clean.find((value) => value.length === 10),
  };
}

export async function resolveBookEvidence(title: string, author: string): Promise<BookEvidence> {
  const [google, openLibrary] = await Promise.all([
    googleLookup(title, author),
    openLibraryLookup(title, author),
  ]);

  const googleGood = !!google && google.score.titleScore >= 48 && google.score.authorScore >= 15;
  const openGood = !!openLibrary && openLibrary.score.titleScore >= 48 && openLibrary.score.authorScore >= 15;

  const g = googleGood ? google!.info : undefined;
  const o = openGood ? openLibrary!.doc : undefined;
  const work = openGood ? openLibrary!.work : undefined;

  const googleIds = (g?.industryIdentifiers ?? []).reduce<Record<string, string>>((acc, row) => {
    if (row.type && row.identifier) acc[row.type] = row.identifier;
    return acc;
  }, {});
  const openIds = pickIsbns(o?.isbn ?? []);

  const workDescription = typeof work?.description === "string"
    ? work.description
    : work?.description?.value;

  const sources: EvidenceSource[] = [];
  if (googleGood && google) {
    sources.push({
      provider: "Google Books",
      label: "Google Books 도서 정보",
      url: g?.infoLink || (google.item.id ? `https://books.google.com/books?id=${google.item.id}` : "https://books.google.com/"),
      matchedTitle: g?.title ?? title,
      matchedAuthors: g?.authors ?? [],
    });
  }
  if (openGood && openLibrary) {
    sources.push({
      provider: "Open Library",
      label: "Open Library 서지 정보",
      url: o?.key ? `https://openlibrary.org${o.key}` : "https://openlibrary.org/",
      matchedTitle: o?.title ?? title,
      matchedAuthors: o?.author_name ?? [],
    });
  }

  const verified = sources.length > 0;
  const confidence: BookEvidence["confidence"] =
    googleGood && openGood ? "high" :
    verified ? "medium" :
    "low";

  const categories = Array.from(new Set((g?.categories ?? []).filter(Boolean))).slice(0, 8);
  const subjects = Array.from(new Set([
    ...(o?.subject ?? []),
    ...(work?.subjects ?? []),
  ].filter(Boolean))).slice(0, 16);

  return {
    verified,
    confidence,
    queryTitle: title,
    queryAuthor: author,
    title: g?.title || o?.title || title,
    authors: g?.authors?.length ? g.authors : o?.author_name?.length ? o.author_name : [author],
    publisher: g?.publisher || o?.publisher?.[0],
    publishedDate: g?.publishedDate,
    firstPublishYear: o?.first_publish_year,
    isbn13: googleIds.ISBN_13 || openIds.isbn13,
    isbn10: googleIds.ISBN_10 || openIds.isbn10,
    categories,
    subjects,
    description: g?.description || workDescription,
    sources,
  };
}

export function evidenceForPrompt(evidence: BookEvidence): string {
  return [
    `제목: ${evidence.title}`,
    `저자: ${evidence.authors.join(", ")}`,
    evidence.publisher ? `출판사: ${evidence.publisher}` : "",
    evidence.publishedDate ? `출판일: ${evidence.publishedDate}` : "",
    evidence.firstPublishYear ? `초판연도: ${evidence.firstPublishYear}` : "",
    evidence.isbn13 ? `ISBN-13: ${evidence.isbn13}` : "",
    evidence.isbn10 ? `ISBN-10: ${evidence.isbn10}` : "",
    evidence.categories.length ? `카테고리: ${evidence.categories.join(", ")}` : "",
    evidence.subjects.length ? `주제어: ${evidence.subjects.join(", ")}` : "",
    evidence.description ? `도서 설명: ${evidence.description.slice(0, 3500)}` : "",
    `확인 출처: ${evidence.sources.map((source) => source.provider).join(", ")}`,
  ].filter(Boolean).join("\n");
}
