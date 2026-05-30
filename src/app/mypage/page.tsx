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

  // Fetch profile, reviews, sessions, and onboarding answers in parallel
  const [profile, myReviews, mySessions] = await Promise.all([
    getProfile(user.id),
    getMyReviews(user.id).catch(() => []),
    getMySessions(user.id).catch(() => []),
  ]);

  if (!profile) redirect("/login");

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
          profile={profile}
          myReviews={myReviews}
          mySessions={mySessions}
          onboardingAnswers={onboardingAnswers}
        />
      </main>
      <Footer />
    </div>
  );
}
