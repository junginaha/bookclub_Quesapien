import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import QuestionsClient from "./QuestionsClient";
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

  try {
    const supabase = await createClient();
    const [todayRes, featuredRes, recentRes] = await Promise.all([
      supabase.from("landing_questions").select("*").eq("is_today", true).limit(1).single(),
      supabase.from("landing_questions").select("*").eq("is_featured", true).eq("is_approved", true).order("likes", { ascending: false }).limit(5),
      supabase.from("landing_questions").select("*").eq("is_approved", true).order("created_at", { ascending: false }).limit(12),
    ]);
    todayQuestion = todayRes.data;
    featuredQuestions = featuredRes.data ?? [];
    recentQuestions = recentRes.data ?? [];
  } catch { /* static fallback */ }

  // Stage 1: CollectionPage + BreadcrumbList JSON-LD
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
      {/* Stage 1: Structured data */}
      <JsonLd data={collectionLd} />
      <JsonLd data={crumbLd} />

      <Header />

      {/* Stage 4: AI Friendly Definition Block */}
      <DefinitionBlock
        definition="질문하는 사람들의 질문 아카이브. 매일 한 개의 오늘의 질문이 등록되며, 커뮤니티 구성원이 자신의 질문을 남길 수 있다. 좋은 질문은 북토크 주제로 이어진다."
        entityType="QuestionArchive"
      />

      <main style={{ flex: 1 }}>
        <QuestionsClient
          todayQuestion={todayQuestion}
          featuredQuestions={featuredQuestions}
          recentQuestions={recentQuestions}
        />
      </main>
      <Footer />
    </div>
  );
}
