import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import TrustedQuestionsClient, { type CommunityStats } from "./TrustedQuestionsClient";
import DefinitionBlock from "@/components/seo/DefinitionBlock";
import { createClient } from "@/lib/supabase/server";
import { questionCollectionSchema, breadcrumbSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "질문 — 오늘의 질문과 인기 질문",
  description:
    "질문하는 사람들의 질문 아카이브. 오늘의 질문, 인기 질문, 최근 질문을 탐색하고 당신만의 질문을 남겨보세요. 좋은 질문은 좋은 사람을 데려옵니다.",
  path: "/questions",
  type: "website",
  keywords: ["오늘의질문", "인기질문", "독서질문", "북클럽질문", "질문아카이브"],
});

export const revalidate = 30;

export default async function QuestionsPage() {
  let todayQuestion = null;
  let featuredQuestions: unknown[] = [];
  let recentQuestions: unknown[] = [];
  let communityStats: CommunityStats | null = null;

  try {
    const supabase = await createClient();
    const [todayRes, featuredRes, recentRes, questionCountRes, answerCountRes] = await Promise.all([
      supabase.from("landing_questions").select("*").eq("is_today", true).limit(1).single(),
      supabase
        .from("landing_questions")
        .select("*")
        .eq("is_featured", true)
        .eq("is_approved", true)
        .order("likes", { ascending: false })
        .limit(5),
      supabase
        .from("landing_questions")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("landing_questions")
        .select("id", { count: "exact", head: true })
        .eq("is_approved", true),
      supabase
        .from("landing_question_answers")
        .select("id", { count: "exact", head: true })
        .eq("is_approved", true),
    ]);

    todayQuestion = todayRes.data;
    featuredQuestions = featuredRes.data ?? [];
    recentQuestions = recentRes.data ?? [];

    if (!questionCountRes.error && !answerCountRes.error) {
      communityStats = {
        questions: questionCountRes.count ?? 0,
        answers: answerCountRes.count ?? 0,
      };
    }
  } catch {
    // 데이터 연결이 끊기면 정적 활동량을 만들지 않고 준비 안내만 표시한다.
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const allQ = [...featuredQuestions, ...recentQuestions] as any[];
  const collectionLd = questionCollectionSchema(
    allQ.map((q) => ({ content: q.content ?? "", author_name: q.author_name ?? "익명" }))
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const crumbLd = breadcrumbSchema([
    { name: "홈", href: "/" },
    { name: "질문", href: "/questions" },
  ]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <JsonLd data={collectionLd} />
      <JsonLd data={crumbLd} />

      <Header />

      <DefinitionBlock
        definition="질문하는 사람들의 질문 아카이브. 매일 한 개의 오늘의 질문이 등록되며, 커뮤니티 구성원이 자신의 질문을 남길 수 있다. 좋은 질문은 북토크 주제로 이어진다."
        entityType="QuestionArchive"
      />

      <main style={{ flex: 1 }}>
        <TrustedQuestionsClient
          todayQuestion={todayQuestion}
          featuredQuestions={featuredQuestions}
          recentQuestions={recentQuestions}
          communityStats={communityStats}
        />
      </main>
      <Footer />
    </div>
  );
}
