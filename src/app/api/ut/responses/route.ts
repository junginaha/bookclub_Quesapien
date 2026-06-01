import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const answers = await req.json();
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("ut_responses")
      .insert({ answers });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("ut_responses")
    .select("id, created_at, answers")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function DELETE() {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("ut_responses")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
