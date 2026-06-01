import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "junginaha@gmail.com,kimjungin@quesapience.com").split(",");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("landing_book_clubs")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) return NextResponse.json({ error: "북클럽을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ club: data });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // Check if user is admin or the host
    const isAdmin = ADMIN_EMAILS.includes(user.email ?? "");
    if (!isAdmin) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: club } = await (supabase as any)
        .from("landing_book_clubs")
        .select("host_id, created_by")
        .eq("slug", slug)
        .single() as { data: { host_id: string | null; created_by: string | null } | null };

      if (!club || (club.host_id !== user.id && club.created_by !== user.id)) {
        return NextResponse.json({ error: "수정 권한이 없습니다." }, { status: 403 });
      }
    }

    const body = await request.json();
    const allowed = [
      "schedule", "location", "location_url", "join_url",
      "description", "host_name", "host_intro", "host_id",
      "max_participants", "current_participants", "session_dates",
      "season_number", "status",
    ];
    const update: Record<string, unknown> = { updated_by: user.id };
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("landing_book_clubs")
      .update(update)
      .eq("slug", slug)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ club: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
