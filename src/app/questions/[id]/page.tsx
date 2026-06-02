import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import QuestionDetailClient from "./QuestionDetailClient";
import { getQuestionById, getSessionsByQuestion, getReviewsByQuestion } from "@/lib/supabase/queries";
import { mockQuestions } from "@/data/mockData";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

// 정적 랜딩 질문 (DB 미시드 시 폴백)
const STATIC_LANDING_QUESTIONS: Record<string, { content: string; author_name: string; answers_count: number }> = {
  "a1000001-0000-0000-0000-000000000001": { content: "당신은 마지막으로 언제, 진심으로 울었나요?", author_name: "편집팀", answers_count: 72 },
  "a1000001-0000-0000-0000-000000000002": { content: "인간은 왜 외로운가요?", author_name: "민재", answers_count: 56 },
  "a1000001-0000-0000-0000-000000000003": { content: "AI 시대에도 사랑은 여전히 중요할까요?", author_name: "서연", answers_count: 91 },
  "a1000001-0000-0000-0000-000000000004": { content: "당신을 살게 만든 한 문장은 무엇인가요?", author_name: "현우", answers_count: 143 },
  "a1000001-0000-0000-0000-000000000005": { content: "실패를 얼마나 오래 기억하시나요?", author_name: "지우", answers_count: 48 },
  "a1000001-0000-0000-0000-000000000006": { content: "지금 가장 피하고 싶은 대화는 무엇인가요?", author_name: "도연", answers_count: 62 },
  "a1000001-0000-0000-0000-000000000011": { content: "혼자 여행을 떠나본 적 있나요? 그 여행이 당신에게 남긴 것은?", author_name: "재희", answers_count: 12 },
  "a1000001-0000-0000-0000-000000000012": { content: "부모님께 아직 하지 못한 말이 있나요?", author_name: "하린", answers_count: 21 },
  "a1000001-0000-0000-0000-000000000013": { content: "당신의 20대를 한 단어로 표현한다면?", author_name: "민수", answers_count: 34 },
  "a1000001-0000-0000-0000-000000000014": { content: "오늘 하루 중 가장 솔직했던 순간은 언제인가요?", author_name: "채현", answers_count: 8 },
  "a1000001-0000-0000-0000-000000000015": { content: "지금 당신 곁에 있어줬으면 하는 사람은 누구인가요?", author_name: "은지", answers_count: 67 },
  "a1000001-0000-0000-0000-000000000016": { content: "읽다가 멈춘 책이 있나요? 왜 멈췄나요?", author_name: "진호", answers_count: 19 },
  "a1000001-0000-0000-0000-000000000017": { content: "당신에게 '집'은 어떤 의미인가요?", author_name: "세아", answers_count: 45 },
  "a1000001-0000-0000-0000-000000000018": { content: "마지막으로 새로운 사람과 깊은 대화를 한 건 언제인가요?", author_name: "현우", answers_count: 28 },
};

interface Props { params: Promise<{ id: string }>; }

