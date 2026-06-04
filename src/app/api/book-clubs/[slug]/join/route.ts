/**
 * GET /api/book-clubs/[slug]/join
 * 참여 링크를 클라이언트에 노출하지 않고 서버 측에서 리다이렉트
 */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: _s } = await params;
  const slug = decodeURIComponent(_s);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any;
  const { data } = await db
    .from("landing_book_clubs")
    .select("join_url, status, max_participants, current_participants")
    .eq("slug", slug)
    .single();

  if (!data?.join_url?.trim()) {
    return NextResponse.json({ error: "참여 링크가 설정되지 않았습니다." }, { status: 404 });
  }

  // 마감 확인
  if (data.status === "closed") {
    return NextResponse.json({ error: "마감된 모임입니다." }, { status: 410 });
  }
  if (data.max_participants && data.current_participants >= data.max_participants) {
    return NextResponse.json({ error: "정원이 찼습니다." }, { status: 410 });
  }

  // 서버 리다이렉트 — 클라이언트에 URL 비노출
  return NextResponse.redirect(data.join_url, { status: 302 });
}
