import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { attachEncoreCounts } from "@/lib/bookclub-server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "junginaha@gmail.com,kimjungin@quesapience.com").split(",");

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mini = searchParams.get("mini");

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    let query = sb.from("landing_book_clubs").select("*").order("sort_order", { ascending: true });
    if (mini === "true") query = query.eq("is_mini", true);
    else if (mini === "false") query = query.eq("is_mini", false);
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
