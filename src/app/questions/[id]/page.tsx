import { notFound } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import QuestionDetailClient from "./QuestionDetailClient";
import { mockQuestions } from "@/data/mockData";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QuestionDetailPage({ params }: Props) {
  const { id } = await params;

  // 기본 질문 데이터 (모든 질문은 스토어에도 있음)
  const mockQ = mockQuestions.find((q) => q.id === id);
  // 스토어에만 있는 동적 질문도 클라이언트에서 처리

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <QuestionDetailClient questionId={id} seedQuestion={mockQ ?? null} />
      </main>
      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
  return mockQuestions.map((q) => ({ id: q.id }));
}
