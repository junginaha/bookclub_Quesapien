"use server";

// /bookclub 신청·대기자 서버 액션. 정원 재검증은 전부 DB(apply_to_bookclub RPC,
// supabase/migrations/021_bookclub_applications.sql)에서 어드바이저리 락으로
// 원자적으로 처리한다 — 여기서는 입력 검증·요청 빈도 제한·club 존재 확인만 한다.

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { getBookClub } from "@/lib/bookclubs";

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 8;
const attempts = new Map<string, { count: number; resetAt: number }>();

async function clientKey(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

async function isRateLimited(): Promise<boolean> {
  const now = Date.now();
  const key = await clientKey();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  current.count += 1;
  if (attempts.size > 500) {
    for (const [k, v] of attempts) if (v.resetAt <= now) attempts.delete(k);
  }
  return current.count > RATE_LIMIT;
}

function normalizePhone(input: string): string {
  return input.replace(/\D/g, "");
}

function databaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

export type ApplyResult =
  | { ok: true; kind: "confirmed" }
  | { ok: true; kind: "just_filled_waitlisted" }
  | { ok: true; kind: "duplicate" }
  | { ok: false; error: string };

export async function applyToBookClub(input: {
  clubSlug: string;
  name: string;
  phone: string;
  email: string;
  note: string;
  website: string; // 허니팟 — 화면엔 숨겨져 있고 사람은 채우지 않는다
}): Promise<ApplyResult> {
  if (input.website.trim()) {
    // 봇으로 판단 — 실패로 보이지 않게 조용히 성공 응답만 흉내내지 않고 명확한 에러로 끊는다.
    return { ok: false, error: "신청을 확인하지 못했습니다." };
  }
  if (await isRateLimited()) {
    return { ok: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." };
  }
  if (!databaseConfigured()) {
    return { ok: false, error: "신청 시스템 연결이 준비되지 않았습니다." };
  }

  const name = input.name.trim();
  const phone = normalizePhone(input.phone);
  if (!name || name.length > 80) return { ok: false, error: "이름을 확인해 주세요." };
  if (phone.length < 9 || phone.length > 15) return { ok: false, error: "휴대전화 번호를 확인해 주세요." };

  const club = getBookClub(input.clubSlug);
  if (!club) return { ok: false, error: "모임 정보를 찾을 수 없습니다." };
  if (new Date(club.startAt).getTime() <= Date.now()) {
    return { ok: false, error: "이미 지난 모임입니다." };
  }
  if (club.isTentative) {
    return { ok: false, error: "아직 책을 고르는 중인 모임입니다." };
  }

  try {
    const db = createServiceClient();
    const { data, error } = await db.rpc("apply_to_bookclub", {
      p_club_slug: club.slug,
      p_capacity: club.capacity,
      p_name: name,
      p_phone: phone,
      p_email: input.email.trim() || null,
      p_note: input.note.trim() || null,
    });
    if (error) return { ok: false, error: "신청 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." };

    const kind = (data as { kind?: string } | null)?.kind;
    revalidatePath("/bookclub");
    revalidatePath(`/bookclub/${club.slug}`);

    if (kind === "confirmed") return { ok: true, kind: "confirmed" };
    if (kind === "just_filled_waitlisted") return { ok: true, kind: "just_filled_waitlisted" };
    if (kind === "duplicate") return { ok: true, kind: "duplicate" };
    return { ok: false, error: "신청 결과를 확인하지 못했습니다." };
  } catch {
    return { ok: false, error: "신청 시스템에 연결하지 못했습니다." };
  }
}

export type WaitlistResult =
  | { ok: true; kind: "joined" }
  | { ok: true; kind: "duplicate" }
  | { ok: false; error: string };

export async function joinBookClubWaitlist(input: {
  clubSlug: string | null;
  name: string;
  phone: string;
  website: string;
}): Promise<WaitlistResult> {
  if (input.website.trim()) {
    return { ok: false, error: "요청을 확인하지 못했습니다." };
  }
  if (await isRateLimited()) {
    return { ok: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." };
  }
  if (!databaseConfigured()) {
    return { ok: false, error: "연결이 준비되지 않았습니다." };
  }

  const name = input.name.trim();
  const phone = normalizePhone(input.phone);
  if (!name || name.length > 80) return { ok: false, error: "이름을 확인해 주세요." };
  if (phone.length < 9 || phone.length > 15) return { ok: false, error: "휴대전화 번호를 확인해 주세요." };

  if (input.clubSlug && !getBookClub(input.clubSlug)) {
    return { ok: false, error: "모임 정보를 찾을 수 없습니다." };
  }

  try {
    const db = createServiceClient();
    const { data, error } = await db.rpc("join_bookclub_waitlist", {
      p_club_slug: input.clubSlug,
      p_name: name,
      p_phone: phone,
    });
    if (error) return { ok: false, error: "처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." };

    const kind = (data as { kind?: string } | null)?.kind;
    if (input.clubSlug) revalidatePath(`/bookclub/${input.clubSlug}`);
    revalidatePath("/bookclub");

    if (kind === "joined") return { ok: true, kind: "joined" };
    if (kind === "duplicate") return { ok: true, kind: "duplicate" };
    return { ok: false, error: "결과를 확인하지 못했습니다." };
  } catch {
    return { ok: false, error: "연결하지 못했습니다." };
  }
}
