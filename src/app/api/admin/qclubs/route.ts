import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isOperator } from "@/lib/admin";

// Qsapiens 2.0 clubs CRUD — 기존 /api/admin/clubs(landing_book_clubs, x-admin-key 방식)와는
// 별개 네임스페이스. RLS(clubs_write_operator)와 이 서버 검증 양쪽에서 is_operator를 확인한다(§C0).
export async function GET() {
  const supabase = await createClient();
  if (!(await isOperator(supabase))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).from("clubs").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clubs: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!(await isOperator(supabase))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json();
  const { data: { user } } = await supabase.auth.getUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const payload: Record<string, unknown> = {
    name: body.name,
    slug: body.slug,
    description: body.description || null,
    location_name: body.location_name || null,
    schedule_note: body.schedule_note || null,
    capacity: body.capacity ? Number(body.capacity) : null,
    join_policy: body.join_policy === "approval" ? "approval" : "open",
    vibe: body.vibe ?? null,
    owner_id: user?.id ?? null,
  };
  if (body.lat != null && body.lng != null) {
    payload.location = `POINT(${body.lng} ${body.lat})`;
  }

  const { data, error } = await db.from("clubs").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ club: data });
}
