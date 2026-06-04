import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; answerId: string }> }
) {
  const { answerId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 관리자만 삭제 가능
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("landing_question_answers")
    .delete()
    .eq("id", answerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
