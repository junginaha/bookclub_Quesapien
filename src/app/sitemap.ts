import type { MetadataRoute } from "next";
import { REAL_CLUBS } from "@/lib/bookclub";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://jilmunhaneun-saramdeul.vercel.app").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const publicPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/questions`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/bookclub`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/archive`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/giants`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const bookclubPages: MetadataRoute.Sitemap = REAL_CLUBS
    .filter((club) => !club.is_seed && Boolean(club.slug))
    .map((club) => {
      const eventDate = club.event_starts_at ? new Date(club.event_starts_at) : null;
      const isUpcoming = Boolean(eventDate && eventDate.getTime() >= now.getTime());

      return {
        url: `${SITE_URL}/bookclub/${encodeURIComponent(club.slug)}`,
        lastModified: eventDate ?? now,
        changeFrequency: isUpcoming ? ("weekly" as const) : ("monthly" as const),
        priority: isUpcoming ? 0.85 : 0.65,
      };
    });

  return [...publicPages, ...bookclubPages];
}
