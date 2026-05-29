import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "junginaha@gmail.com").split(",");

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
    return NextResponse.json({ clubs: data ?? [] });
  } catch {
    return NextResponse.json({ clubs: [] });
  }
}
