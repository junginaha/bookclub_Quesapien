import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("landing_questions")
      .select("*")
      .eq("is_approved", true)
      .order("is_today", { ascending: false })
      .order("likes", { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json({ questions: data ?? [] });
  } catch {
    return NextResponse.json({ questions: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { content: string; author_name?: string; session_key?: string };
    const { content, author_name, session_key } = body;

    if (!content?.trim() || content.trim().length < 5) {
      return NextResponse.json({ error: "질문을 5자 이상 입력해주세요." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("landing_questions")
      .insert({
        content: content.trim(),
        author_name: author_name?.trim() || "익명",
        author_id: user?.id ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    // Save to reactions table to track this session's submission
    if (session_key) {
      // Could be used for dedup in future
    }

    return NextResponse.json({ question: data }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
