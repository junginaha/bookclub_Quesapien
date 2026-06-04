import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "junginaha@gmail.com,kimjungin@quesapience.com").split(",");

// ── GET: 북클럽 상세 조회 ──────────────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: _s } = await params;
    const slug = decodeURIComponent(_s);
    // 서비스 롤로 조회 (RLS 우회)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createServiceClient() as any;

    const { data, error } = await db
      .from("landing_book_clubs")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "북클럽을 찾을 수 없습니다." }, { status: 404 });
    }

    // 비관리자: join_url 숨김 (버튼 클릭 여부만 노출)
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? "");
    if (!isAdmin) {
      const { join_url, ...safeData } = data as { join_url: string | null } & Record<string, unknown>;
      return NextResponse.json({
        club: { ...safeData, has_join_url: !!(join_url?.trim()) },
      });
    }

    return NextResponse.json({ club: data });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

// ── PATCH: 북클럽 정보 저장 (행 없으면 자동 생성) ─────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: _s } = await params;
    const slug = decodeURIComponent(_s);

    // 1) 인증 확인 (createClient — 쿠키 기반)
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const isAdmin = ADMIN_EMAILS.includes(user.email ?? "");

    // 2) 실제 DB 작업은 서비스 롤 (RLS 우회)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createServiceClient() as any;

    // 비관리자: 호스트 여부 확인
    if (!isAdmin) {
      const { data: club } = await db
        .from("landing_book_clubs")
        .select("host_id, created_by")
        .eq("slug", slug)
        .maybeSingle();

      const c = club as { host_id: string | null; created_by: string | null } | null;
      if (!c || (c.host_id !== user.id && c.created_by !== user.id)) {
        return NextResponse.json({ error: "수정 권한이 없습니다." }, { status: 403 });
      }
    }

    const body = await request.json();
    const allowedFields = [
      "schedule", "location", "location_url", "join_url",
      "description", "host_name", "host_intro", "host_id",
      "max_participants", "current_participants", "session_dates",
      "season_number", "status", "sort_order",
    ];

    const updatePayload: Record<string, unknown> = { updated_by: user.id };
    for (const key of allowedFields) {
      if (key in body) updatePayload[key] = body[key];
    }

    // 기존 행 존재 여부 확인
    const { data: existing } = await db
      .from("landing_book_clubs")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    let resultData;

    if ((existing as { id: string } | null)?.id) {
      // ── 기존 행 업데이트 ──
      const { data, error } = await db
        .from("landing_book_clubs")
        .update(updatePayload)
        .eq("slug", slug)
        .select()
        .single();
      if (error) throw new Error(`update: ${error.message}`);
      resultData = data;
    } else {
      // ── 행 없음: 신규 생성 ──
      const titleFallback = (body.title as string) ?? slug.replace(/-/g, " ");
      const insertPayload = {
        slug,
        title:                titleFallback,
        color:                (body.color as string) ?? "navy",
        sort_order:           99,
        status:               "active",
        current_participants: 0,
        emotion_tags:         [],
        is_mini:              false,
        session_dates:        [],
        created_by:           user.id,
        ...updatePayload,
      };
      const { data, error } = await db
        .from("landing_book_clubs")
        .insert(insertPayload)
        .select()
        .single();
      if (error) throw new Error(`insert: ${error.message}`);
      resultData = data;
    }

    return NextResponse.json({ club: resultData });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
