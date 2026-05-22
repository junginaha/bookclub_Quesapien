"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, BookOpen, MessageSquare, Zap } from "lucide-react";
import type { AIGenerateResponse } from "@/types";

export default function AIGeneratePanel() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIGenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });

      if (!res.ok) throw new Error("AI 생성에 실패했습니다.");
      const data = await res.json() as AIGenerateResponse;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-warm-100 bg-gradient-to-br from-warm-50 to-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-warm-900">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-warm-900">AI 발제 생성기</h3>
            <p className="text-xs text-warm-400">키워드를 입력하면 발제문을 자동으로 생성합니다</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="flex gap-2">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="예) 외로움, 용서, 성공, 관계..."
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !keyword.trim()} className="shrink-0 gap-1.5">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? "생성 중" : "생성"}
          </Button>
        </form>

        <div className="flex flex-wrap gap-2 mt-3">
          {["외로움", "사랑", "실패", "인정", "자유"].map((kw) => (
            <button
              key={kw}
              type="button"
              onClick={() => setKeyword(kw)}
              className="tag-base bg-white border border-warm-200 text-warm-600 hover:bg-warm-50 hover:border-warm-300 transition-colors"
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-4 animate-slide-up">
          <div className="rounded-2xl border border-warm-100 bg-white p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-warm-600" />
              <h4 className="text-sm font-semibold text-warm-800">발제문</h4>
            </div>
            <p className="font-serif text-lg font-medium text-warm-900 leading-relaxed">
              {result.statement}
            </p>
          </div>

          <div className="rounded-2xl border border-warm-100 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-warm-600" />
              <h4 className="text-sm font-semibold text-warm-800">토론 질문</h4>
            </div>
            <div className="flex flex-col gap-3">
              {result.discussion_questions.map((q, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="font-serif text-xl font-bold text-warm-200 shrink-0 leading-none mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm text-warm-700 leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </div>

          {result.recommended_books.length > 0 && (
            <div className="rounded-2xl border border-warm-100 bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-4 w-4 text-warm-600" />
                <h4 className="text-sm font-semibold text-warm-800">추천 도서</h4>
              </div>
              <div className="flex flex-col gap-3">
                {result.recommended_books.map((book) => (
                  <div key={book.id} className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold text-warm-900">
                      {book.title}
                    </p>
                    <p className="text-xs text-warm-500">{book.author}</p>
                    {book.description && (
                      <p className="text-xs text-warm-400 leading-relaxed mt-1">
                        {book.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.icebreaker_questions.length > 0 && (
            <div className="rounded-2xl border border-warm-100 bg-warm-50 p-6">
              <h4 className="text-sm font-semibold text-warm-800 mb-3">
                아이스브레이킹 질문
              </h4>
              <div className="flex flex-col gap-2">
                {result.icebreaker_questions.map((q, i) => (
                  <p key={i} className="text-sm text-warm-600 leading-relaxed flex gap-2">
                    <span className="text-warm-300">·</span>
                    {q}
                  </p>
                ))}
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              const titleInput = document.getElementById("title") as HTMLInputElement;
              if (titleInput) titleInput.value = result.statement;
            }}
          >
            이 발제문으로 모임 만들기
          </Button>
        </div>
      )}
    </div>
  );
}
