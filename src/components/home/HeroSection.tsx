import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-warm-100/60 blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-warm-200/30 blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container-base relative py-20 sm:py-28 lg:py-36">
        <p className="text-center text-[11px] text-warm-300 mb-6 italic tracking-wide">
          대충 스크롤하다 들어온 당신, 잠깐만요.
        </p>

        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-warm-200 bg-warm-50 px-3 py-1 text-xs font-medium text-warm-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              서초구 선정 프로젝트
            </span>
            <span className="inline-flex items-center rounded-full border border-warm-200 bg-warm-50 px-3 py-1 text-xs font-medium text-warm-600">
              미래혁신형 북클럽
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-warm-900 leading-[1.15] tracking-tight mb-6 text-balance">
            질문하는
            <br />
            <span className="relative">
              사람들
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 6C40 2 80 2 100 2C120 2 160 2 198 6"
                  stroke="#C5BEB0"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="font-serif text-xl sm:text-2xl text-warm-500 font-normal leading-relaxed mb-3 text-balance">
            책으로 시작된 질문은 사람을 연결합니다.
          </p>
          <p className="text-sm text-warm-400 leading-relaxed max-w-md text-balance">
            질문 중심 북클럽에서 나의 생각과 감정을 꺼내고,
            <br className="hidden sm:block" />
            새로운 사람들과 깊은 연결을 경험하세요.
          </p>

          <div className="flex items-center gap-2 mt-5 flex-wrap justify-center">
            <span className="text-[11px] text-warm-300 border border-warm-100 rounded-full px-2.5 py-1">
              생각 많은 사람 환영
            </span>
            <span className="text-[11px] text-warm-300 border border-warm-100 rounded-full px-2.5 py-1">
              말이 통하는 사람들
            </span>
            <span className="text-[11px] text-warm-300 border border-warm-100 rounded-full px-2.5 py-1">
              낯가림 허용
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
            <Link href="/questions/create">
              <Button size="xl" className="gap-2 w-full sm:w-auto shadow-sm">
                지금 모임 참여하기
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/questions/create">
              <Button size="xl" variant="outline" className="gap-2 w-full sm:w-auto">
                <Sparkles className="h-4 w-4" />
                AI 발제 생성하기
              </Button>
            </Link>
          </div>

          <p className="text-[11px] text-warm-300 mt-3 italic">
            혼자 와도 괜찮아요 :) &nbsp;·&nbsp; 처음 오는 사람 많아요
          </p>

          <div className="flex items-center gap-8 mt-12 pt-8 border-t border-warm-100 w-full justify-center">
            {[
              { value: "1,200+", label: "누적 참여자" },
              { value: "340+", label: "진행된 모임" },
              { value: "87+", label: "등록된 질문" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="font-serif text-2xl font-bold text-warm-900">
                  {stat.value}
                </span>
                <span className="text-xs text-warm-400 mt-0.5">{stat.label}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-warm-300 mt-3 italic">
            오늘도 누군가는 친구가 됩니다
          </p>
        </div>
      </div>
    </section>
  );
}
