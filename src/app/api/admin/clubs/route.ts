import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const ADMIN_KEY = process.env.ADMIN_KEY;

function checkKey(req: NextRequest) {
  return Boolean(ADMIN_KEY) && req.headers.get("x-admin-key") === ADMIN_KEY;
}

export async function GET(request: NextRequest) {
  if (!ADMIN_KEY) {
    return NextResponse.json({ error: "관리자 키가 설정되지 않았습니다." }, { status: 503 });
  }
  if (!checkKey(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (createServiceClient() as any)
      .from("landing_book_clubs")
      .select("*")
      .order("is_mini", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ clubs: data ?? [] });
  } catch {
    return NextResponse.json({ clubs: [] });
  }
}

export async function PATCH(request: NextRequest) {
  if (!ADMIN_KEY) {
    return NextResponse.json({ error: "관리자 키가 설정되지 않았습니다." }, { status: 503 });
  }
  if (!checkKey(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json() as Record<string, unknown>;
    const { slug, ...fields } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "slug 필요" }, { status: 400 });
    }

    const allowed = [
      "title", "author", "color", "genre", "tag", "is_mini", "sort_order",
      "schedule", "location", "location_url", "join_url",
      "description", "host_name", "host_intro",
      "max_participants", "current_participants",
      "session_dates", "season_number", "status",
      // 011 마이그레이션 — 지금/앵콜 재구조화 컬럼 (마이그레이션 미적용 시 update는 컬럼 없음 에러로 실패한다)
      "event_starts_at", "event_ends_at", "registration_closes_at",
      "area", "price", "author_hosts",
      "encore_eligible", "encore_threshold", "archived_at",
      // 북클럽 참가 게시판(/bookclub) 전용 필드 — 여기서 같이 편집해야 메인(홈)과
      // 서브(/bookclub 게시판)가 같은 행을 보고 둘 다 갱신된다.
      "reason", "key_questions", "recommended_for",
      "price_note", "bring", "name_example",
    ];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in fields) update[key] = fields[key];
    }

    const db = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbAny = db as any;

    const { data: existing } = await dbAny
      .from("landing_book_clubs")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    let result;
    if (existing) {
      result = await dbAny.from("landing_book_clubs").update(update).eq("slug", slug).select().single();
    } else {
      // 새 북클럽 — 이 슬러그로 처음 저장하는 경우 행을 새로 만든다.
      if (!update.title) {
        return NextResponse.json({ error: "새 북클럽은 제목이 필요합니다." }, { status: 400 });
      }
      // is_seed는 일부러 안 넣는다 — 컬럼이 아직 없는 DB(마이그레이션 016 미적용)에서
      // insert 자체가 "없는 컬럼" 에러로 실패하는 걸 막는다. 컬럼이 있으면 기본값
      // (false)이 알아서 들어간다.
      result = await dbAny
        .from("landing_book_clubs")
        .insert({ slug, is_mini: false, status: "active", sort_order: 99, ...update })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    return NextResponse.json({ club: result.data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
