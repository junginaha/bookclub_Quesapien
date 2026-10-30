"use server";

// /bookclub 신청·대기자 서버 액션. 정원 재검증은 전부 DB(apply_to_bookclub RPC,
// supabase/migrations/021_bookclub_applications.sql)에서 어드바이저리 락으로
// 원자적으로 처리한다 — 여기서는 입력 검증·요청 빈도 제한·club 존재 확인만 한다.

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/bookclub/data";
import { getUpcomingBook } from "@/lib/bookclub/upcoming";
import { isPast } from "@/lib/bookclub/selectors";
import { buildRecSlug, titleKey } from "@/lib/bookclub/interest";
import { getViewer } from "@/lib/viewer";

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

/**
 * 예약에 쓴 번호를 프로필에 채운다 — **비어 있을 때만.**
 *
 * `/mypage`는 `bookclub_applications.phone`을 **프로필 전화번호**로 조회한다
 * (`bookclub_applications`에 user_id 컬럼이 없어 번호가 유일한 연결고리다).
 * 그런데 카카오·구글 로그인은 전화번호를 주지 않으므로, 온보딩에서 번호를 넣지
 * 않은 사람은 예약 시트에 번호를 직접 입력하고도 **자기 예약을 내 북클럽에서
 * 영영 못 봤다** — 취소도 거기서만 되니 취소할 방법도 없었다.
 *
 * 이미 번호가 있는데 다른 번호로 예약한 경우는 **덮어쓰지 않는다** — 사용자가
 * 저장해 둔 연락처를 말없이 바꾸지 않기 위해서다(그 경우 안내는 /mypage 빈 화면에서).
 * 수집·이용 동의는 예약 시 이미 받았고, 쓰임(모임 안내 연락)도 같다.
 */
async function backfillProfilePhone(phone: string): Promise<void> {
  try {
    const viewer = await getViewer();
    if (!viewer || viewer.phone.replace(/\D/g, "")) return; // 미로그인이거나 이미 번호가 있다
    const db = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).from("profiles").update({ phone }).eq("id", viewer.id);
  } catch {
    // 예약 자체는 이미 성공했다 — 여기서 실패해도 신청을 되돌리지 않는다.
  }
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

  const club = getSession(input.clubSlug);
  if (!club) return { ok: false, error: "모임 정보를 찾을 수 없습니다." };
  if (isPast(club)) {
    return { ok: false, error: "이미 지난 모임입니다." };
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

    if (kind === "confirmed" || kind === "just_filled_waitlisted" || kind === "duplicate") {
      await backfillProfilePhone(phone);
      revalidatePath("/mypage");
    }
    if (kind === "confirmed") return { ok: true, kind: "confirmed" };
    if (kind === "just_filled_waitlisted") return { ok: true, kind: "just_filled_waitlisted" };
    if (kind === "duplicate") return { ok: true, kind: "duplicate" };
    return { ok: false, error: "신청 결과를 확인하지 못했습니다." };
  } catch {
    return { ok: false, error: "신청 시스템에 연결하지 못했습니다." };
  }
}

export type WaitlistResult =
  | { ok: true; kind: "joined"; count?: number }
  | { ok: true; kind: "duplicate"; count?: number }
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

  if (input.clubSlug && !getSession(input.clubSlug) && !getUpcomingBook(input.clubSlug)) {
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
    // 대기도 /mypage가 번호로 찾는다 — 예약과 같은 이유로 프로필 번호를 채운다.
    if (kind === "joined" || kind === "duplicate") {
      await backfillProfilePhone(phone);
      revalidatePath("/mypage");
    }

    const pastSession = input.clubSlug ? getSession(input.clubSlug) : undefined;
    const count =
      input.clubSlug && (input.clubSlug.startsWith("next-") || (pastSession && isPast(pastSession)))
        ? await countInterest(input.clubSlug)
        : undefined;
    if (kind === "joined") return { ok: true, kind: "joined", count };
    if (kind === "duplicate") return { ok: true, kind: "duplicate", count };
    return { ok: false, error: "결과를 확인하지 못했습니다." };
  } catch {
    return { ok: false, error: "연결하지 못했습니다." };
  }
}

/** 같은 책(next-* slug 또는 rec: 제목 키)에 등록한 고유 번호 수. 실패하면 undefined. */
async function countInterest(slugOrRecPrefix: string): Promise<number | undefined> {
  try {
    const db = createServiceClient();
    const q = db.from("bookclub_waitlist").select("phone");
    const { data, error } = slugOrRecPrefix.startsWith("rec:")
      ? await q.like("club_slug", `${slugOrRecPrefix}|%`)
      : await q.eq("club_slug", slugOrRecPrefix);
    if (error) return undefined;
    return new Set((data ?? []).map((r: { phone: string }) => r.phone)).size;
  } catch {
    return undefined;
  }
}

