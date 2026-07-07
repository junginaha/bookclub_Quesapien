import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// D1.5②/M0 탈퇴 처리 — 콘텐츠는 "탈퇴한 회원"으로 익명화 보존, auth.users는 삭제한다.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const admin = createServiceClient() as any;

  // 콘텐츠(질문/후기 등)는 남기고 프로필만 "탈퇴한 회원"으로 익명화.
  const { error: anonymizeErr } = await admin.rpc("anonymize_profile", { p_user_id: user.id });
  if (anonymizeErr) {
    return NextResponse.json({ error: anonymizeErr.message }, { status: 500 });
  }

  const { error: deleteErr } = await admin.auth.admin.deleteUser(user.id);
  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
