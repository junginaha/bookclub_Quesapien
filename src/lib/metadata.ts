/**
 * Centralized metadata factory for AEO/GEO-optimized pages.
 * All pages use this to ensure consistent OG, Twitter Card,
 * canonical URLs, and AI-friendly descriptions.
 */
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quesapience.com";
const SITE_NAME = "질문하는 사람들";
// Dynamic OG image via /og route (Next.js ImageResponse)
function makeOgImageUrl(title: string, sub?: string): string {
  const params = new URLSearchParams({ title });
  if (sub) params.set("sub", sub);
  return `${SITE_URL}/og?${params.toString()}`;
}
interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  /** Override OG image (absolute URL). Defaults to site-wide OG. */
  image?: string;
  /** Schema.org type hint for AI engines */
  type?: "website" | "article" | "profile" | "book" | "event";
  keywords?: string[];
  publishedAt?: string;
  author?: string;
  noIndex?: boolean;
}

export function buildMetadata(input: PageMetaInput): Metadata {
  const canonical = `${SITE_URL}${input.path}`;
  const image = input.image ?? makeOgImageUrl(input.title, input.description?.slice(0, 80));
  const ogType = input.type === "article" ? "article" : "website";

  return {
    title: input.title,
    description: input.description,
    keywords: [
      "북클럽",
      "독서모임",
      "질문",
      "서초구",
      "오프라인 독서",
      "북토크",
      ...(input.keywords ?? []),
    ],
    authors: input.author ? [{ name: input.author }] : [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical },
    robots: input.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
        },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: ogType,
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
      ...(input.publishedAt && ogType === "article" ? { publishedTime: input.publishedAt } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
      creator: "@quesapience",
      site: "@quesapience",
    },
    // For AI engines: provide structured hints
    other: {
      "application-name": SITE_NAME,
      "og:locale:alternate": "en_US",
    },
  };
}

/** Shorthand for the root/home page */
export const homeMetadata: Metadata = buildMetadata({
  title: "질문하는 사람들 — 미래혁신형 북클럽",
  description:
    "질문하는 사람들은 질문을 중심으로 사람과 책을 연결하는 오프라인 북토크 커뮤니티입니다. 서초구 선정 미래혁신형 북클럽. 질문 → 책 → 대화 → 사람 → 성장.",
  path: "/",
  keywords: ["질문하는사람들", "Quesapience", "서초구북클럽", "미래혁신형북클럽"],
  type: "website",
});
