import type { MetadataRoute } from "next";
import { BOOKCLUBS } from "@/lib/bookclubs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.qsapiens.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages — highest priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/questions`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/bookclub`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/giants`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/archive`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/questions/create`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/quiz`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/signup`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // BookClub — src/lib/bookclubs.ts(단일 소스)의 실제 클럽만, 가짜 슬러그 없음.
  const bookclubPages: MetadataRoute.Sitemap = BOOKCLUBS.map((club) => ({
    url: `${SITE_URL}/bookclub/${club.slug}`,
    lastModified: now,
    changeFrequency: new Date(club.startAt).getTime() > Date.now() ? "weekly" : "monthly",
    priority: new Date(club.startAt).getTime() > Date.now() ? 0.8 : 0.5,
  }));

  return [...staticPages, ...bookclubPages];
}
