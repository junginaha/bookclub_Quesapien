import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isOperator } from "@/lib/admin";

// D1.5 ④ 품질 게이트 검증용: 운영자가 강제로 에러를 발생시켜
// Sentry에 실제로 잡히는지 확인하는 라우트. 운영자 전용.
export async function GET() {
  const supabase = await createClient();

  if (!(await isOperator(supabase))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  throw new Error("[Quesapience] Sentry 강제 에러 테스트 — 이 에러가 보이면 정상입니다.");
}
