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
    const body = await req.json() as { content: string; author_name?: string; question_content?: string };
    const { content, author_name, question_content } = body;
    if (!content?.trim() || content.trim().length < 2) {
      return NextResponse.json({ error: "답변을 입력해주세요." }, { status: 400 });
    }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // 부모 질문이 DB에 없으면 자동 생성 (정적 질문 ID 지원)
    const { data: existingQ } = await db
      .from("landing_questions")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!existingQ && question_content) {
      await db.from("landing_questions").upsert({
        id,
        content: question_content.trim(),
        author_name: "편집팀",
        author_id: null,
        is_approved: true,
        is_today: false,
        is_featured: false,
        likes: 0,
        saves: 0,
        answers_count: 0,
      });
    }

    const { data, error } = await db
      .from("landing_question_answers")
      .insert({
        question_id: id,
        content: content.trim(),
        author_name: author_name?.trim() || "익명",
        author_id: user?.id ?? null,
        is_approved: true,
      })
      .select()
      .single();
    if (error) throw error;

    // answers_count 업데이트
    await db.rpc("increment_answers_count", { q_id: id }).catch(async () => {
      const { data: q } = await db.from("landing_questions").select("answers_count").eq("id", id).single();
      if (q) await db.from("landing_questions").update({ answers_count: (q.answers_count ?? 0) + 1 }).eq("id", id);
    });

    return NextResponse.json({ answer: data }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
