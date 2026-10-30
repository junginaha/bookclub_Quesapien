"use server";

// 내 북클럽 — 로그인 사용자의 예약·대기 목록과 취소. 예약은 전화번호로 묶인다
// (bookclub_applications.phone, 숫자만). 사용자는 쿠키 세션으로 확인하고, 조회·수정은
// 서비스 클라이언트로 한다(기존 테이블·RPC 변경 없음).

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { getSession } from "@/lib/bookclub/data";
import { isPast } from "@/lib/bookclub/selectors";

export interface MyReservation {
  slug: string;
  createdAt: string;
  kind: "confirmed" | "waitlist" | "interest";
  /**
   * 참여비를 냈는지. **undefined는 "모른다"는 뜻이다** — 026 마이그레이션이 아직
   * 적용되지 않아 기록할 칸이 없는 경우다. 화면은 셋을 구분해 말해야 한다
   * (냈다 / 아직 안 냈다 / 확인할 수 없다).
   */
  paid?: boolean;
  /** PayApp pay_state 원값 — 10이면 가상계좌 입금 대기다. 해석하지 않고 그대로 넘긴다. */
  paymentState?: string;
}

function digits(v: string) {
  return v.replace(/\D/g, "");
}

function ready() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export async function getMyReservations(): Promise<MyReservation[]> {
  const viewer = await getViewer();
  if (!viewer || !ready()) return [];
  const phone = digits(viewer.phone);
  if (phone.length < 9) return [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createServiceClient() as any;
    // 결제 칸(026)이 있는 환경에서는 함께 읽는다. 없으면 그 칸 없이 한 번 더 조회해
    // **목록 자체가 비어 보이는 일을 막는다** — 결제 여부만 모르는 상태로 둔다.
    const appsQuery = async () => {
      const withPay = await sb
        .from("bookclub_applications")
        .select("club_slug, created_at, paid_at, payment_state")
        .eq("phone", phone)
        .eq("status", "confirmed");
      if (!withPay.error) return { rows: withPay.data ?? [], hasPay: true };
      const code = (withPay.error as { code?: string }).code;
      if (code !== "PGRST204" && code !== "42703" && !/paid_at|payment_state/.test(withPay.error.message ?? "")) {
        return { rows: [], hasPay: false };
      }
      const plain = await sb
        .from("bookclub_applications")
        .select("club_slug, created_at")
        .eq("phone", phone)
        .eq("status", "confirmed");
      return { rows: plain.data ?? [], hasPay: false };
    };

    const [apps, waits] = await Promise.all([
      appsQuery(),
      sb.from("bookclub_waitlist").select("club_slug, created_at").eq("phone", phone),
    ]);
    const out: MyReservation[] = [];
    for (const r of apps.rows) {
      out.push({
        slug: r.club_slug,
        createdAt: r.created_at,
        kind: "confirmed",
        paid: apps.hasPay ? Boolean(r.paid_at) : undefined,
        paymentState: apps.hasPay ? (r.payment_state ?? undefined) : undefined,
      });
    }
    for (const r of waits.data ?? []) {
      if (!r.club_slug) continue;
      const s = getSession(r.club_slug);
      out.push({ slug: r.club_slug, createdAt: r.created_at, kind: s && !isPast(s) ? "waitlist" : "interest" });
    }
    return out;
  } catch {
    return [];
  }
}

export async function cancelMyReservation(slug: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "로그인이 필요해요." };
  if (!ready()) return { ok: false, error: "잠깐 연결이 어려워요. 조금 뒤에 다시 시도해 주세요." };
  const phone = digits(viewer.phone);
  if (phone.length < 9) return { ok: false, error: "프로필에 휴대전화가 없어요." };
  const session = getSession(slug);
  if (!session) return { ok: false, error: "모임을 찾을 수 없어요." };
  if (isPast(session)) return { ok: false, error: "이미 지난 모임이에요." };
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createServiceClient() as any;
    const { error } = await sb
      .from("bookclub_applications")
      .update({ status: "canceled", canceled_at: new Date().toISOString() })
      .eq("club_slug", slug)
      .eq("phone", phone)
      .eq("status", "confirmed");
    if (error) {
      // canceled_at 컬럼이 없는 환경(020 미적용)에서도 status만으로 취소되게 한 번 더 시도
      const retry = await sb.from("bookclub_applications").update({ status: "canceled" }).eq("club_slug", slug).eq("phone", phone).eq("status", "confirmed");
      if (retry.error) return { ok: false, error: "취소를 처리하지 못했어요. 다시 시도해 주세요." };
    }
    revalidatePath("/mypage");
    revalidatePath(`/bookclub/${slug}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "취소를 처리하지 못했어요. 다시 시도해 주세요." };
  }
}
