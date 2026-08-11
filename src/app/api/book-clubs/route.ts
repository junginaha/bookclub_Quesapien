import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { attachEncoreCounts } from "@/lib/bookclub-server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "junginaha@gmail.com,kimjungin@qsapiens.com").split(",");

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mini = searchParams.get("mini");

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    let query = sb.from("landing_book_clubs").select("*").order("sort_order", { ascending: true });
    // is_mini가 NULL인 행(마이그레이션 016의 실클럽 INSERT는 이 컬럼을 세팅하지 않음)을
    // "미니 아님"으로 취급한다 — .eq("is_mini", false)는 NULL을 매치하지 않아 그 행들을
    // 통째로 걸러버렸다(홈 "지금 함께 읽어요"가 늘 비어 보이던 근본 원인).
    if (mini === "true") query = query.eq("is_mini", true);
    else if (mini === "false") query = query.or("is_mini.is.null,is_mini.eq.false");
    const { data, error } = await query;
    if (error) throw error;
    // is_seed 컬럼이 아직 없는 DB에서도 안전하도록 애플리케이션 레벨에서 필터한다.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = ((data ?? []) as any[])
      .filter((c) => !c.is_seed)
      .map(({ join_url: _joinUrl, ...club }) => club);
    const clubs = await attachEncoreCounts(sb, rows);

    // 홈 카드의 참여 현황도 실제 예약 테이블의 활성 확정 수를 기준으로 맞춘다.
    // 집계 뷰는 service_role 전용이며 이름·연락처는 조회하지 않는다.
    const ids = clubs.map((club: { id: string }) => club.id).filter(Boolean);
    if (ids.length > 0 && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
      const { data: signupCounts } = await createServiceClient()
        .from("landing_book_club_signup_counts")
        .select("club_id, applied_count")
        .in("club_id", ids);
      const counts = new Map(
        ((signupCounts ?? []) as { club_id: string; applied_count: number }[])
          .map((row) => [row.club_id, Number(row.applied_count ?? 0)])
      );
      return NextResponse.json({
        clubs: clubs.map((club: { id: string; current_participants?: number }) => ({
          ...club,
          current_participants: counts.get(club.id) ?? club.current_participants ?? 0,
        })),
      });
    }

    return NextResponse.json({ clubs });
  } catch {
    return NextResponse.json({ clubs: [] });
  }
}
