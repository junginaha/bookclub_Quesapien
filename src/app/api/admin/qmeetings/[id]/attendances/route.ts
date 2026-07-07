import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isOperator } from "@/lib/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: meetingId } = await params;
  const supabase = await createClient();
  if (!(await isOperator(supabase))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("meeting_attendances")
    .select("meeting_id, user_id, status, created_at, profile:profiles(nickname)")
    .eq("meeting_id", meetingId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ attendances: data ?? [] });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: meetingId } = await params;
  const supabase = await createClient();
  if (!(await isOperator(supabase))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json() as { user_id: string; status: string };
  if (!body.user_id || !body.status) {
    return NextResponse.json({ error: "user_id와 status는 필수예요." }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("meeting_attendances")
    .update({ status: body.status })
    .eq("meeting_id", meetingId)
    .eq("user_id", body.user_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ attendance: data });
}
