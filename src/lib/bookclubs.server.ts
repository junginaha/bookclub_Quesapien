// src/lib/bookclubs.ts의 서버 전용 부분. Supabase 서비스 클라이언트가
// next/headers를 물고 있어서 클라이언트 컴포넌트가 import하면 빌드가 깨진다 —
// 그래서 joinedCount 조회만 별도 파일로 뺐다. 서버 컴포넌트(page.tsx)에서만 쓴다.
import { createServiceClient } from "@/lib/supabase/server";

// Supabase(bookclub_applications) 연결 전까지만 쓰는 임시 폴백 — 운영자가 이번
// 세션에서 알려준 실제값. 연결되면 이 값은 더 이상 쓰이지 않는다(하드코딩 금지 원칙은
// getJoinedCount()의 DB 우선 조회로 지킨다).
const FALLBACK_JOINED_COUNTS: Record<string, number> = {
  "dangerous-leaders": 15,
  "met-guard": 0,
};

/** Supabase 실시간 조회 우선, 실패 시에만 폴백. 절대 클라이언트 값으로 정원 판단에 쓰지 않는다(서버 재검증은 별도). */
export async function getJoinedCount(slug: string): Promise<number> {
  try {
    const db = createServiceClient();
    const { count, error } = await db
      .from("bookclub_applications")
      .select("id", { count: "exact", head: true })
      .eq("club_slug", slug)
      .eq("status", "confirmed");
    if (error || count === null) throw error ?? new Error("no count");
    return count;
  } catch {
    return FALLBACK_JOINED_COUNTS[slug] ?? 0;
  }
}

export async function getJoinedCounts(slugs: string[]): Promise<Record<string, number>> {
  const entries = await Promise.all(slugs.map(async (slug) => [slug, await getJoinedCount(slug)] as const));
  return Object.fromEntries(entries);
}
