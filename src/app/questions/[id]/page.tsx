import { notFound } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import QuestionDetailClient from "./QuestionDetailClient";
import { getQuestionById, getSessionsByQuestion, getReviewsByQuestion } from "@/lib/supabase/queries";
import { mockQuestions } from "@/data/mockData";

interface Props {
  params: Promise<{ id: string }>;
}

export const revalidate = 30;

export default async function QuestionDetailPage({ params }: Props) {
  const { id } = await params;

  let question = null;
  let sessions: unknown[] = [];
  let reviews: unknown[] = [];

  try {
    [question, sessions, reviews] = await Promise.all([
      getQuestionById(id),
      getSessionsByQuestion(id),
      getReviewsByQuestion(id),
    ]);
  } catch {
    /* Supabase not configured yet - fallback to mock */
  }

  if (!question) {
    const mockQ = mockQuestions.find((q) => q.id === id);
    if (!mockQ) notFound();
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <QuestionDetailClient questionId={id} seedQuestion={mockQ} initialSessions={[]} initialReviews={[]} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
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
