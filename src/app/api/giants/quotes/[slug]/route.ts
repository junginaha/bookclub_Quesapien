import { NextRequest, NextResponse } from "next/server";
import { GIANTS } from "@/data/giants";

// Quotable API slug mappings
const QUOTABLE_SLUGS: Record<string, string> = {
  "friedrich-nietzsche": "friedrich-nietzsche",
  "immanuel-kant": "immanuel-kant",
  "arthur-schopenhauer": "arthur-schopenhauer",
  "albert-camus": "albert-camus",
  "simone-de-beauvoir": "simone-de-beauvoir",
  "virginia-woolf": "virginia-woolf",
  "yuval-harari": "yuval-noah-harari",
  "peter-drucker": "peter-drucker",
  "charlie-munger": "charlie-munger",
  "steve-jobs": "steve-jobs",
};

// Curated extra quotes for Korean authors (not in Quotable)
const EXTRA_QUOTES: Record<string, { content: string; source: string }[]> = {
  "han-kang": [
    { content: "우리는 끝까지 인간이고 싶다.", source: "소년이 온다" },
    { content: "아름다움은 폭력 옆에서도 살아남는다.", source: "채식주의자" },
    { content: "기억한다는 것은 그 사람 곁에 머문다는 것이다.", source: "작별하지 않는다" },
    { content: "쓴다는 것은 죽은 자들과 함께 앉는 일이다.", source: "흰" },
    { content: "인간이 된다는 것은 고통과 함께 산다는 것이다.", source: "소년이 온다" },
  ],
  "kim-young-ha": [
    { content: "독서는 타인의 내면으로 들어가는 가장 깊은 방법이다.", source: "여행의 이유" },
    { content: "이야기는 우리가 살아남는 방식이다.", source: "작별인사" },
    { content: "소설은 인간이 발명한 가장 오래된 가상현실이다.", source: "여행의 이유" },
    { content: "여행은 낯선 곳에서 자신을 발견하는 일이다.", source: "여행의 이유" },
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
