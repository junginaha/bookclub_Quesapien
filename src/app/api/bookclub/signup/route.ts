import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

interface ClubRow {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  event_starts_at: string | null;
  registration_closes_at: string | null;
  max_participants: number | null;
  status: string | null;
  is_seed: boolean | null;
}

interface ReservationRpcResult {
  kind: "signup" | "wait";
  position?: number | null;
  duplicate?: boolean;
  cancelToken?: string;
}

function noStoreJson(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

function databaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

function normalizeContact(input: string): { display: string; normalized: string } | null {
  const display = input.trim();
  if (!display || display.length > 120) return null;

  if (display.includes("@")) {
    const email = display.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
    return { display, normalized: `email:${email}` };
  }

  const digits = display.replace(/\D/g, "");
  if (!/^0\d{9,10}$/.test(digits)) return null;
  return { display, normalized: `phone:${digits}` };
}

function clientKey(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(req: NextRequest) {
  const now = Date.now();
  const key = clientKey(req);
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  current.count += 1;
  if (attempts.size > 500) {
    for (const [candidate, value] of attempts) {
      if (value.resetAt <= now) attempts.delete(candidate);
    }
  }
  return current.count > RATE_LIMIT;
}

function reservationWindow(club: ClubRow) {
  if (club.is_seed || !["active", "upcoming"].includes(club.status ?? "active")) {
    return { accepting: false as const, reason: "현재 모집 중인 북클럽이 아닙니다." };
  }
  if (!club.event_starts_at || !club.max_participants || club.max_participants < 1) {
    return { accepting: false as const, reason: "예약 정보가 아직 준비되지 않았습니다." };
  }
  const now = Date.now();
  const startsAt = new Date(club.event_starts_at).getTime();
  const closesAt = new Date(club.registration_closes_at ?? club.event_starts_at).getTime();
  if (!Number.isFinite(startsAt) || !Number.isFinite(closesAt)) {
    return { accepting: false as const, reason: "예약 일정 정보가 올바르지 않습니다." };
  }
  if (now >= startsAt || now > closesAt) {
    return { accepting: false as const, reason: "이 북클럽의 예약이 마감되었습니다." };
  }
  return { accepting: true as const };
}

async function findClub(slug: string): Promise<{ club: ClubRow | null; error: unknown }> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("landing_book_clubs")
    .select(
      "id, slug, title, location, event_starts_at, registration_closes_at, max_participants, status, is_seed"
    )
    .eq("slug", slug)
    .maybeSingle();
  return { club: (data as ClubRow | null) ?? null, error };
}

/** 예약 UI가 데이터베이스/RPC 준비 상태와 현재 접수 유형을 변경 없이 확인한다. */
export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug")?.trim();
  if (!slug || slug.length > 120) return noStoreJson({ ready: false, error: "북클럽 정보가 필요합니다." }, 400);
  if (!databaseConfigured()) {
    return noStoreJson({ ready: false, error: "예약 시스템 연결이 준비되지 않았습니다." }, 503);
  }

  try {
    const { club, error } = await findClub(slug);
    if (error) return noStoreJson({ ready: false, error: "예약 시스템을 준비 중입니다." }, 503);
    if (!club) return noStoreJson({ ready: false, error: "북클럽을 찾을 수 없습니다." }, 404);

    const window = reservationWindow(club);
    if (!window.accepting) {
      return noStoreJson({ ready: true, accepting: false, error: window.reason }, 200);
    }

    const db = createServiceClient();
    const { data: counts, error: countsError } = await db
      .from("landing_book_club_signup_counts")
      .select("applied_count")
      .eq("club_id", club.id)
      .maybeSingle();
    if (countsError) return noStoreJson({ ready: false, error: "예약 시스템을 준비 중입니다." }, 503);

    const applied = Number((counts as { applied_count?: number } | null)?.applied_count ?? 0);
    return noStoreJson({
      ready: true,
      accepting: true,
      mode: applied >= (club.max_participants ?? 0) ? "wait" : "signup",
    });
  } catch {
    return noStoreJson({ ready: false, error: "예약 시스템에 연결하지 못했습니다." }, 503);
  }
}