/** "함께 읽고 싶은 책 추천하기" — 목록에 없는 책을 추천. 같은 제목이 5명 모이면 운영자가 연락한다. */
export async function recommendBook(input: {
  title: string;
  author: string;
  name: string;
  phone: string;
  method?: string;
  memo?: string;
  consent?: boolean;
  website: string;
}): Promise<WaitlistResult> {
  if (input.website.trim()) return { ok: false, error: "요청을 확인하지 못했습니다." };
  if (input.consent === false) return { ok: false, error: "개인정보 수집·이용에 동의해 주세요." };
  if (await isRateLimited()) return { ok: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." };
  if (!databaseConfigured()) return { ok: false, error: "연결이 준비되지 않았습니다." };

  const title = input.title.trim();
  const author = input.author.trim();
  const name = input.name.trim();
  const phone = normalizePhone(input.phone);
  if (!title || title.length > 80 || !titleKey(title)) return { ok: false, error: "책 제목을 확인해 주세요." };
  if (author.length > 60) return { ok: false, error: "저자 이름을 확인해 주세요." };
  if (!name || name.length > 80) return { ok: false, error: "이름을 확인해 주세요." };
  if (phone.length < 9 || phone.length > 15) return { ok: false, error: "휴대전화 번호를 확인해 주세요." };

  const slug = buildRecSlug(title, author);
  try {
    const db = createServiceClient();
    // 같은 제목 키에 이미 등록한 번호면 중복 처리(저자 표기가 달라도 한 책으로 본다)
    const { data: existing } = await db
      .from("bookclub_waitlist")
      .select("id")
      .like("club_slug", `rec:${titleKey(title)}|%`)
      .eq("phone", phone)
      .limit(1);
    if (existing && existing.length) {
      return { ok: true, kind: "duplicate", count: await countInterest(`rec:${titleKey(title)}`) };
    }
    const res = await saveInterest(db, slug, name, phone, input.method, input.memo);
    if (!res.ok) return { ok: false, error: "처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." };
    const kind = res.kind;
    revalidatePath("/");
    revalidatePath("/bookclub");
    const count = await countInterest(`rec:${titleKey(title)}`);
    if (kind === "joined") return { ok: true, kind: "joined", count };
    if (kind === "duplicate") return { ok: true, kind: "duplicate", count };
    return { ok: false, error: "결과를 확인하지 못했습니다." };
  } catch {
    return { ok: false, error: "연결하지 못했습니다." };
  }
}


const CONTACT_METHODS = ["sms", "kakao", "call"] as const;

/**
 * 관심 등록 저장 — 023의 join_bookclub_interest(답변 방법·남기실 말 포함)를 먼저 쓰고,
 * 운영 DB에 아직 023이 없으면 021의 join_bookclub_waitlist(이름·번호만)로 저장한다.
 */
async function saveInterest(
  db: ReturnType<typeof createServiceClient>,
  slug: string,
  name: string,
  phone: string,
  method?: string,
  memo?: string,
): Promise<{ ok: true; kind?: string } | { ok: false }> {
  const m = CONTACT_METHODS.includes(method as (typeof CONTACT_METHODS)[number]) ? method : "sms";
  const v2 = await db.rpc("join_bookclub_interest", {
    p_club_slug: slug,
    p_name: name,
    p_phone: phone,
    p_method: m,
    p_memo: (memo ?? "").trim().slice(0, 500),
  });
  if (!v2.error) return { ok: true, kind: (v2.data as { kind?: string } | null)?.kind };
  const v1 = await db.rpc("join_bookclub_waitlist", { p_club_slug: slug, p_name: name, p_phone: phone });
  if (!v1.error) return { ok: true, kind: (v1.data as { kind?: string } | null)?.kind };
  console.error("[bookclub] interest save failed", { v2: v2.error?.message, v1: v1.error?.message });
  return { ok: false };
}

/** "읽고 싶어요" — 오픈 예정 책(next-*)·지난 모임 slug에 관심 등록. 같은 책 5명이 모이면 운영자가 연락. */
export async function registerInterest(input: {
  clubSlug: string;
  name: string;
  phone: string;
  method: string;
  memo: string;
  consent: boolean;
  website: string;
}): Promise<WaitlistResult> {
  if (input.website.trim()) return { ok: false, error: "요청을 확인하지 못했습니다." };
  if (!input.consent) return { ok: false, error: "개인정보 수집·이용에 동의해 주세요." };
  if (await isRateLimited()) return { ok: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." };
  if (!databaseConfigured()) return { ok: false, error: "연결이 준비되지 않았습니다." };

  const name = input.name.trim();
  const phone = normalizePhone(input.phone);
  if (!name || name.length > 80) return { ok: false, error: "이름을 확인해 주세요." };
  if (phone.length < 9 || phone.length > 15) return { ok: false, error: "전화번호를 확인해 주세요." };
  if (input.memo.length > 500) return { ok: false, error: "남기실 말은 500자까지 적을 수 있어요." };

  const session = getSession(input.clubSlug);
  if (!getUpcomingBook(input.clubSlug) && !(session && isPast(session))) {
    return { ok: false, error: "책 정보를 찾을 수 없습니다." };
  }

  try {
    const db = createServiceClient();
    const res = await saveInterest(db, input.clubSlug, name, phone, input.method, input.memo);
    if (!res.ok) return { ok: false, error: "처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." };
    revalidatePath("/");
    revalidatePath("/bookclub");
    const count = await countInterest(input.clubSlug);
    if (res.kind === "duplicate") return { ok: true, kind: "duplicate", count };
    return { ok: true, kind: "joined", count };
  } catch {
    return { ok: false, error: "연결하지 못했습니다." };
  }
}
