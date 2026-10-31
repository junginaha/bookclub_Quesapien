"use server";

// 모임 후기 — 그 회차에 실제로 신청했던 사람만 남길 수 있다.
//
// 후기는 **지어내지 않는다**(절대원칙 8). 시드도 없고, 비어 있으면 비어 있는 채로 둔다.
// 올라온 글은 운영자가 확인한 것만 공개된다(is_published 기본 false).

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { getSession } from "@/lib/bookclub/data";
import { isPast } from "@/lib/bookclub/selectors";
import { isAdminEmail, isOperator } from "@/lib/admin";

export interface PublicReview {
  id: string;
  clubSlug: string;
  authorName: string;
  content: string;
  publishedAt: string | null;
}

const NEEDS_028 =
  "후기를 저장할 칸이 아직 없습니다. Supabase SQL 에디터에 supabase/manual/APPLY_PENDING.sql을 붙여넣어 주세요.";

function missingTable(e: { code?: string; message?: string } | null): boolean {
  if (!e) return false;
  return e.code === "42P01" || e.code === "PGRST205" || /bookclub_reviews/.test(e.message ?? "");
}

const digits = (v: string) => v.replace(/\D/g, "");

type Result = { ok: true } | { ok: false; error: string };

/** 후기 남기기. 지난 회차 + 그 회차에 확정 신청한 번호만 통과한다. */
export async function submitReview(clubSlug: string, authorName: string, content: string): Promise<Result> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "로그인이 필요합니다." };
  const phone = digits(viewer.phone);
  if (phone.length < 9) return { ok: false, error: "프로필에 휴대전화가 없어 확인할 수 없습니다." };

  const session = getSession(clubSlug);
  if (!session) return { ok: false, error: "모임을 찾을 수 없습니다." };
  if (!isPast(session)) return { ok: false, error: "모임이 끝난 뒤에 남길 수 있습니다." };

  const text = content.trim();
  if (text.length < 2) return { ok: false, error: "내용을 적어 주세요." };
  if (text.length > 2000) return { ok: false, error: "2,000자까지 쓸 수 있어요." };

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createServiceClient() as any;
    const { data: app } = await db
      .from("bookclub_applications")
      .select("id")
      .eq("club_slug", clubSlug)
      .eq("phone", phone)
      .eq("status", "confirmed")
      .maybeSingle();
    if (!app) return { ok: false, error: "이 모임의 예약 기록을 찾지 못했어요." };

    // 같은 사람이 다시 쓰면 덮어쓴다 — 중복 더미가 쌓이지 않게.
    // 고친 글은 다시 검수를 받는다(공개 상태를 유지한 채 내용만 바뀌지 않게).
    const { error } = await db
      .from("bookclub_reviews")
      .upsert(
        {
          club_slug: clubSlug,
          phone,
          author_name: authorName.trim().slice(0, 40) || "익명",
          content: text,
          is_published: false,
          published_at: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "club_slug,phone" }
      );
    if (error) return { ok: false, error: missingTable(error) ? NEEDS_028 : "저장하지 못했어요. 다시 시도해 주세요." };
  } catch {
    return { ok: false, error: "저장하지 못했어요. 다시 시도해 주세요." };
  }
  revalidatePath("/mypage");
  revalidatePath(`/bookclub/${clubSlug}`);
  return { ok: true };
}

/** 운영자 검수 — 공개/비공개. */
export async function setReviewPublished(id: string, publish: boolean): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요합니다." };
  if (!isAdminEmail(user.email) && !(await isOperator(supabase))) return { ok: false, error: "권한이 없습니다." };
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createServiceClient() as any;
    const { error } = await db
      .from("bookclub_reviews")
      .update({ is_published: publish, published_at: publish ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) return { ok: false, error: missingTable(error) ? NEEDS_028 : "바꾸지 못했어요." };
  } catch {
    return { ok: false, error: "바꾸지 못했어요." };
  }
  revalidatePath("/admin/bookclub");
  return { ok: true };
}
