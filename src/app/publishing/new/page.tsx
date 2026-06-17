"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, BookOpen, Loader2 } from "lucide-react";
import { booksApi } from "@/lib/publishing/api";
import type { PageSize } from "@/lib/publishing/types";

const PAGE_SIZE_OPTIONS: { value: PageSize; label: string; desc: string }[] = [
  { value: "A5", label: "A5", desc: "148 × 210mm — 일반 단행본" },
  { value: "신국판", label: "신국판", desc: "153 × 225mm — 국내 표준 판형" },
  { value: "국판", label: "국판", desc: "148 × 210mm — A5와 동일" },
];

export default function NewBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    author: "",
    publisher: "19호실",
    page_size: "신국판" as PageSize,
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("책 제목을 입력해주세요");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const book = await booksApi.create({
        ...form,
        subtitle: form.subtitle || undefined,
      });
      router.push(`/publishing/${book.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link
            href="/publishing"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            대시보드
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-900">새 책 만들기</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-8 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">새 책 만들기</h1>
          <p className="text-sm text-gray-500">
            기본 정보를 입력하면 바로 프로젝트가 생성됩니다.<br />
            나머지 정보는 언제든지 수정할 수 있습니다.
          </p>
        </div>

        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              책 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={set("title")}
              placeholder="예: AI 시대의 글쓰기"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              부제 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={set("subtitle")}
              placeholder="예: 작가가 알아야 할 필수 가이드"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                저자 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.author}
                onChange={set("author")}
                placeholder="저자 이름"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">출판사</label>
              <input
                type="text"
                value={form.publisher}
                onChange={set("publisher")}
                placeholder="출판사명"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">판형 선택</label>
            <div className="grid grid-cols-3 gap-3">
              {PAGE_SIZE_OPTIONS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, page_size: value }))}
                  className={`border rounded-xl p-4 text-left transition-all ${
                    form.page_size === value
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className={`text-sm font-semibold mb-1 ${
                    form.page_size === value ? "text-indigo-700" : "text-gray-900"
                  }`}>{label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                생성 중...
              </>
            ) : (
              "프로젝트 생성하기"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
