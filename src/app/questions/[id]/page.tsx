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
  // 외로움 추가
  "a1000001-0000-0000-0000-000000000019": { content: "혼자 밥을 먹을 때 어떤 생각이 드나요?", author_name: "소희", answers_count: 31 },
  "a1000001-0000-0000-0000-000000000020": { content: "외로움을 스스로 선택한 적이 있나요?", author_name: "정우", answers_count: 24 },
  // 관계 추가
  "a1000001-0000-0000-0000-000000000021": { content: "오래된 친구가 떠오를 때, 그 감정은 무엇인가요?", author_name: "유나", answers_count: 38 },
  // 성장 추가
  "a1000001-0000-0000-0000-000000000022": { content: "실수로부터 배운 가장 중요한 것은 무엇인가요?", author_name: "재원", answers_count: 52 },
  "a1000001-0000-0000-0000-000000000023": { content: "당신은 어떤 순간에 가장 크게 성장했나요?", author_name: "하은", answers_count: 44 },
  // 독서 추가
  "a1000001-0000-0000-0000-000000000024": { content: "책 한 권이 당신의 생각을 바꿔준 적이 있나요?", author_name: "도윤", answers_count: 29 },
  "a1000001-0000-0000-0000-000000000025": { content: "당신이 가장 많이 밑줄 친 문장은 무엇인가요?", author_name: "서진", answers_count: 61 },
};

// 정적 샘플 답변 (질문 상세 페이지에 미리 보여주기 위한 데이터)
const STATIC_SAMPLE_ANSWERS: Record<string, Array<{ id: string; author_name: string; content: string; created_at: string }>> = {
  "a1000001-0000-0000-0000-000000000001": [
    { id: "sa-001-1", author_name: "채현", content: "아버지 장례식 끝나고 지하철에서. 그게 마지막이었던 것 같아요.", created_at: "2026-05-20T10:00:00Z" },
    { id: "sa-001-2", author_name: "현우", content: "운 적은 많은데, 진심으로 운 적은 기억이 잘 안 나요.", created_at: "2026-05-21T14:00:00Z" },
    { id: "sa-001-3", author_name: "민지", content: "오늘 새벽이요. 이유는 모르겠어요.", created_at: "2026-05-22T03:00:00Z" },
  ],
  "a1000001-0000-0000-0000-000000000002": [
    { id: "sa-002-1", author_name: "서연", content: "연결되고 싶은데 연결되는 방법을 모르기 때문이 아닐까요.", created_at: "2026-05-18T09:00:00Z" },
    { id: "sa-002-2", author_name: "민재", content: "존재 자체가 분리되어 있어서인 것 같아요. 아무리 가까워져도 끝내 혼자인 부분이 있는 것 같고.", created_at: "2026-05-19T16:00:00Z" },
    { id: "sa-002-3", author_name: "지훈", content: "외로움은 인간이 가진 가장 솔직한 감정 중 하나라고 생각해요.", created_at: "2026-05-20T11:00:00Z" },
  ],
  "a1000001-0000-0000-0000-000000000015": [
    { id: "sa-015-1", author_name: "은지", content: "3년 전 멀어진 친구요. 그냥 한 번쯤 안부를 물어봐 줬으면 했어요.", created_at: "2026-05-25T08:00:00Z" },
    { id: "sa-015-2", author_name: "하린", content: "특정인보다는, 그냥 내 말을 끝까지 들어줄 누군가요.", created_at: "2026-05-26T13:00:00Z" },
  ],
  "a1000001-0000-0000-0000-000000000016": [
    { id: "sa-016-1", author_name: "진호", content: "카뮈의 이방인. 이해가 안 됐던 게 아니라, 너무 이해가 됐던 것 같아서.", created_at: "2026-05-22T21:00:00Z" },
    { id: "sa-016-2", author_name: "재희", content: "어느 날 갑자기 책 속 주인공이 나 같아 보여서 읽기 무서워진 책이 있어요.", created_at: "2026-05-23T10:00:00Z" },
  ],
  "a1000001-0000-0000-0000-000000000022": [
    { id: "sa-022-1", author_name: "재원", content: "틀렸을 때 빠르게 인정하는 것이 오히려 신뢰를 만든다는 것.", created_at: "2026-05-27T09:00:00Z" },
    { id: "sa-022-2", author_name: "지우", content: "완벽하게 준비된 적 없이 시작한 일이 오히려 더 잘 됐어요.", created_at: "2026-05-28T14:00:00Z" },
    { id: "sa-022-3", author_name: "도현", content: "실수가 부끄럽지 않아진 순간부터 더 많은 시도를 하게 됐어요.", created_at: "2026-05-29T11:00:00Z" },
  ],
  "a1000001-0000-0000-0000-000000000025": [
    { id: "sa-025-1", author_name: "서진", content: "\"당신이 읽은 것이 당신을 만든다.\" 어떤 책에서 읽었는지 기억도 안 나는데 아직도 생각나요.", created_at: "2026-05-24T18:00:00Z" },
    { id: "sa-025-2", author_name: "하은", content: "\"두려움은 흥미가 깊어진 것이다.\" 처음 읽었을 때 숨이 멎었어요.", created_at: "2026-05-25T20:00:00Z" },
    { id: "sa-025-3", author_name: "채현", content: "\"모든 별은 제 속도로 진다.\" 그 문장 옆에 아무 말도 적지 못했어요.", created_at: "2026-05-26T09:00:00Z" },
  ],
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
          <LandingQuestionView question={{ id, content: sq.content, author_name: sq.author_name, answers_count: sq.answers_count }} answers={STATIC_SAMPLE_ANSWERS[id] ?? []} />
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
