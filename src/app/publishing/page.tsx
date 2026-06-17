"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen, Plus, Clock, CheckCircle2, Edit3, Search as SearchIcon,
  BookMarked, ArrowRight, Sparkles, FileText,
} from "lucide-react";
import { booksApi } from "@/lib/publishing/api";
import type { PublishingBook, BookStatus } from "@/lib/publishing/types";

const STATUS_CONFIG: Record<BookStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  "집필중": { label: "집필중", color: "bg-blue-100 text-blue-700", icon: Edit3 },
  "편집중": { label: "편집중", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  "검수중": { label: "검수중", color: "bg-orange-100 text-orange-700", icon: SearchIcon },
  "출판완료": { label: "출판완료", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
};

export default function PublishingDashboard() {
  const [books, setBooks] = useState<PublishingBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    booksApi.list()
      .then(setBooks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: books.length,
    drafting: books.filter((b) => b.status === "집필중").length,
    editing: books.filter((b) => b.status === "편집중").length,
    published: books.filter((b) => b.status === "출판완료").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">19호실 출판OS</h1>
              <p className="text-xs text-gray-500">AI 기반 1인 출판 자동화 플랫폼</p>
            </div>
          </div>
          <Link
            href="/publishing/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 책 만들기
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "전체 책", value: stats.total, icon: BookOpen, color: "text-indigo-600 bg-indigo-50" },
            { label: "집필중", value: stats.drafting, icon: Edit3, color: "text-blue-600 bg-blue-50" },
            { label: "편집중", value: stats.editing, icon: Clock, color: "text-yellow-600 bg-yellow-50" },
            { label: "출판완료", value: stats.published, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-6" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">오류 발생</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
        ) : books.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">내 책 목록</h2>
              <p className="text-sm text-gray-500">총 {books.length}권</p>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function BookCard({ book }: { book: PublishingBook }) {
  const cfg = STATUS_CONFIG[book.status];
  const StatusIcon = cfg.icon;
  const updatedAt = new Date(book.updated_at).toLocaleDateString("ko-KR", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <Link href={`/publishing/${book.id}`} className="group">
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all">
        {/* Cover placeholder / thumbnail */}
        <div className="w-full h-32 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-gray-100 flex items-center justify-center mb-4 overflow-hidden">
          {book.cover_url ? (
            <img src={book.cover_url} alt="표지" className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="w-10 h-10 text-indigo-200" />
          )}
        </div>

        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-700 transition-colors">
            {book.title}
          </h3>
          <span className={`shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
            <StatusIcon className="w-3 h-3" />
            {cfg.label}
          </span>
        </div>

        {book.subtitle && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-1">{book.subtitle}</p>
        )}

        <p className="text-xs text-gray-400">
          {book.author} · {book.page_size}
        </p>
        <p className="text-xs text-gray-400 mt-1">수정: {updatedAt}</p>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex gap-2">
            {book.isbn && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">ISBN</span>
            )}
          </div>
          <span className="text-xs text-indigo-600 group-hover:gap-1.5 flex items-center gap-1 transition-all">
            편집하기 <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-6">
        <BookMarked className="w-10 h-10 text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">아직 책이 없습니다</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        첫 번째 책을 만들어보세요. 원고를 업로드하면<br />
        AI가 자동으로 조판하고 PDF와 ePub을 생성합니다.
      </p>
      <div className="flex items-center justify-center gap-4 mb-10">
        {[
          { icon: Upload, label: "원고 업로드" },
          { icon: Sparkles, label: "AI 자동 조판" },
          { icon: FileText, label: "PDF·ePub 생성" },
        ].map(({ icon: Icon, label }, i) => (
          <div key={label} className="flex items-center gap-2 text-sm text-gray-400">
            {i > 0 && <ArrowRight className="w-4 h-4" />}
            <Icon className="w-4 h-4" />
            {label}
          </div>
        ))}
      </div>
      <Link
        href="/publishing/new"
        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        새 책 만들기
      </Link>
    </div>
  );
}

function Upload({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}
