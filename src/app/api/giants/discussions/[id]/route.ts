import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

    const body = await req.json();
    const allowed = ["is_public"];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }
    if (!Object.keys(update).length) return NextResponse.json({ error: "수정할 내용이 없어요." }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("giant_discussions")
      .update(update)
      .eq("id", id)
      .eq("author_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ discussion: data });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "오류" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("giant_discussions")
      .delete()
      .eq("id", id)
      .eq("author_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "오류" }, { status: 500 });
  }
}
