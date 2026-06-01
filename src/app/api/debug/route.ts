import { NextResponse } from "next/server";
export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY ?? "";
  return NextResponse.json({
    hasKey: key.length > 0,
    keyPrefix: key.slice(0, 12) || "(없음)",
    isOpenRouter: key.startsWith("sk-or-v1-"),
  });
}
