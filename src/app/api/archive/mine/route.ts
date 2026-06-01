import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ reviews: [] });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("archive_reviews")
      .select("id, type, content, author_name, photo_url, video_url, likes, is_approved, created_at")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ reviews: data ?? [] });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}