/** 이름·연락처 기반 실제 예약. 정원 판정과 중복 방지는 DB 트랜잭션에서 처리한다. */
export async function POST(req: NextRequest) {
  if (!databaseConfigured()) {
    return noStoreJson({ error: "예약 시스템 연결이 준비되지 않았습니다." }, 503);
  }
  if (isRateLimited(req)) {
    return noStoreJson({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, 429);
  }

  let body: {
    slug?: unknown;
    name?: unknown;
    contact?: unknown;
    privacyAccepted?: unknown;
    subscribe?: unknown;
    website?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return noStoreJson({ error: "잘못된 요청입니다." }, 400);
  }

  // 화면에는 보이지 않는 필드. 자동 입력 봇의 대량 예약을 저장 전에 차단한다.
  if (typeof body.website === "string" && body.website.trim()) {
    return noStoreJson({ error: "예약 요청을 확인하지 못했습니다." }, 400);
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const contact = typeof body.contact === "string" ? normalizeContact(body.contact) : null;
  const subscribe = body.subscribe === true;
  if (!slug || slug.length > 120 || !name || name.length > 40) {
    return noStoreJson({ error: "이름과 북클럽 정보를 확인해 주세요." }, 400);
  }
  if (!contact) {
    return noStoreJson({ error: "휴대전화 번호 또는 이메일을 올바르게 입력해 주세요." }, 400);
  }
  if (body.privacyAccepted !== true) {
    return noStoreJson({ error: "예약 처리를 위한 개인정보 수집 동의가 필요합니다." }, 400);
  }

  try {
    const { club, error: clubError } = await findClub(slug);
    if (clubError) return noStoreJson({ error: "예약 시스템을 준비 중입니다." }, 503);
    if (!club) return noStoreJson({ error: "북클럽을 찾을 수 없습니다." }, 404);

    const window = reservationWindow(club);
    if (!window.accepting) return noStoreJson({ error: window.reason }, 410);

    const db = createServiceClient();
    const { data, error } = await db.rpc("reserve_book_club_spot", {
      p_club_id: club.id,
      p_name: name,
      p_contact: contact.display,
      p_contact_normalized: contact.normalized,
      p_subscribe: subscribe,
      p_privacy_accepted: true,
    });

    if (error) {
      const message = `${error.message ?? ""} ${error.details ?? ""}`;
      if (message.includes("reservation_closed")) return noStoreJson({ error: "이 북클럽의 예약이 마감되었습니다." }, 410);
      if (message.includes("club_not_found")) return noStoreJson({ error: "북클럽을 찾을 수 없습니다." }, 404);
      if (message.includes("club_unavailable")) return noStoreJson({ error: "현재 모집 중인 북클럽이 아닙니다." }, 410);
      if (message.includes("privacy_required")) return noStoreJson({ error: "개인정보 수집 동의가 필요합니다." }, 400);
      if (message.includes("capacity_missing")) return noStoreJson({ error: "정원 정보가 준비되지 않았습니다." }, 503);
      return noStoreJson({ error: "예약 시스템을 준비 중입니다. 잠시 후 다시 시도해 주세요." }, 503);
    }

    const result = data as ReservationRpcResult;
    if (!result?.kind || !result.cancelToken) {
      return noStoreJson({ error: "예약 결과를 확인하지 못했습니다." }, 503);
    }

    revalidatePath("/");
    revalidatePath("/bookclub");
    revalidatePath(`/bookclub/${slug}`);

    return noStoreJson({
      kind: result.kind,
      position: result.position ?? null,
      duplicate: result.duplicate === true,
      cancelToken: result.cancelToken,
    });
  } catch {
    return noStoreJson({ error: "예약 시스템에 연결하지 못했습니다." }, 503);
  }
}

/** 예약 시 발급한 토큰으로 취소한다. 대기 승격은 같은 DB 트랜잭션 안에서 처리된다. */
export async function DELETE(req: NextRequest) {
  if (!databaseConfigured()) {
    return noStoreJson({ error: "예약 시스템 연결이 준비되지 않았습니다." }, 503);
  }

  let body: { cancelToken?: unknown };
  try {
    body = await req.json();
  } catch {
    return noStoreJson({ error: "잘못된 요청입니다." }, 400);
  }
  const cancelToken = typeof body.cancelToken === "string" ? body.cancelToken.trim() : "";
  if (cancelToken.length < 20 || cancelToken.length > 200) {
    return noStoreJson({ error: "예약 취소 정보를 확인할 수 없습니다." }, 400);
  }

  try {
    const db = createServiceClient();
    const { data, error } = await db.rpc("cancel_book_club_reservation", {
      p_cancel_token: cancelToken,
    });
    if (error) {
      const message = `${error.message ?? ""} ${error.details ?? ""}`;
      if (message.includes("reservation_not_found")) {
        return noStoreJson({ error: "이미 취소되었거나 예약을 찾을 수 없습니다." }, 404);
      }
      return noStoreJson({ error: "예약을 취소하지 못했습니다." }, 503);
    }

    const result = data as { canceled?: boolean; slug?: string; promoted?: boolean };
    if (!result?.canceled) return noStoreJson({ error: "예약을 찾을 수 없습니다." }, 404);

    revalidatePath("/");
    revalidatePath("/bookclub");
    if (result.slug) revalidatePath(`/bookclub/${result.slug}`);
    return noStoreJson({ canceled: true, promoted: result.promoted === true });
  } catch {
    return noStoreJson({ error: "예약 시스템에 연결하지 못했습니다." }, 503);
  }
}
