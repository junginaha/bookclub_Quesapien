import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { type, session_key } = await req.json() as { type: "like" | "save"; session_key: string };
    if (!type || !["like", "save"].includes(type)) {
      return NextResponse.json({ error: "type must be 'like' or 'save'" }, { status: 400 });
    }

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    const { data: { user } } = await supabase.auth.getUser();
    const key = session_key || "anon";

    // Toggle reaction
    const existingQuery = sb.from("landing_question_reactions")
      .select("id").eq("question_id", id).eq("type", type);
    if (user) { existingQuery.eq("user_id", user.id); }
    else { existingQuery.eq("session_key", key); }

    const { data: existing } = await existingQuery.maybeSingle();

    const col = type === "like" ? "likes" : "saves";

    if (existing) {
      await sb.from("landing_question_reactions").delete().eq("id", existing.id);
      await sb.from("landing_questions").update({ [col]: sb.raw(`${col} - 1`) }).eq("id", id);
      return NextResponse.json({ reacted: false });
    }

    await sb.from("landing_question_reactions").insert({
      question_id: id, type,
      user_id: user?.id ?? null,
      session_key: user ? null : key,
    });
    const { data } = await sb.from("landing_questions")
      .update({ [col]: sb.raw(`${col} + 1`) })
      .eq("id", id).select("likes, saves").single();
    return NextResponse.json({ reacted: true, likes: data?.likes, saves: data?.saves });
  } catch (err) {
    console.error("Reaction error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
