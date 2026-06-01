import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import MyPageClient from "./MyPageClient";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getMyReviews, getMySessions } from "@/lib/supabase/queries";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "마이페이지",
  description: "나의 질문 DNA, 참여한 북토크, 작성한 후기를 확인합니다.",
  path: "/mypage",
  noIndex: true,
});

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 프로필 + 활동 데이터 병렬 로드
  const [profile, myReviews, mySessions] = await Promise.all([
    getProfile(user.id).catch(() => null),
    getMyReviews(user.id).catch(() => []),
    getMySessions(user.id).catch(() => []),
  ]);

  // 프로필 없으면 자동 생성 (Supabase Auth 직접 가입 사용자)
  let resolvedProfile = profile;
  if (!resolvedProfile) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;
      const { data } = await sb.from("profiles").upsert({
        id: user.id,
        email: user.email ?? "",
        name: user.user_metadata?.name ?? user.email?.split("@")[0] ?? "익명",
      }).select().single();
      resolvedProfile = data;
    } catch { /* ignore */ }
  }

  // resolvedProfile이 여전히 없으면 기본값으로 대체
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalProfile: any = resolvedProfile ?? {
    id: user.id,
    email: user.email ?? "",
    name: user.user_metadata?.name ?? user.email?.split("@")[0] ?? "익명",
    avatar_url: null,
    bio: null,
    joined_at: new Date().toISOString(),
    session_count: 0,
  };

  // Try to load onboarding answers from user metadata
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rawMeta = user.user_metadata as any;
  const onboardingAnswers = rawMeta?.onboarding_answers as Record<string, string | string[]> | undefined;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <MyPageClient
          profile={finalProfile}
          myReviews={myReviews}
          mySessions={mySessions}
          onboardingAnswers={onboardingAnswers}
        />
      </main>
      <Footer />
    </div>
  );
}
