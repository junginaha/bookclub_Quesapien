import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, content, author_name, photo_url, video_url, is_public } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("archive_reviews").insert({
        type: type ?? "text",
        content,
        author_name: author_name || "익명",
        author_id: user?.id ?? null,
        photo_url: photo_url || null,
        video_url: video_url || null,
        is_approved: is_public !== false, // 공개 선택 시 즉시 승인
        created_at: new Date().toISOString(),
      });
    } catch {
      // 테이블 없으면 무시
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Archive review error:", err);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}
