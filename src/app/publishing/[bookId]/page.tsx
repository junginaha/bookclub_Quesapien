"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Upload, FileText, Settings, Image as ImageIcon,
  Sparkles, Download, CheckCircle2, Clock, ArrowRight,
  BookOpen, Edit3,
} from "lucide-react";
import { booksApi, manuscriptApi, exportApi } from "@/lib/publishing/api";
import type { PublishingBook, PublishingExport, PublishingChapter } from "@/lib/publishing/types";

const STEPS = [
  { href: "/manuscript", label: "원고 업로드", icon: Upload, desc: "DOCX, TXT, Markdown 지원" },
  { href: "/info", label: "출판 정보 입력", icon: FileText, desc: "제목, ISBN, 저자 정보" },
  { href: "/layout-settings", label: "조판 설정", icon: Settings, desc: "여백, 폰트, 페이지 설정" },
  { href: "/cover", label: "표지 등록", icon: ImageIcon, desc: "앞/뒤 표지 이미지" },
  { href: "/ai-tools", label: "AI 편집 도구", icon: Sparkles, desc: "맞춤법, 요약, 홍보문" },
  { href: "/export", label: "PDF·ePub 생성", icon: Download, desc: "출판 가능한 파일 생성" },
];

export default function BookOverview() {
  const params = useParams();
  const bookId = params.bookId as string;
  const [book, setBook] = useState<PublishingBook | null>(null);
  const [chapters, setChapters] = useState<PublishingChapter[]>([]);
  const [exports, setExports] = useState<PublishingExport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [b, chs, exs] = await Promise.all([
          booksApi.get(bookId),
          manuscriptApi.getChapters(bookId).catch(() => []),
          exportApi.listExports(bookId).catch(() => []),
        ]);
        setBook(b);
        setChapters(chs);
        setExports(exs);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookId]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-100 rounded w-40" />
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!book) return null;

  const completedExports = exports.filter((e) => e.status === "completed");
  const totalPages = completedExports[0]?.page_count;
  const flatChapters = flattenChapters(chapters);
  const chapterCount = flatChapters.filter((c) => c.level === 1).length;

  return (
    <div className="p-8 max-w-4xl">
      {/* Book header */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
            {book.subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{book.subtitle}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-gray-500">{book.author}</span>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-500">{book.publisher}</span>
              <span className="text-gray-300">·</span>
              <StatusBadge status={book.status} />
            </div>
          </div>
          <Link
            href={`/publishing/${bookId}/info`}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <Edit3 className="w-4 h-4" />
            정보 편집
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "챕터 수", value: chapterCount || "—", sub: `전체 ${flatChapters.length}개 섹션` },
          { label: "판형", value: book.page_size, sub: "페이지 크기" },
          { label: "총 페이지", value: totalPages || "—", sub: "PDF 기준" },
          { label: "내보내기", value: completedExports.length, sub: "완료된 파일" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Progress steps */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">출판 단계</h2>
        <div className="grid grid-cols-3 gap-3">
          {STEPS.map(({ href, label, icon: Icon, desc }, i) => (
            <Link
              key={href}
              href={`/publishing/${bookId}${href}`}
              className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-xs text-gray-400 font-medium">{i + 1}단계</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                {label}
              </p>
              <p className="text-xs text-gray-500 mt-1">{desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                이동하기 <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent exports */}
      {exports.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">최근 내보내기</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {exports.slice(0, 5).map((exp) => (
              <div key={exp.id} className="flex items-center justify-between px-5 py-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    exp.export_type === "pdf" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {exp.export_type.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {exp.export_type === "pdf" ? "PDF 파일" : "ePub 파일"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(exp.created_at).toLocaleDateString("ko-KR")}
                      {exp.page_count && ` · ${exp.page_count}페이지`}
                      {exp.file_size_kb && ` · ${exp.file_size_kb}KB`}
                    </p>
                  </div>
                </div>
                <ExportStatusBadge status={exp.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    "집필중": "bg-blue-100 text-blue-700",
    "편집중": "bg-yellow-100 text-yellow-700",
    "검수중": "bg-orange-100 text-orange-700",
    "출판완료": "bg-green-100 text-green-700",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function ExportStatusBadge({ status }: { status: string }) {
  if (status === "completed") return (
    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
      <CheckCircle2 className="w-3.5 h-3.5" /> 완료
    </span>
  );
  if (status === "processing") return (
    <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
      <Clock className="w-3.5 h-3.5 animate-spin" /> 처리중
    </span>
  );
  if (status === "failed") return (
    <span className="text-xs text-red-600 font-medium">실패</span>
  );
  return <span className="text-xs text-gray-400">{status}</span>;
}

function flattenChapters(chapters: PublishingChapter[]): PublishingChapter[] {
  const result: PublishingChapter[] = [];
  function walk(chs: PublishingChapter[]) {
    for (const ch of chs) {
      result.push(ch);
      if (ch.children) walk(ch.children);
    }
  }
  walk(chapters);
  return result;
}
