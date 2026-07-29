/**
 * POST /api/bookclub/signup
 * 북클럽 참가 게시판 신청 — apply_to_book_club_signup() RPC(트랜잭션, 클럽 행
 * FOR UPDATE 잠금)를 service role로 호출한다. 정원(capacity)은 이 라우트를
 * 거쳐 클라이언트로 절대 반환하지 않는다 — kind/position만 돌려준다.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  let body: { slug?: string; name?: string; contact?: string; subscribe?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { slug, name, contact, subscribe = true } = body;
  if (!slug || !name?.trim() || !contact?.trim()) {
    return NextResponse.json({ error: "이름과 연락처를 입력해주세요." }, { status: 400 });
  }

  const db = createServiceClient();

  const { data: club, error: clubError } = await db
    .from("landing_book_clubs")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (clubError || !club) {
    return NextResponse.json({ error: "북클럽을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data, error } = await db.rpc("apply_to_book_club_signup", {
    p_club_id: (club as { id: string }).id,
    p_name: name.trim(),
    p_contact: contact.trim(),
    p_subscribe: subscribe,
  });

  if (error) {
    return NextResponse.json({ error: "신청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }

  const result = data as { kind: "signup" | "wait"; position?: number };
  return NextResponse.json({ kind: result.kind, position: result.position ?? null });
}
