import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("landing_question_answers")
      .select("id, content, author_name, likes, created_at")
      .eq("question_id", id)
      .eq("is_approved", true)
      .order("likes", { ascending: false })
      .limit(20);
    return NextResponse.json({ answers: data ?? [] });
  } catch {
    return NextResponse.json({ answers: [] });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json() as { content: string; author_name?: string };
    const { content, author_name } = body;
    if (!content?.trim() || content.trim().length < 2) {
      return NextResponse.json({ error: "답변을 입력해주세요." }, { status: 400 });
    }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("landing_question_answers")
      .insert({
        question_id: id,
        content: content.trim(),
        author_name: author_name?.trim() || "익명",
        author_id: user?.id ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ answer: data }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
