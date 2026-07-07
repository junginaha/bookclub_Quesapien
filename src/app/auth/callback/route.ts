import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const type = searchParams.get("type"); // 'recovery' for password reset
  const consented = searchParams.get("consent") === "1"; // §D1.5① 가입 동의 체크박스, SignupForm에서 전달

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;
      // 비밀번호 재설정 흐름
      if (type === "recovery" || next.includes("reset-password")) {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      let needsOnboarding = false;
      let nickname: string | null = null;

      // profiles 행은 DB 트리거 public.handle_new_user()가 auth.users insert와 함께
      // 즉시 만들어주므로, "행이 있는지"가 아니라 onboarding_completed_at으로 신규 유저를 구분한다.
      try {
        const serviceClient = createServiceClient() as any;
        const { data: existing } = await serviceClient
          .from("profiles")
          .select("id, nickname, privacy_consented_at, onboarding_completed_at")
          .eq("id", user.id)
          .single();

        if (!existing) {
          // 트리거가 아직 반영되기 전 극히 드문 race — 보완 insert.
          needsOnboarding = true;
          const name = user.user_metadata?.nickname
            || user.user_metadata?.name
            || user.user_metadata?.full_name
            || user.email?.split("@")[0]
            || "익명";
          nickname = name;
          await serviceClient.from("profiles").insert({
            id: user.id,
            email: user.email ?? "",
            name,
            nickname: name,
            avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
            bio: null,
            joined_at: new Date().toISOString(),
            session_count: 0,
            privacy_consented_at: consented ? new Date().toISOString() : null,
          });
          await logEvent(serviceClient, "signup", { provider: user.app_metadata?.provider ?? "email" }, user.id);
        } else {
          nickname = existing.nickname;
          needsOnboarding = !existing.onboarding_completed_at;
          if (needsOnboarding) {
            await logEvent(serviceClient, "signup", { provider: user.app_metadata?.provider ?? "email" }, user.id);
          }
          // 기존 유저가 재로그인하며 동의했는데 아직 기록이 없으면 지금 기록한다(소급).
          if (consented && !existing.privacy_consented_at) {
            await serviceClient
              .from("profiles")
              .update({ privacy_consented_at: new Date().toISOString() })
              .eq("id", user.id);
          }
        }
      } catch { /* 프로필 생성 실패해도 로그인은 계속 */ }

      // 온보딩 미완료 유저는 프로필 온보딩(닉네임/전화번호/관심지역)으로 보낸다 — 여정 ③, 60초 내 마이페이지 도달이 완료 기준
      if (needsOnboarding) {
        const onboardingNext = next.startsWith("/") ? next : "/";
        return NextResponse.redirect(
          `${origin}/onboarding/profile?next=${encodeURIComponent(onboardingNext)}&nickname=${encodeURIComponent(nickname ?? "")}`
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 코드가 없거나 교환 실패
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
