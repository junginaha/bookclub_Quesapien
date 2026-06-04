/**
 * 관리자 계정 생성/비밀번호 재설정 엔드포인트
 * GET  /api/admin/setup  → 계정 생성 (신규)
 * POST /api/admin/setup  → 비밀번호 재설정 (기존 계정)
 */
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "junginaha@gmail.com";
const ADMIN_PASSWORD = "QSAdmin2026!#";
const ADMIN_NAME = "절대자";

async function getOrCreate() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createServiceClient() as any;

  // auth.admin.listUsers로 실제 auth 사용자 찾기
  const { data: listData, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) return { error: `listUsers 실패: ${listErr.message}`, admin, user: null };

  const existing = listData?.users?.find((u: { email: string }) => u.email === ADMIN_EMAIL);

  if (existing) {
    // 비밀번호 재설정
    const { error: updateErr } = await admin.auth.admin.updateUserById(existing.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (updateErr) return { error: `비밀번호 재설정 실패: ${updateErr.message}`, admin, user: existing };
    return { error: null, admin, user: existing, action: "updated" as const };
  }

  // 신규 생성
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { name: ADMIN_NAME },
  });
  if (createErr) return { error: `계정 생성 실패: ${createErr.message}`, admin, user: null };

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

  return { error: null, admin, user: created?.user, action: "created" as const };
}

export async function GET() {
  const result = await getOrCreate();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({
    status: result.action,
    message: result.action === "created" ? "관리자 계정이 생성됐습니다!" : "비밀번호가 재설정됐습니다.",
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    admin_url: "/admin",
    login_url: "/login",
  });
}

export async function POST() {
  const result = await getOrCreate();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ ok: true, message: result.action === "created" ? "생성됐습니다." : "재설정됐습니다." });
}
