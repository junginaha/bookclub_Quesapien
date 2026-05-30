import type { MetadataRoute } from "next";
import { GIANTS } from "@/data/giants";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quesapience.com";

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

  // Giants — one page per thinker (high content value)
  const giantPages: MetadataRoute.Sitemap = GIANTS.map((giant) => ({
    url: `${SITE_URL}/giants/${giant.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  // BookClub slugs — static known slugs
  const bookclubSlugs = [
    "다정함의-발명",
    "혼자라는-감각",
    "아무도-보지-않는-오후",
    "외로움-시즌-위크4",
    "오늘-저녁-당신께",
    "인간이라는-풍경",
  ];
  const bookclubPages: MetadataRoute.Sitemap = bookclubSlugs.map((slug) => ({
    url: `${SITE_URL}/bookclub/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...giantPages, ...bookclubPages];
}
