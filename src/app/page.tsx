import type { Metadata } from "next";
import LandingPage from "@/components/home/LandingPage";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { createClient } from "@/lib/supabase/server";
import type { LandingQuestion } from "@/components/home/LandingPage";

export const revalidate = 300; // 5분 캐시

export const metadata: Metadata = buildMetadata({
  title: "질문하는 사람들 — 미래혁신형 북클럽",
  description:
    "좋은 질문은 좋은 사람을 데려옵니다. 질문하는 사람들은 질문을 중심으로 사람과 책을 연결하는 오프라인 북토크 커뮤니티입니다. 서초구 선정 미래혁신형 북클럽.",
  path: "/",
  type: "website",
  keywords: [
    "질문하는사람들", "Quesapience", "서초구북클럽",
    "미래혁신형북클럽", "오프라인독서모임", "북토크",
    "외로움시즌", "독서질문", "지적커뮤니티",
  ],
});

const landingSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://quesapience.com"}/#homepage`,
  name: "질문하는 사람들 — 미래혁신형 북클럽",
  description: "좋은 질문은 좋은 사람을 데려옵니다. 질문 → 책 → 대화 → 사람 → 성장으로 이어지는 지적 커뮤니티.",
  publisher: { "@id": `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://quesapience.com"}/#organization` },
  inLanguage: "ko",
  about: [
    { "@type": "Thing", name: "독서모임" },
    { "@type": "Thing", name: "북클럽" },
    { "@type": "Thing", name: "질문 기반 대화" },
  ],
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [".lp-h-display", ".lp-lede", ".lp-q-text"],
  },
};

export default async function HomePage() {
  let todayQuestion: LandingQuestion | null = null;
  let recentQuestions: LandingQuestion[] = [];

  try {
    const supabase = await createClient();
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const sb = supabase as any;
    const [todayRes, recentRes] = await Promise.all([
      sb.from("landing_questions")
        .select("id, content, author_name, likes, saves, answers_count")
        .eq("is_today", true).eq("is_approved", true).limit(1).single(),
      sb.from("landing_questions")
        .select("id, content, author_name, likes, saves, answers_count")
        .eq("is_approved", true).order("likes", { ascending: false }).limit(6),
    ]);
    if (todayRes.data) todayQuestion = todayRes.data as LandingQuestion;
    if (recentRes.data) recentQuestions = recentRes.data as LandingQuestion[];
    /* eslint-enable @typescript-eslint/no-explicit-any */
  } catch {
    // static fallback in LandingPage
  }

  return (
    <>
      <JsonLd data={landingSchema} />
      <LandingPage
        todayQuestion={todayQuestion}
        recentQuestions={recentQuestions}
      />
    </>
  );
}
