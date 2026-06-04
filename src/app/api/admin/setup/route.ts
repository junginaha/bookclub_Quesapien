/**
 * 일회성 관리자 계정 생성 엔드포인트
 * GET /api/admin/setup  → 관리자 계정 생성 (junginaha@gmail.com)
 */
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "junginaha@gmail.com";
const ADMIN_PASSWORD = "QSAdmin2026!#";
const ADMIN_NAME = "절대자";

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createServiceClient() as any;

    // 이미 존재하는지 확인
    const { data: existing } = await admin
      .from("profiles")
      .select("id, email")
      .eq("email", ADMIN_EMAIL)
      .maybeSingle();

    if (existing) {
      // 비밀번호 업데이트 (재설정)
      const { data: listData } = await admin.auth.admin.listUsers();
      const user = listData?.users?.find((u: { email: string }) => u.email === ADMIN_EMAIL);
      if (user) {
        await admin.auth.admin.updateUserById(user.id, { password: ADMIN_PASSWORD });
      }
      return NextResponse.json({
        status: "updated",
        message: "관리자 계정 비밀번호가 재설정됐습니다.",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        admin_url: "/admin",
      });
    }

    // 신규 생성
    const { data: created, error } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: ADMIN_NAME },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // profiles 행 생성
    if (created?.user) {
      await admin.from("profiles").upsert({
        id: created.user.id,
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        avatar_url: null,
        bio: "절대자 · 관리자",
        joined_at: new Date().toISOString(),
        session_count: 0,
      });
    }

    return NextResponse.json({
      status: "created",
      message: "관리자 계정이 생성됐습니다!",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      admin_url: "/admin",
      login_url: "/login",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
