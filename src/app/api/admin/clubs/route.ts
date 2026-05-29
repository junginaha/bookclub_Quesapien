import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "quesapience2024";

function checkKey(req: NextRequest) {
  return req.headers.get("x-admin-key") === ADMIN_KEY;
}

export async function GET(request: NextRequest) {
  if (!checkKey(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (createServiceClient() as any)
      .from("landing_book_clubs")
      .select("*")
      .order("is_mini", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ clubs: data ?? [] });
  } catch {
    return NextResponse.json({ clubs: [] });
  }
}

export async function PATCH(request: NextRequest) {
  if (!checkKey(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json() as Record<string, unknown>;
    const { slug, ...fields } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "slug 필요" }, { status: 400 });
    }

    const allowed = [
      "schedule", "location", "location_url", "join_url",
      "description", "host_name", "host_intro",
      "max_participants", "current_participants",
      "session_dates", "season_number", "status",
    ];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in fields) update[key] = fields[key];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (createServiceClient() as any)
      .from("landing_book_clubs")
      .update(update)
      .eq("slug", slug)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ club: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
