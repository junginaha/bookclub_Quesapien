/**
 * POST /api/bookclub/signup
 * 북클럽 참가 게시판 신청 — apply_to_book_club_signup() RPC(트랜잭션, 클럽 행
 * FOR UPDATE 잠금)를 service role로 호출한다. 정원(capacity)은 이 라우트를
 * 거쳐 클라이언트로 절대 반환하지 않는다 — kind/position만 돌려준다.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { REAL_CLUBS } from "@/lib/bookclub";

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

  let { data: club, error: clubError } = await db
    .from("landing_book_clubs")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  // 보드 화면(/bookclub)은 landing_book_clubs가 비어 있어도 REAL_CLUBS 정적
  // 폴백으로 카드를 보여준다 — 그런데 이 마이그레이션(016)이 라이브 DB에
  // 아직 반영되지 않았으면 카드는 보이는데 신청은 항상 이 404로 막히는
  // 상태가 된다. 실데이터(is_seed:false)에 한해 같은 내용을 지금 심어서
  // 복구한다(가짜 데이터 아님 — 마이그레이션 016이 넣는 값과 동일).
  if (!clubError && !club) {
    const seed = REAL_CLUBS.find((c) => c.slug === slug && !c.is_seed);
    if (seed) {
      await db.from("landing_book_clubs").upsert(
        {
          slug: seed.slug,
          title: seed.title,
          author: seed.author,
          color: seed.color,
          genre: seed.genre,
          tag: seed.tag,
          is_seed: false,
          host_name: seed.host_name,
          event_starts_at: seed.event_starts_at,
          location: seed.location,
          price: seed.price,
          max_participants: seed.max_participants,
          current_participants: seed.current_participants ?? 0,
          reason: seed.reason,
          description: seed.description,
          recommended_for: seed.recommended_for,
          session_format: seed.session_format,
          status: seed.status ?? "active",
        },
        { onConflict: "slug", ignoreDuplicates: true }
      );

      ({ data: club, error: clubError } = await db
        .from("landing_book_clubs")
        .select("id")
        .eq("slug", slug)
        .maybeSingle());
    }
  }

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
