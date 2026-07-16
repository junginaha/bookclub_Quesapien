import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("archive_reviews")
      .select("id, type, content, author_name, photo_url, video_url, likes, created_at")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(60);
    return NextResponse.json({ reviews: data ?? [] });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

const REVIEW_TYPES = new Set(["text", "photo", "video"]);
const VIDEO_EMBED_HOSTS = new Set([
  "youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com",
  "vimeo.com", "player.vimeo.com",
]);

function isAllowedMediaUrl(url: string, kind: "photo" | "video"): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      const supabaseHost = new URL(supabaseUrl).host;
      if (parsed.host === supabaseHost && parsed.pathname.startsWith("/storage/v1/object/public/reviews/")) {
        return true;
      }
    } catch {
      // ignore malformed env url
    }
  }

  // 영상은 업로드 파일 외에 YouTube/Vimeo 링크도 허용 (UI가 임베드로 지원)
  if (kind === "video" && VIDEO_EMBED_HOSTS.has(parsed.host)) return true;

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
    }

    const rawType = typeof body.type === "string" ? body.type : "text";
    const type = REVIEW_TYPES.has(rawType) ? rawType : "text";

    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (content.length < 1 || content.length > 4000) {
      return NextResponse.json({ error: "내용을 1~4000자 사이로 입력해주세요." }, { status: 400 });
    }

    const authorName = (typeof body.author_name === "string" ? body.author_name.trim() : "").slice(0, 50) || "익명";

    let photoUrl: string | null = null;
    if (type === "photo" && typeof body.photo_url === "string" && body.photo_url.trim()) {
      const candidate = body.photo_url.trim();
      if (!isAllowedMediaUrl(candidate, "photo")) {
        return NextResponse.json({ error: "허용되지 않은 사진 링크입니다." }, { status: 400 });
      }
      photoUrl = candidate;
    }

    let videoUrl: string | null = null;
    if (type === "video" && typeof body.video_url === "string" && body.video_url.trim()) {
      const candidate = body.video_url.trim();
      if (!isAllowedMediaUrl(candidate, "video")) {
        return NextResponse.json({ error: "허용되지 않은 영상 링크입니다." }, { status: 400 });
      }
      videoUrl = candidate;
    }

    const isPublic = body.is_public !== false;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("archive_reviews").insert({
      type,
      content,
      author_name: authorName,
      author_id: user?.id ?? null,
      photo_url: photoUrl,
      video_url: videoUrl,
      is_approved: isPublic,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Archive review insert error:", error.message);
      return NextResponse.json({ error: "저장 실패" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Archive review error:", err);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}
