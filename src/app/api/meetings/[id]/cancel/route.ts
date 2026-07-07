import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";

// 원탭 나가기(신청 취소) — 대기열 승격도 cancel_attendance() DB 함수가 원자적으로 처리한다.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: meetingId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("cancel_attendance", { p_meeting_id: meetingId });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logEvent(supabase, "attend_cancel", { meeting_id: meetingId }, user.id);

  return NextResponse.json({ ok: true });
}
