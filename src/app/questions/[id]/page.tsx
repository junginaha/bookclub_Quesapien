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