export const revalidate = 30;

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let q: any = null;
  try { q = await getQuestionById(id); } catch { /* */ }
  if (!q) q = mockQuestions.find((m) => m.id === id);
  if (!q) return { title: "질문 상세" };
  const title = (q.title ?? q.content ?? "질문").slice(0, 60);
  return buildMetadata({
    title: `"${title}"`,
    description: q.description
      ? q.description.slice(0, 160)
      : `${title} — 질문하는 사람들의 북토크 질문. ${q.session_count ?? 0}회 진행, ${q.participant_total ?? 0}명 참여.`,
    path: `/questions/${id}`,
    type: "article",
    keywords: [...(q.tags ?? []), "북토크질문", "독서토론"],
    author: q.author?.name ?? q.author_name,
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function buildSchemas(id: string, q: { title: string; description?: string; session_count?: number; participant_total?: number }) {
  return {
    crumb: breadcrumbSchema([
      { name: "홈", href: "/" },
      { name: "질문", href: "/questions" },
      { name: q.title.slice(0, 40), href: `/questions/${id}` },
    ]),
    faq: faqSchema([{
      question: q.title,
      answer: q.description || `${q.session_count ?? 0}회 북토크에서 다루어진 질문입니다. ${q.participant_total ?? 0}명이 참여했습니다.`,
    }]),
  };
}

export default async function QuestionDetailPage({ params }: Props) {
  const { id } = await params;
  let question = null;
  let sessions: unknown[] = [];
  let reviews: unknown[] = [];
  let landingQ: unknown = null;
  let landingAnswers: unknown[] = [];

  try {
    [question, sessions, reviews] = await Promise.all([
      getQuestionById(id),
      getSessionsByQuestion(id),
      getReviewsByQuestion(id),
    ]);
  } catch { /* fallback */ }

  // landing_questions 테이블에서도 찾기
  if (!question) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;
      const [lqRes, laRes] = await Promise.all([
        sb.from("landing_questions").select("*").eq("id", id).single(),
        sb.from("landing_question_answers").select("*").eq("question_id", id).eq("is_approved", true).order("created_at", { ascending: false }).limit(30),
      ]);
      if (lqRes.data) { landingQ = lqRes.data; landingAnswers = laRes.data ?? []; }
    } catch { /* */ }
  }

  // 정적 랜딩 질문 폴백 (DB 미시드 시)
  if (!question && !landingQ && STATIC_LANDING_QUESTIONS[id]) {
    const sq = STATIC_LANDING_QUESTIONS[id];
    const { LandingQuestionView } = await import("./LandingQuestionView");
    const { crumb, faq } = buildSchemas(id, { title: sq.content, description: sq.content });
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
        <JsonLd data={crumb} />
        <JsonLd data={faq} />
        <Header />
        <main className="flex-1">
          <LandingQuestionView question={{ id, content: sq.content, author_name: sq.author_name, answers_count: sq.answers_count }} answers={[]} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!question && !landingQ) {
    const mockQ = mockQuestions.find((q) => q.id === id);
    if (!mockQ) notFound();
    const { crumb, faq } = buildSchemas(id, {
      title: mockQ.title,
      description: mockQ.description,
      session_count: mockQ.session_count,
      participant_total: mockQ.participant_total,
    });
    return (
      <div className="min-h-screen flex flex-col">
        <JsonLd data={crumb} />
        <JsonLd data={faq} />
        <Header />
        <main className="flex-1">
          <QuestionDetailClient questionId={id} seedQuestion={mockQ} initialSessions={[]} initialReviews={[]} />
        </main>
        <Footer />
      </div>
    );
  }

  // landing_question 뷰
  if (landingQ && !question) {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const lq = landingQ as any;
    const { crumb, faq } = buildSchemas(id, { title: lq.content ?? "", description: lq.content });
    /* eslint-enable @typescript-eslint/no-explicit-any */
    const { LandingQuestionView } = await import("./LandingQuestionView");
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
        <JsonLd data={crumb} />
        <JsonLd data={faq} />
        <Header />
        <main className="flex-1">
          <LandingQuestionView question={landingQ} answers={landingAnswers} />
        </main>
        <Footer />
      </div>
    );
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const qAny = question as any;
  const { crumb, faq } = buildSchemas(id, {
    title: qAny.title ?? "",
    description: qAny.description,
    session_count: qAny.session_count,
    participant_total: qAny.participant_total,
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={crumb} />
      <JsonLd data={faq} />
      <Header />
      <main className="flex-1">
        <QuestionDetailClient
          questionId={id}
          seedQuestion={question as Parameters<typeof QuestionDetailClient>[0]["seedQuestion"]}
          initialSessions={sessions}
          initialReviews={reviews}
        />
      </main>
      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
  return mockQuestions.map((q) => ({ id: q.id }));
}
