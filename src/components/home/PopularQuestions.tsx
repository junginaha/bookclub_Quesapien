import Link from "next/link";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import type { Question } from "@/types";
import { getCategoryColor } from "@/lib/utils";

interface PopularQuestionsProps {
  questions: Question[];
}

export default function PopularQuestions({ questions }: PopularQuestionsProps) {
  return (
    <section className="bg-white">
      <div className="container-base py-16 sm:py-20">
        <div className="flex items-start justify-between gap-3 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <p className="text-xs font-semibold text-warm-400 uppercase tracking-widest">
                인기 발제
              </p>
              <span className="text-[11px] text-warm-300 border border-warm-100 rounded-full px-2.5 py-0.5">
                지적 수다 가능 구역
              </span>
            </div>
            <h2 className="section-title">가장 많이 탐구된 질문들</h2>
            <p className="section-subtitle">사람들이 가장 깊이 생각하는 질문들이에요.</p>
            <p className="text-[11px] text-warm-300 italic mt-1">
              질문이 많은 사람은 이상한 게 아닙니다
            </p>
          </div>
          <span className="hidden sm:block text-[11px] text-warm-300 italic mt-1.5">
            생각 과다 사용자 환영
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {questions.map((question, index) => (
            <PopularQuestionRow key={question.id} question={question} rank={index + 1} />
          ))}
        </div>

        <p className="text-center text-[11px] text-warm-300 italic mt-8">
          깊은 대화에 목마른 사람들 &nbsp;·&nbsp; 알고리즘 말고 사람 만나기
        </p>
      </div>
    </section>
  );
}

function PopularQuestionRow({
  question,
  rank,
}: {
  question: Question;
  rank: number;
}) {
  return (
    <Link
      href={`/questions/${question.id}`}
      className="group flex items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl border border-warm-100 bg-white hover:bg-warm-50 hover:border-warm-200 transition-all duration-200"
    >
      <span className="font-serif text-3xl font-bold text-warm-100 w-8 shrink-0 text-center select-none">
        {String(rank).padStart(2, "0")}
      </span>

      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`tag-base ${getCategoryColor(question.category)}`}>
            {question.category}
          </span>
        </div>
        <h3 className="font-serif text-base sm:text-lg font-semibold text-warm-900 truncate group-hover:text-warm-700">
          &ldquo;{question.title}&rdquo;
        </h3>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-1 text-xs text-warm-400">
          <TrendingUp className="h-3 w-3" />
          <span className="font-medium text-warm-600">
            {question.participant_total}명
          </span>
        </div>
        <span className="text-[10px] text-warm-300">
          {question.session_count}회 진행
        </span>
      </div>

      <ArrowUpRight className="h-4 w-4 text-warm-300 shrink-0 transition-all duration-200 group-hover:text-warm-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}
