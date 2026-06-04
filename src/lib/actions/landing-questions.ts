"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return { error: "관리자 권한이 필요합니다.", db: null, userId: null };
  return { error: null, db: supabase as any, userId: user.id }; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export async function updateLandingQuestionAction(id: string, content: string) {
  const { error, db } = await requireAdmin();
  if (error || !db) return { error };
  if (!content.trim() || content.trim().length < 5) return { error: "5자 이상 입력해주세요." };

  const { error: updateErr } = await db
    .from("landing_questions")
    .update({ content: content.trim() })
    .eq("id", id);
  if (updateErr) return { error: "수정에 실패했어요." };

  revalidatePath("/questions");
  revalidatePath(`/questions/${id}`);
  return { success: true };
}

export async function deleteLandingQuestionAction(id: string) {
  const { error, db } = await requireAdmin();
  if (error || !db) return { error };

  // 답변 먼저 삭제 (FK 제약)
  await db.from("landing_question_answers").delete().eq("question_id", id);
  await db.from("landing_question_reactions").delete().eq("question_id", id);

  const { error: deleteErr } = await db
    .from("landing_questions")
    .delete()
    .eq("id", id);
  if (deleteErr) return { error: "삭제에 실패했어요." };

  revalidatePath("/questions");
  return { success: true };
}

export async function toggleFeaturedLandingQuestion(id: string, current: boolean) {
  const { error, db } = await requireAdmin();
  if (error || !db) return { error };

  const { error: updateErr } = await db
    .from("landing_questions")
    .update({ is_featured: !current })
    .eq("id", id);
  if (updateErr) return { error: "업데이트에 실패했어요." };

  revalidatePath("/questions");
  return { success: true };
}

export async function toggleTodayLandingQuestion(id: string, current: boolean) {
  const { error, db } = await requireAdmin();
  if (error || !db) return { error };

  // 기존 today 해제 후 새 today 설정
  if (!current) {
    await db.from("landing_questions").update({ is_today: false }).eq("is_today", true);
  }

  const { error: updateErr } = await db
    .from("landing_questions")
    .update({ is_today: !current })
    .eq("id", id);
  if (updateErr) return { error: "업데이트에 실패했어요." };

  revalidatePath("/questions");
  return { success: true };
}
