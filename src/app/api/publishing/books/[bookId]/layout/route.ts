import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BACKEND = process.env.PUBLISHING_BACKEND_URL || "http://localhost:8001";
async function getUserId() {
  try {
    const s = await createClient();
    const { data: { user } } = await s.auth.getUser();
    return user?.id ?? null;
  } catch { return null; }
}
type Params = { params: Promise<{ bookId: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  const { bookId } = await params;
  const res = await fetch(`${BACKEND}/api/books/${bookId}/layout?user_id=${userId}`);
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  const { bookId } = await params;
  const body = await req.json();
  const res = await fetch(`${BACKEND}/api/books/${bookId}/layout?user_id=${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
