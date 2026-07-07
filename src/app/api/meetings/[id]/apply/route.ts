import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";

// §C3 M1 — 회차 즉시참여. 정원 검증은 프론트가 아니라 apply_to_meeting() DB 함수가
// meetings 행을 잠그고 원자적으로 처리한다(동시 신청 시 초과 입장 방지).
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
  const { data: status, error } = await (supabase as any).rpc("apply_to_meeting", { p_meeting_id: meetingId });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logEvent(supabase, "attend_apply", { meeting_id: meetingId, status }, user.id);

  return NextResponse.json({ ok: true, status });
}
