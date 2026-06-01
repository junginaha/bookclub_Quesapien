import { NextRequest, NextResponse } from "next/server";

const WIKI_TITLES: Record<string, string> = {
  "friedrich-nietzsche": "Friedrich_Nietzsche",
  "immanuel-kant": "Immanuel_Kant",
  "arthur-schopenhauer": "Arthur_Schopenhauer",
  "albert-camus": "Albert_Camus",
  "simone-de-beauvoir": "Simone_de_Beauvoir",
  "virginia-woolf": "Virginia_Woolf",
  "yuval-harari": "Yuval_Noah_Harari",
  "peter-drucker": "Peter_Drucker",
  "charlie-munger": "Charlie_Munger",
  "steve-jobs": "Steve_Jobs",
  "han-kang": "Han_Kang",
  "kim-young-ha": "Kim_Young-ha",
};

const cache = new Map<string, { summary: string; ts: number }>();
const TTL = 1000 * 60 * 60 * 24; // 24h

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cached = cache.get(slug);
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json({ summary: cached.summary, source: "cache" });
  }

  const title = WIKI_TITLES[slug];
  if (!title) return NextResponse.json({ summary: "", source: "none" });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
      { signal: controller.signal, headers: { "Accept": "application/json" } }
    );
    clearTimeout(timeout);

    if (!res.ok) throw new Error("wiki fetch failed");
    const data = await res.json();
    const summary: string = data.extract ?? "";
    cache.set(slug, { summary, ts: Date.now() });
    return NextResponse.json({ summary, source: "wikipedia" });
  } catch {
    return NextResponse.json({ summary: "", source: "error" });
  }
}
