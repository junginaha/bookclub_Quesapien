import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminEmail, isOperator } from "@/lib/admin";

/**
 * 운영 DB에 마이그레이션이 실제로 적용돼 있는지 확인하는 읽기 전용 점검.
 *
 * 마이그레이션 워크플로가 2026-08-02 이후 한 번도 성공하지 못했고(저장소 시크릿
 * SUPABASE_ACCESS_TOKEN이 비어 있다), 025만 대시보드에서 손으로 적용됐다.
 * 그래서 "예약 버튼을 눌렀을 때 쓰는 함수가 운영 DB에 있는가"를 코드만 보고는
 * 알 수 없다 — 이 라우트가 그 답을 한 번에 준다.
 *
 * 데이터는 한 줄도 읽지 않는다. 테이블·함수가 **있는지 없는지**만 본다.
 * 운영자만 호출할 수 있다.
 */

export const dynamic = "force-dynamic";

// 화면이 실제로 의존하는 것들 — 하나라도 없으면 그 기능은 운영에서 죽어 있다.
// legacy: 지금 화면에서 쓰지 않는 것 — 없어도 문제가 아니라 "빠진것"에 넣지 않는다.
const TABLES: { name: string; why: string; migration: string; legacy?: boolean }[] = [
  { name: "bookclub_applications", why: "북클럽 예약 저장", migration: "021" },
  { name: "bookclub_waitlist", why: "대기 신청 · 읽고 싶어요 · 책 추천", migration: "021" },
  { name: "reading_journey_interests", why: "독서여행 관심 등록", migration: "024" },
  { name: "landing_book_club_signups", why: "구 북클럽 신청 — 현재 코드에서 쓰지 않음", migration: "020", legacy: true },
];

const FUNCTIONS: { name: string; why: string; migration: string; legacy?: boolean }[] = [
  { name: "apply_to_bookclub", why: "예약 — 정원·대기열을 원자적으로 처리", migration: "021" },
  { name: "join_bookclub_waitlist", why: "대기 신청(구버전)", migration: "021" },
  { name: "join_bookclub_interest", why: "읽고 싶어요 · 책 추천(현행)", migration: "023" },
  { name: "reserve_book_club_spot", why: "구 북클럽 예약 — 현재 코드에서 쓰지 않음", migration: "020", legacy: true },
];

// 025가 profiles에 넣은 컬럼들 — 온보딩이 여기에 걸린 적이 있다.
const PROFILE_COLUMNS = ["nickname", "phone", "home_region", "is_operator", "onboarding_completed_at"];

async function listRpcNames(): Promise<Set<string> | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  try {
    // PostgREST 루트는 스키마에 실제로 존재하는 함수만 OpenAPI 경로로 내보낸다.
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const spec = (await res.json()) as { paths?: Record<string, unknown> };
    const names = new Set<string>();
    for (const path of Object.keys(spec.paths ?? {})) {
      if (path.startsWith("/rpc/")) names.add(path.slice(5));
    }
    return names;
  } catch {
    return null;
  }
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (!isAdminEmail(user.email) && !(await isOperator(supabase))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
  if (!configured) {
    return NextResponse.json({
      ok: false,
      문제: "운영 환경변수가 비어 있습니다(NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY).",
    });
  }

  const db = createServiceClient();

  const tables = await Promise.all(
    TABLES.map(async (t) => {
      const { error } = await db.from(t.name).select("*", { count: "exact", head: true }).limit(1);
      return { 이름: t.name, 쓰임: t.why, 마이그레이션: t.migration, 레거시: Boolean(t.legacy), 있음: !error, 오류: error?.message ?? null };
    })
  );

  const rpcNames = await listRpcNames();
  const functions = FUNCTIONS.map((f) => ({
    이름: f.name,
    쓰임: f.why,
    마이그레이션: f.migration,
    레거시: Boolean(f.legacy),
    있음: rpcNames ? rpcNames.has(f.name) : null,
  }));

  const { error: profileError } = await db
    .from("profiles")
    .select(PROFILE_COLUMNS.join(","), { count: "exact", head: true })
    .limit(1);

  // 화면이 실제로 쓰는 것만 "빠진것"에 넣는다 — 레거시가 섞이면 점검이 양치기 소년이 된다.
  const missing = [
    ...tables.filter((t) => !t.있음 && !t.레거시).map((t) => `${t.이름} (${t.마이그레이션})`),
    ...functions.filter((f) => f.있음 === false && !f.레거시).map((f) => `${f.이름}() (${f.마이그레이션})`),
    ...(profileError ? [`profiles 컬럼 (025) — ${profileError.message}`] : []),
  ];

  return NextResponse.json({
    ok: missing.length === 0,
    확인시각: new Date().toISOString(),
    빠진것: missing,
    할일:
      missing.length === 0
        ? "없음 — 화면이 쓰는 테이블·함수가 모두 있습니다."
        : "Supabase 대시보드 SQL 에디터에 해당 마이그레이션 파일을 번호 순서대로 붙여넣어 실행해 주세요.",
    테이블: tables,
    함수: functions,
    프로필컬럼: { 확인한컬럼: PROFILE_COLUMNS, 있음: !profileError, 오류: profileError?.message ?? null },
    레거시로_빠진것: [
      ...tables.filter((t) => !t.있음 && t.레거시).map((t) => t.이름),
      ...functions.filter((f) => f.있음 === false && f.레거시).map((f) => `${f.이름}()`),
    ],
    비고: rpcNames ? null : "함수 목록을 읽지 못했습니다(PostgREST 루트 응답 실패) — 함수 '있음'은 판단 보류입니다.",
  });
}
