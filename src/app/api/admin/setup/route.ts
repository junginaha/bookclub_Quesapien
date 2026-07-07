/**
 * 관리자 계정 생성/비밀번호 재설정 엔드포인트
 * GET  /api/admin/setup  → 계정 생성 (신규)
 * POST /api/admin/setup  → 비밀번호 재설정 (기존 계정)
 */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "junginaha@gmail.com";
const ADMIN_NAME = "절대자";

// EMERGENCY HOTFIX (docs/PROJECT_AUDIT.md 참고): 이 라우트는 최초 관리자 계정을
// 부트스트랩/재설정하는 용도라 profiles.is_operator에 의존할 수 없다(아직 운영자가
// 없을 수 있음). 그래서 이미 이 서버만 아는 SUPABASE_SERVICE_ROLE_KEY 자체를
// 헤더로 제시하도록 요구한다 — run-migrations/route.ts의 x-migration-secret과
// 동일한 패턴이며, 별도의 추측 가능한 기본값을 두지 않는다.
function isAuthorized(req: NextRequest): boolean {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return false;
  return req.headers.get("x-admin-key") === serviceKey;
}

async function getOrCreate() {
  // 하드코딩된 비밀번호 제거 — 반드시 환경변수로만 전달한다(기본값 없음).
  // 호출자가 x-admin-key(서비스 롤 키)를 이미 알아야 하는 것과 별개로,
  // 실제로 설정될 비밀번호 자체도 소스코드에 남기지 않는다.
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!password) {
    return {
      error: "ADMIN_BOOTSTRAP_PASSWORD 환경변수가 설정되지 않았습니다. Vercel/로컬 환경변수에 임시로 설정한 뒤 다시 호출하세요.",
      admin: null,
      user: null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createServiceClient() as any;

  // auth.admin.listUsers로 실제 auth 사용자 찾기
  const { data: listData, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) return { error: `listUsers 실패: ${listErr.message}`, admin, user: null };

  const existing = listData?.users?.find((u: { email: string }) => u.email === ADMIN_EMAIL);

  if (existing) {
    // 비밀번호 재설정
    const { error: updateErr } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (updateErr) return { error: `비밀번호 재설정 실패: ${updateErr.message}`, admin, user: existing };
    return { error: null, admin, user: existing, action: "updated" as const };
  }

  // 신규 생성
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password,
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

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  const result = await getOrCreate();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({
    status: result.action,
    message: result.action === "created" ? "관리자 계정이 생성됐습니다!" : "비밀번호가 재설정됐습니다.",
    email: ADMIN_EMAIL,
    admin_url: "/admin",
    login_url: "/login",
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  const result = await getOrCreate();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ ok: true, message: result.action === "created" ? "생성됐습니다." : "재설정됐습니다." });
}
