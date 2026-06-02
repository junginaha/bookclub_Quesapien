import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json() as {
      email: string; password: string; name?: string;
    };

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "이메일과 비밀번호를 입력해주세요." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "비밀번호는 8자 이상이어야 해요." }, { status: 400 });
    }

    // service role → email_confirm: true 로 즉시 확인 처리 (이메일 링크 불필요)
    const admin = createServiceClient() as any;
    const displayName = name?.trim() || email.split("@")[0];

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,           // 이메일 확인 즉시 처리
      user_metadata: { name: displayName },
    });

    if (createErr) {
      if (createErr.message?.includes("already been registered") ||
          createErr.message?.includes("already registered") ||
          createErr.message?.includes("User already exists") ||
          createErr.status === 422) {
        return NextResponse.json({ error: "이미 가입된 이메일이에요." }, { status: 409 });
      }
      return NextResponse.json({ error: createErr.message }, { status: 400 });
    }

    // profiles 행 생성
    if (created?.user) {
      await admin.from("profiles").upsert({
        id: created.user.id,
        email: email.trim().toLowerCase(),
        name: displayName,
        avatar_url: null,
        bio: null,
        joined_at: new Date().toISOString(),
        session_count: 0,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "서버 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
