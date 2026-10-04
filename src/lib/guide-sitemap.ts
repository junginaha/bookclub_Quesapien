import type { MetadataRoute } from "next";
import { activeGuides } from "@/content/ai-guides";
import { CLUB } from "@/content/club-facts";

/** 기존 app/sitemap.ts의 반환 배열에 펼쳐 넣는다: [...기존, ...guideSitemapEntries()] */
export function guideSitemapEntries(): MetadataRoute.Sitemap {
  const lastModified = new Date(CLUB.lastVerified);
  return [
    { url: `${CLUB.siteUrl}/guide`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    ...activeGuides().map((g) => ({
      url: `${CLUB.siteUrl}/guide/${g.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
