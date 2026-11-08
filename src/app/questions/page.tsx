import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import QuestionsClient from "./QuestionsClient";
import BookclubQuestions from "./BookclubQuestions";
import { BOOKCLUB_SESSIONS } from "@/lib/bookclub/data";
import { getStatus, dateKey } from "@/lib/bookclub/selectors";
import DefinitionBlock from "@/components/seo/DefinitionBlock";
import { createClient } from "@/lib/supabase/server";
import { questionCollectionSchema, breadcrumbSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "질문 — 북클럽 발제와 오늘의 질문",
  description:
    "질문하는 사람들 북클럽에서 함께 나눈 질문과 발제를 책별로 모았습니다. 다가오는 북토크 발제, 지난 모임의 질문, 오늘의 질문까지 한곳에서 보고 당신의 질문을 남겨보세요.",
  path: "/questions",
  type: "website",
  keywords: ["오늘의질문", "인기질문", "독서질문", "북클럽질문", "질문아카이브", "독서모임 발제", "북토크 발제문", "발제 질문"],
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

  // 오늘의 질문 = 다가오는 북토크의 실제 질문(2026-11-09 운영자: "있는 데이터 최대 활용, 삭제는 천천히").
  // DB의 기존 '오늘의 질문'은 지우지 않는다 — 화면 맨 위 자리만 실제 모임 질문에 내어 준다.
  const nextTalk = BOOKCLUB_SESSIONS
    .filter((s) => getStatus(s) !== "past" && (s.leadQuestion ?? "").trim().endsWith("?"))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0];
  const bookclubToday = nextTalk
    ? (() => {
        const [, m, d] = dateKey(nextTalk.startsAt).split("-").map(Number);
        return { question: nextTalk.leadQuestion, bookTitle: nextTalk.bookTitle, when: `${m}월 ${d}일`, href: `/bookclub/${nextTalk.slug}` };
      })()
    : null;

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
        definition="질문하는 사람들의 질문 아카이브입니다. 공개된 오늘의 질문·인기 질문·최근 질문을 살펴보고 자신의 질문을 남길 수 있습니다. 질문을 바탕으로 책과 북토크 주제를 탐색합니다."
        entityType="QuestionArchive"
      />

      <main style={{ flex: 1 }}>
        <QuestionsClient
          todayQuestion={todayQuestion}
          featuredQuestions={featuredQuestions}
          recentQuestions={recentQuestions}
          bookclubQuestions={<BookclubQuestions />}
          bookclubToday={bookclubToday}
        />
      </main>
      <Footer />
    </div>
  );
}
