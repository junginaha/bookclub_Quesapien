import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isOperator } from "@/lib/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!(await isOperator(supabase))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json() as {
    club_id: string; book_title?: string; book_isbn?: string;
    starts_at: string; place_name?: string; capacity?: number;
  };

  if (!body.club_id || !body.starts_at) {
    return NextResponse.json({ error: "club_id와 starts_at은 필수예요." }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data, error } = await db.from("meetings").insert({
    club_id: body.club_id,
    book_title: body.book_title || null,
    book_isbn: body.book_isbn || null,
    starts_at: body.starts_at,
    place_name: body.place_name || null,
    capacity: body.capacity ? Number(body.capacity) : null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ meeting: data });
}
