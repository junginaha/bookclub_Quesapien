import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "junginaha@gmail.com,kimjungin@quesapience.com").split(",");

// ── GET ──────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: _s } = await params;
  const slug = decodeURIComponent(_s);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any;
  const { data, error } = await db
    .from("landing_book_clubs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ club: null }, { status: 200 }); // 404 대신 null 반환
  }

  // 비관리자: join_url 숨김
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? "");

  if (!isAdmin && data.join_url) {
    const { join_url, ...rest } = data as { join_url: string } & Record<string, unknown>;
    void join_url;
    return NextResponse.json({ club: { ...rest, has_join_url: true } });
  }

  return NextResponse.json({ club: data });
}

// ── PATCH ─────────────────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: _s } = await params;
  const slug = decodeURIComponent(_s);

  // 인증 확인
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const isAdmin = ADMIN_EMAILS.includes(user.email ?? "");

  // 서비스 롤로 DB 작업 (RLS 우회)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any;

  // 비관리자: 호스트 여부 확인
  if (!isAdmin) {
    const { data: existing } = await db
      .from("landing_book_clubs")
      .select("host_id")
      .eq("slug", slug)
      .maybeSingle();
    const club = existing as { host_id: string | null } | null;
    if (!club || club.host_id !== user.id) {
      return NextResponse.json({ error: "수정 권한이 없습니다." }, { status: 403 });
    }
  }

  const body = await request.json() as Record<string, unknown>;

  // 저장할 필드만 추출 (updated_by/created_by 제외 — 컬럼 없을 수 있음)
  const SAFE_FIELDS = [
    "title", "color",
    "schedule", "location", "location_url", "join_url",
    "description", "host_name", "host_intro",
    "max_participants", "session_dates", "status",
  ] as const;

  const payload: Record<string, unknown> = {};
  for (const k of SAFE_FIELDS) {
    if (k in body) payload[k] = body[k];
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "저장할 데이터가 없습니다." }, { status: 400 });
  }

  // UPDATE 시도
  const { data: updated, error: updateErr } = await db
    .from("landing_book_clubs")
    .update(payload)
    .eq("slug", slug)
    .select()
    .maybeSingle();

  if (updateErr) {
    return NextResponse.json({ error: `저장 실패: ${updateErr.message}` }, { status: 500 });
  }

  if (updated) {
    return NextResponse.json({ club: updated });
  }

  // 행이 없으면 INSERT
  const insertPayload: Record<string, unknown> = {
    slug,
    title: (body.title as string) ?? slug.replace(/-/g, " "),
    color: (body.color as string) ?? "navy",
    sort_order: 99,
    status: "active",
    current_participants: 0,
    emotion_tags: [],
    is_mini: false,
    session_dates: [],
    ...payload,
  };

  const { data: inserted, error: insertErr } = await db
    .from("landing_book_clubs")
    .insert(insertPayload)
    .select()
    .maybeSingle();

  if (insertErr) {
    return NextResponse.json({ error: `생성 실패: ${insertErr.message}` }, { status: 500 });
  }

  return NextResponse.json({ club: inserted });
}
