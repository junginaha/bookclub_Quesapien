import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Question } from "@/types";
import { getCategoryColor } from "@/lib/utils";

interface FeaturedQuestionProps {
  question: Question;
}

export default function FeaturedQuestion({ question }: FeaturedQuestionProps) {
  return (
    <section className="bg-warm-50 border-y border-warm-100">
      <div className="container-base py-16 sm:py-20">
        <p className="text-[11px] text-warm-300 italic mb-5 text-center sm:text-left">
          요즘 사람들은 질문할 곳이 없습니다
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-10">
          <div>
            <p className="text-xs font-semibold text-warm-400 uppercase tracking-widest mb-1">
              오늘의 질문
            </p>
            <h2 className="section-title">이번 주 모두가 묻는 것</h2>
            <p className="text-[11px] text-warm-300 italic mt-1">
              정답보다 질문이 중요하니까
            </p>
          </div>
          <Link
            href="/questions"
            className="text-sm text-warm-500 hover:text-warm-900 transition-colors flex items-center gap-1"
          >
            모든 질문 보기
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <Link href={`/questions/${question.id}`} className="group block">
          <div className="relative overflow-hidden rounded-3xl bg-white border border-warm-100 shadow-card p-8 sm:p-12 transition-all duration-300 group-hover:shadow-card-hover group-hover:-translate-y-1">
            <div className="absolute top-6 right-6 sm:top-10 sm:right-10">
              <ArrowUpRight className="h-5 w-5 text-warm-300 transition-all duration-300 group-hover:text-warm-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className={`tag-base ${getCategoryColor(question.category)}`}>
                {question.category}
              </span>
              <span className="tag-base bg-warm-50 text-warm-500">
                오늘 {question.session_count}개 모임 진행 중
              </span>
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-warm-900 leading-tight mb-5 max-w-2xl">
              &ldquo;{question.title}&rdquo;
            </h3>

            <p className="text-warm-500 text-base leading-relaxed max-w-xl">
              {question.description}
            </p>

            <div className="flex items-center justify-between gap-6 mt-8 pt-8 border-t border-warm-100 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full bg-warm-200 border-2 border-white flex items-center justify-center"
                    >
                      <span className="text-[9px] font-bold text-warm-500">
                        {String.fromCharCode(65 + i)}
                      </span>
                    </div>
                  ))}
                </div>
                <span className="text-sm text-warm-500">
                  {question.participant_total}명이 이 질문으로 모였어요
                </span>
              </div>
              <span className="text-[11px] text-warm-300 italic">
                여기선 말 길어도 됩니다
              </span>
            </div>
          </div>
        </Link>

        <p className="text-center text-[11px] text-warm-300 italic mt-8">
          좋은 질문은 좋은 사람을 부릅니다
        </p>
      </div>
    </section>
  );
}
