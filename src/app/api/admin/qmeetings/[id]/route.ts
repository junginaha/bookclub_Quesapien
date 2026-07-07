import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isOperator } from "@/lib/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  if (!(await isOperator(supabase))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const payload: Record<string, unknown> = {};
  for (const key of ["book_title", "book_isbn", "starts_at", "place_name", "capacity", "status"]) {
    if (key in body) payload[key] = body[key];
  }

  const { data, error } = await db.from("meetings").update(payload).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ meeting: data });
}
