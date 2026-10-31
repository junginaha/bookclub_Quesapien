// 서버 전용 — Supabase 서비스 클라이언트가 next/headers를 물고 있어서 클라이언트
// 컴포넌트가 import하면 빌드가 깨진다. reserved(실시간 신청 인원) 조회만 여기 둔다.
import { createServiceClient } from "@/lib/supabase/server";
import { BOOKCLUB_SESSIONS } from "./data";
import type { BookClubSession } from "./types";
import { interestKey } from "./interest";

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

/** 세션 배열 + 실시간 reserved를 합쳐서 반환한다 — 서버 컴포넌트에서만 호출. */
export async function getSessionsWithReserved(): Promise<BookClubSession[]> {
  const counts = await getReservedCounts(BOOKCLUB_SESSIONS.map((s) => s.slug));
  return BOOKCLUB_SESSIONS.map((s) => ({ ...s, reserved: counts[s.slug] ?? 0 }));
}

/**
 * "함께 읽고 싶은 책" 관심 인원 — 키별 고유 전화번호 수(next-* 카드 + rec: 회원 추천 + 지난 모임 앵콜).
 * 개인정보는 반환하지 않는다. 연결 실패 시 빈 객체(화면은 인원 숫자 없이 기본 문구).
 */
export async function getInterestCounts(sessionSlugs: string[] = []): Promise<Record<string, number>> {
  try {
    const db = createServiceClient();
    const [next, rec, past] = await Promise.all([
      db.from("bookclub_waitlist").select("club_slug, phone").like("club_slug", "next-%"),
      db.from("bookclub_waitlist").select("club_slug, phone").like("club_slug", "rec:%"),
      sessionSlugs.length
        ? db.from("bookclub_waitlist").select("club_slug, phone").in("club_slug", sessionSlugs)
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (next.error || rec.error || past.error) throw next.error ?? rec.error ?? past.error;
    const sets = new Map<string, Set<string>>();
    const rows = [...(next.data ?? []), ...(rec.data ?? []), ...(past.data ?? [])] as { club_slug: string; phone: string }[];
    for (const row of rows) {
      // 지난 모임 slug는 그대로 키로 쓴다(앵콜 관심 인원)
      const key = sessionSlugs.includes(row.club_slug) ? row.club_slug : interestKey(row.club_slug);
      if (!key) continue;
      if (!sets.has(key)) sets.set(key, new Set());
      sets.get(key)!.add(row.phone);
    }
    return Object.fromEntries([...sets].map(([k, v]) => [k, v.size]));
  } catch {
    return {};
  }
}

/**
 * 지난 회차에 **실제로 온** 사람 수 — 노쇼를 줄이는 규범 신호에 쓴다.
 *
 * 근거: Martin·Bassi·Dunbar-Rees, *Commitments, norms and custard creams*
 * (J R Soc Med 2012) — 빠진 사람 수가 아니라 **온 사람 수**를 게시하자 결석이 줄었다.
 *
 * 027(출석 기록)이 없거나 아직 아무도 출석 처리하지 않았으면 **0을 돌려준다** —
 * 화면은 0이면 아무 문구도 쓰지 않는다. 예약 수로 대신 세지 않는다(그건 참석이 아니고,
 * 정원에서 역산되면 '자리 수 비공개' 결정과도 어긋난다).
 */
export async function getAttendedCount(slugs: string[]): Promise<number> {
  if (!slugs.length) return 0;
  try {
    const db = createServiceClient();
    const { count, error } = await db
      .from("bookclub_applications")
      .select("id", { count: "exact", head: true })
      .in("club_slug", slugs)
      .eq("status", "confirmed")
      .not("attended_at", "is", null);
    if (error) return 0; // 027 미적용 등 — 조용히 0, 화면은 아무 말도 하지 않는다
    return count ?? 0;
  } catch {
    return 0;
  }
}

export interface PublishedReview { id: string; clubSlug: string; authorName: string; content: string; publishedAt: string | null }

/**
 * 공개된 모임 후기. **전화번호는 조회하지 않는다**(화면에 나갈 일이 없다).
 * 028 미적용이거나 아직 아무 글도 공개되지 않았으면 빈 배열 — 화면은 섹션을 숨긴다.
 * 후기는 지어내지 않으므로, 비어 있으면 비어 있는 채로 보여준다.
 */
export async function getPublishedReviews(slugs: string[]): Promise<PublishedReview[]> {
  if (!slugs.length) return [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createServiceClient() as any;
    const { data, error } = await db
      .from("bookclub_reviews")
      .select("id, club_slug, author_name, content, published_at")
      .in("club_slug", slugs)
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(50);
    if (error) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((r: any) => ({
      id: r.id, clubSlug: r.club_slug, authorName: r.author_name, content: r.content, publishedAt: r.published_at,
    }));
  } catch {
    return [];
  }
}

/** 내가 이미 남긴 후기(회차별). 내 북클럽에서 "고치기"로 보여준다. */
export async function getMyReviews(phone: string): Promise<Record<string, { content: string; published: boolean }>> {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 9) return {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createServiceClient() as any;
    const { data, error } = await db
      .from("bookclub_reviews")
      .select("club_slug, content, is_published")
      .eq("phone", digits);
    if (error) return {};
    const out: Record<string, { content: string; published: boolean }> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const r of data ?? []) out[r.club_slug] = { content: r.content, published: r.is_published };
    return out;
  } catch {
    return {};
  }
}
