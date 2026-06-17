import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BACKEND = process.env.PUBLISHING_BACKEND_URL || "http://localhost:8001";

async function getUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

type Params = { params: Promise<{ bookId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  const { bookId } = await params;
  const res = await fetch(`${BACKEND}/api/books/${bookId}?user_id=${userId}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  const { bookId } = await params;
  const body = await req.json();
  const res = await fetch(`${BACKEND}/api/books/${bookId}?user_id=${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  const { bookId } = await params;
  const res = await fetch(`${BACKEND}/api/books/${bookId}?user_id=${userId}`, {
    method: "DELETE",
  });
  return new NextResponse(null, { status: res.status });
}
