"use client";

import { useState } from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import QuestionForm from "@/components/questions/QuestionForm";
import AIGeneratePanel from "@/components/questions/AIGeneratePanel";
import { Sparkles, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "manual" | "ai";

export default function CreateQuestionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("manual");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container-base py-12 sm:py-16 max-w-2xl">
          <div className="mb-8">
            <p className="text-xs font-semibold text-warm-400 uppercase tracking-widest mb-2">
              발제 만들기
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-warm-900">
              새로운 질문으로
              <br />
              모임을 시작하세요.
            </h1>
            <p className="text-warm-500 text-sm mt-3 leading-relaxed">
              당신의 질문이 새로운 연결의 시작이 됩니다.
              AI 발제 생성기로 더 쉽게 시작할 수도 있어요.
            </p>
          </div>

          <div className="flex rounded-2xl border border-warm-100 bg-warm-50 p-1 mb-8">
            <button
              onClick={() => setActiveTab("manual")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                activeTab === "manual"
                  ? "bg-white shadow-card-sm text-warm-900"
                  : "text-warm-500 hover:text-warm-700"
              )}
            >
              <PenLine className="h-4 w-4" />
              직접 작성
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                activeTab === "ai"
                  ? "bg-white shadow-card-sm text-warm-900"
                  : "text-warm-500 hover:text-warm-700"
              )}
            >
              <Sparkles className="h-4 w-4" />
              AI 자동 생성
            </button>
          </div>

          <div className="animate-fade-in">
            {activeTab === "manual" ? <QuestionForm /> : <AIGeneratePanel />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
