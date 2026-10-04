import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { BOOKCLUB_SESSIONS } from "@/lib/bookclub/data";
import { guideSitemapEntries } from "@/lib/guide-sitemap";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.qsapiens.com";

export const revalidate = 3600;

// 로그인/회원가입 같은 유틸리티 페이지는 제외. 정적 페이지는 실제 수정 시각을 알 수 없어
// lastModified를 넣지 않는다(매번 "지금"으로 찍으면 검색엔진이 신호를 무시한다).
const STATIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "daily", priority: 1.0 },
  { path: "/bookclub", changeFrequency: "daily", priority: 0.95 },
  { path: "/questions", changeFrequency: "daily", priority: 0.9 },
  { path: "/giants", changeFrequency: "weekly", priority: 0.8 },
  { path: "/archive", changeFrequency: "weekly", priority: 0.8 },
  { path: "/clubs", changeFrequency: "weekly", priority: 0.7 },
  { path: "/quiz", changeFrequency: "monthly", priority: 0.5 },
];

async function fetchDynamicEntries(): Promise<MetadataRoute.Sitemap> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  try {
    const db = createClient(url, key, { auth: { persistSession: false } });
    const [questions, clubs] = await Promise.all([
      db.from("questions").select("id, created_at").order("created_at", { ascending: false }).limit(5000),
      db.from("clubs").select("slug, created_at"),
    ]);

    const entries: MetadataRoute.Sitemap = [];
    for (const q of questions.data ?? []) {
      entries.push({
        url: `${SITE_URL}/questions/${q.id}`,
        ...(q.created_at ? { lastModified: new Date(q.created_at) } : {}),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
    for (const c of clubs.data ?? []) {
      if (!c.slug) continue;
      entries.push({
        url: `${SITE_URL}/clubs/${encodeURIComponent(c.slug)}`,
        ...(c.created_at ? { lastModified: new Date(c.created_at) } : {}),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
    return entries;
  } catch {
    // DB 연결 실패여도 사이트맵은 정적·북클럽 URL로 생성한다.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = Date.now();

  const staticPages: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));

  // BookClub — src/lib/bookclub/data.ts(단일 소스)의 실제 세션만. 지난 모임만 내용이
  // 확정되므로 endsAt을 lastModified로 쓴다.
  const bookclubPages: MetadataRoute.Sitemap = BOOKCLUB_SESSIONS.map((session) => {
    const past = new Date(session.endsAt).getTime() < now;
    return {
      url: `${SITE_URL}/bookclub/${session.slug}`,
      ...(past ? { lastModified: new Date(session.endsAt) } : {}),
      changeFrequency: past ? "monthly" : "weekly",
      priority: past ? 0.5 : 0.8,
    };
  });

  return [...staticPages, ...bookclubPages, ...guideSitemapEntries(), ...(await fetchDynamicEntries())];
}
