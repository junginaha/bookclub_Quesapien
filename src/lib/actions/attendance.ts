"use server";

// 출석 기록 — 관리자만. 신청 한 줄에 '참석' 또는 '노쇼'를 적는다.
//
// 둘 다 비어 있으면 **아직 확인하지 않은 것**이고, 그것은 노쇼와 다르다.
// 그래서 참석을 적을 때 노쇼를 지우고, 노쇼를 적을 때 참석을 지운다 —
// 한 줄이 두 가지를 동시에 말하지 않게.

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminEmail, isOperator } from "@/lib/admin";

export type AttendanceMark = "attended" | "no_show" | "clear";

type Result = { ok: true } | { ok: false; error: string };

/** 027 미적용 환경을 사람 말로 알려준다 — 조용히 실패하면 눌러도 아무 일이 없다. */
const NEEDS_027 =
  "출석 기록 칸이 아직 없습니다. Supabase SQL 에디터에 supabase/manual/APPLY_PENDING.sql을 붙여넣어 주세요.";

function missingColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "PGRST204" || error.code === "42703" || /attended_at|no_show_at/.test(error.message ?? "");
}

export async function markAttendance(applicationId: string, mark: AttendanceMark): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요합니다." };
  // is_operator 플래그가 아직 안 들어간 계정도 막히지 않게 둘 다 본다.
  if (!isAdminEmail(user.email) && !(await isOperator(supabase))) {
    return { ok: false, error: "권한이 없습니다." };
  }

  const now = new Date().toISOString();
  const patch =
    mark === "attended" ? { attended_at: now, no_show_at: null }
    : mark === "no_show" ? { attended_at: null, no_show_at: now }
    : { attended_at: null, no_show_at: null };

  try {
    const db = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (db as any).from("bookclub_applications").update(patch).eq("id", applicationId);
    if (error) return { ok: false, error: missingColumn(error) ? NEEDS_027 : "기록하지 못했습니다. 다시 시도해 주세요." };
  } catch {
    return { ok: false, error: "기록하지 못했습니다. 다시 시도해 주세요." };
  }
  revalidatePath("/admin/bookclub");
  return { ok: true };
}
