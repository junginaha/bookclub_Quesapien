"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function joinSessionAction(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: session } = await db
    .from("sessions")
    .select("status, current_participants, max_participants")
    .eq("id", sessionId)
    .single();

  if (!session) return { error: "모임을 찾을 수 없습니다." };
  if (session.status === "closed") return { error: "마감된 모임입니다." };
  if (session.current_participants >= session.max_participants) return { error: "정원이 가득 찼습니다." };

  const { data: existing } = await db
    .from("session_participants")
    .select("id")
    .eq("session_id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return { error: "이미 참여 중인 모임입니다." };

  const { error: insertErr } = await db
    .from("session_participants")
    .insert({ session_id: sessionId, user_id: user.id });

  if (insertErr) return { error: "참여 신청에 실패했습니다." };

  // sessions.current_participants +1
  await db
    .from("sessions")
    .update({ current_participants: session.current_participants + 1 })
    .eq("id", sessionId);

  // profiles.session_count +1
  const { data: prof } = await db
    .from("profiles")
    .select("session_count")
    .eq("id", user.id)
    .single();
  if (prof != null) {
    await db
      .from("profiles")
      .update({ session_count: (prof.session_count ?? 0) + 1 })
      .eq("id", user.id);
  }

  revalidatePath(`/questions/[id]`, "page");
  revalidatePath("/mypage");
  return { success: "모임에 참여했어요! 마이페이지에서 확인하세요." };
}

export async function leaveSessionAction(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error: deleteErr } = await db
    .from("session_participants")
    .delete()
    .eq("session_id", sessionId)
    .eq("user_id", user.id);

  if (deleteErr) return { error: "참여 취소에 실패했습니다." };

  // sessions.current_participants -1 (min 0)
  const { data: sess } = await db
    .from("sessions")
    .select("current_participants")
    .eq("id", sessionId)
    .single();
  if (sess && sess.current_participants > 0) {
    await db
      .from("sessions")
      .update({ current_participants: sess.current_participants - 1 })
      .eq("id", sessionId);
  }

  // profiles.session_count -1 (min 0)
  const { data: prof } = await db
    .from("profiles")
    .select("session_count")
    .eq("id", user.id)
    .single();
  if (prof && prof.session_count > 0) {
    await db
      .from("profiles")
      .update({ session_count: prof.session_count - 1 })
      .eq("id", user.id);
  }

  revalidatePath(`/questions/[id]`, "page");
  revalidatePath("/mypage");
  return { success: "참여가 취소됐어요." };
}
