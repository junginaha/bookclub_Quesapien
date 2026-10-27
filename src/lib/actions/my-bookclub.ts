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
    const [apps, waits] = await Promise.all([
      sb.from("bookclub_applications").select("club_slug, created_at").eq("phone", phone).eq("status", "confirmed"),
      sb.from("bookclub_waitlist").select("club_slug, created_at").eq("phone", phone),
    ]);
    const out: MyReservation[] = [];
    for (const r of apps.data ?? []) out.push({ slug: r.club_slug, createdAt: r.created_at, kind: "confirmed" });
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
