import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { attachEncoreCounts } from "@/lib/bookclub-server";

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
    const rows = ((data ?? []) as any[]).filter((c) => !c.is_seed);
    const clubs = await attachEncoreCounts(sb, rows);
    return NextResponse.json({ clubs });
  } catch {
    return NextResponse.json({ clubs: [] });
  }
}
