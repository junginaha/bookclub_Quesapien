import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const REACTIONS = ["up", "neutral", "down"] as const;
type Reaction = (typeof REACTIONS)[number];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as {
    discussion_id?: string | null;
    session_key?: string;
    reaction?: string;
    comment?: string;
    input_text?: string;
  };

  const sessionKey = typeof body.session_key === "string" ? body.session_key.trim() : "";
  const reaction = body.reaction as Reaction;

  if (!sessionKey || !REACTIONS.includes(reaction)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const discussionId = typeof body.discussion_id === "string" ? body.discussion_id : null;
  const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 200) : null;
  const inputText = typeof body.input_text === "string" ? body.input_text.trim().slice(0, 300) : null;

  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;

    if (discussionId) {
      await sb.from("discussion_feedback")
        .delete()
        .eq("discussion_id", discussionId)
        .eq("session_key", sessionKey);
    }

    await sb.from("discussion_feedback").insert({
      discussion_id: discussionId,
      session_key: sessionKey,
      reaction,
      comment,
      input_text: inputText,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Discussion feedback save error:", err);
    return NextResponse.json({ success: false });
  }
}
