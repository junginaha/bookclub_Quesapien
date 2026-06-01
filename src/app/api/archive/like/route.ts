import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { review_id, session_key } = await req.json() as { review_id: string; session_key: string };
    if (!review_id) return NextResponse.json({ error: "review_id required" }, { status: 400 });

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;

    // Check if already liked
    const { data: existing } = await sb
      .from("archive_review_likes")
      .select("id")
      .eq("review_id", review_id)
      .eq("session_key", session_key || "anon")
      .maybeSingle();

    if (existing) {
      // Unlike
      await sb.from("archive_review_likes").delete().eq("id", existing.id);
      await sb.from("archive_reviews").update({ likes: sb.raw("likes - 1") }).eq("id", review_id);
      return NextResponse.json({ liked: false });
    }

    // Like
    await sb.from("archive_review_likes").insert({ review_id, session_key: session_key || "anon" });
    const { data } = await sb
      .from("archive_reviews")
      .update({ likes: sb.raw("likes + 1") })
      .eq("id", review_id)
      .select("likes")
      .single();
    return NextResponse.json({ liked: true, likes: data?.likes ?? 1 });
  } catch (err) {
    console.error("Like error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
