import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const type = searchParams.get("type"); // 'recovery' for password reset

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;
      // 비밀번호 재설정 흐름
      if (type === "recovery" || next.includes("reset-password")) {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // 최초 로그인 시 profiles 행 생성
      try {
        const serviceClient = createServiceClient() as any;
        const { data: existing } = await serviceClient
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existing) {
          const name = user.user_metadata?.name
            || user.email?.split("@")[0]
            || "익명";
          await serviceClient.from("profiles").insert({
            id: user.id,
            email: user.email ?? "",
            name,
            avatar_url: null,
            bio: null,
            joined_at: new Date().toISOString(),
            session_count: 0,
          });
        }
      } catch { /* 프로필 생성 실패해도 로그인은 계속 */ }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 코드가 없거나 교환 실패
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
