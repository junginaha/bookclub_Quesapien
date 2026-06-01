import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const giantSlug = searchParams.get("slug");
  const sessionKey = searchParams.get("session");

  if (!giantSlug || !sessionKey) {
    return NextResponse.json({ conversation: null });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;

    let query = sb.from("giants_conversations")
      .select("id, messages, updated_at")
      .eq("giant_slug", giantSlug)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (user) {
      query = query.eq("user_id", user.id);
    } else {
      query = query.eq("session_key", sessionKey);
    }

    const { data } = await query.single();
    return NextResponse.json({ conversation: data ?? null });
  } catch {
    return NextResponse.json({ conversation: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { giantSlug, giantName, sessionKey, messages, conversationId } = await req.json();

    if (!giantSlug || !sessionKey || !messages) {
      return NextResponse.json({ error: "필수 파라미터 없음" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;

    if (conversationId) {
      // 기존 대화 업데이트
      const { data } = await sb.from("giants_conversations")
        .update({ messages, updated_at: new Date().toISOString() })
        .eq("id", conversationId)
        .select("id")
        .single();
      return NextResponse.json({ id: data?.id ?? conversationId });
    }

    // 새 대화 저장
    const { data } = await sb.from("giants_conversations").insert({
      session_key: sessionKey,
      giant_slug: giantSlug,
      giant_name: giantName ?? giantSlug,
      user_id: user?.id ?? null,
      messages,
    }).select("id").single();

    return NextResponse.json({ id: data?.id });
  } catch (err) {
    console.error("Conversation save error:", err);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}
