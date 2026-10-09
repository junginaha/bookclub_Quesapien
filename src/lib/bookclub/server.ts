// 서버 전용 — Supabase 서비스 클라이언트가 next/headers를 물고 있어서 클라이언트
// 컴포넌트가 import하면 빌드가 깨진다. reserved(실시간 신청 인원) 조회만 여기 둔다.
import { createServiceClient } from "@/lib/supabase/server";
import { BOOKCLUB_SESSIONS } from "./data";
import type { BookClubSession } from "./types";

// Supabase(bookclub_applications) 연결 실패 시에만 쓰는 폴백 — 운영자가 확인해 준 값.
// DB 우선 조회 원칙은 getReservedCount()가 지킨다(하드코딩 금지, §작업원칙4).
const FALLBACK_RESERVED: Record<string, number> = {
  "dangerous-leaders": 15,
  "met-guard": 0,
};

/** Supabase 실시간 조회 우선, 실패 시에만 폴백. */
export async function getReservedCount(slug: string): Promise<number> {
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
    return FALLBACK_RESERVED[slug] ?? 0;
  }
}

export async function getReservedCounts(slugs: string[]): Promise<Record<string, number>> {
  const entries = await Promise.all(slugs.map(async (slug) => [slug, await getReservedCount(slug)] as const));
  return Object.fromEntries(entries);
}

/**
 * "다시 함께 읽어요" 활성 신청 수(bookclub_encore_counts 뷰, 023 마이그레이션).
 * 뷰가 아직 없거나 DB 연결 실패 시 null — 화면은 숫자를 숨기고 신청만 받는다
 * (집계를 모르는데 0명으로 보여주지 않는다 — 참여자 수 임의 표기 금지).
 */
export async function getEncoreCounts(): Promise<Record<string, number> | null> {
  try {
    const db = createServiceClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const { data, error } = await db.from("bookclub_encore_counts").select("club_slug, encore_count");
    if (error || !data) throw error ?? new Error("no data");
    return Object.fromEntries((data as Array<{ club_slug: string; encore_count: number }>).map((r) => [r.club_slug, r.encore_count]));
  } catch {
    return null;
  }
}

/** 세션 배열 + 실시간 reserved(+앵콜 집계)를 합쳐서 반환한다 — 서버 컴포넌트에서만 호출. */
export async function getSessionsWithReserved(): Promise<BookClubSession[]> {
  const [counts, encore] = await Promise.all([
    getReservedCounts(BOOKCLUB_SESSIONS.map((s) => s.slug)),
    getEncoreCounts(),
  ]);
  return BOOKCLUB_SESSIONS.map((s) => ({
    ...s,
    reserved: counts[s.slug] ?? 0,
    encoreCount: encore ? encore[s.slug] ?? 0 : undefined,
  }));
}
