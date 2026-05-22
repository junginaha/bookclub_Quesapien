import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-warm-100 bg-warm-50">
      <div className="container-base py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warm-900">
                <BookOpen className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-serif font-bold text-warm-900 text-sm">
                질문하는 사람들
              </span>
            </Link>
            <p className="text-xs text-warm-400 leading-relaxed max-w-[280px]">
              책으로 시작된 질문은 사람을 연결합니다.
              <br />
              서초구 선정 미래혁신형 북클럽 프로젝트
            </p>
            <p className="text-[11px] text-warm-300 italic">
              사람 냄새 나는 플랫폼 실험중
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 sm:gap-16">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-warm-700 uppercase tracking-widest mb-1">
                둘러보기
              </p>
              <Link href="/" className="text-xs text-warm-500 hover:text-warm-800 transition-colors">
                홈
              </Link>
              <Link href="/archive" className="text-xs text-warm-500 hover:text-warm-800 transition-colors">
                후기 아카이브
              </Link>
              <Link href="/questions/create" className="text-xs text-warm-500 hover:text-warm-800 transition-colors">
                발제 만들기
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-warm-700 uppercase tracking-widest mb-1">
                계정
              </p>
              <Link href="/login" className="text-xs text-warm-500 hover:text-warm-800 transition-colors">
                로그인
              </Link>
              <Link href="/signup" className="text-xs text-warm-500 hover:text-warm-800 transition-colors">
                회원가입
              </Link>
              <Link href="/mypage" className="text-xs text-warm-500 hover:text-warm-800 transition-colors">
                마이페이지
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-warm-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-warm-400">
            © 2026 질문하는 사람들. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-xs text-warm-300">
            <span className="italic">당신 같은 사람 찾고 있었어요</span>
            <span className="px-2 py-0.5 rounded-md bg-warm-100 text-warm-500 font-medium">
              서초구 선정 프로젝트
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
