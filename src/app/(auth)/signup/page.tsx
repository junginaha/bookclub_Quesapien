import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "회원가입",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex flex-col items-center gap-3 group mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warm-900 shadow-card transition-transform group-hover:scale-105">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col items-center">
              <span className="font-serif text-lg font-bold text-warm-900">질문하는 사람들</span>
              <span className="text-xs text-warm-400">미래혁신형 북클럽</span>
            </div>
          </Link>

          <h1 className="font-serif text-2xl font-bold text-warm-900 text-center">
            질문하는 사람이 되어요
          </h1>
          <p className="text-warm-400 text-sm mt-1.5 text-center">
            책으로 시작되는 연결, 지금 시작하세요.
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-warm-100 shadow-card-lg p-8">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
