import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// M0 온보딩 3탭 저장. 본인 행만 쓸 수 있으므로(RLS profiles_update_own) anon 클라이언트로 충분하다.
// is_operator는 authenticated 롤에서 REVOKE UPDATE 되어 있어 이 라우트로도 변경할 수 없다(§C0).
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const body = await request.json() as {
    nickname: string;
    phone?: string | null;
    phoneConsent?: boolean;
    region?: { lat: number; lng: number } | null;
  };

  if (!body.nickname?.trim()) {
    return NextResponse.json({ error: "닉네임을 입력해주세요." }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const update: Record<string, unknown> = {
    nickname: body.nickname.trim(),
    onboarding_completed_at: new Date().toISOString(),
  };

  if (body.phone?.trim() && body.phoneConsent) {
    update.phone = body.phone.trim();
    update.phone_consented_at = new Date().toISOString();
  }

  if (body.region) {
    update.home_region = `POINT(${body.region.lng} ${body.region.lat})`;
  }

  const { error } = await db.from("profiles").update(update).eq("id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
