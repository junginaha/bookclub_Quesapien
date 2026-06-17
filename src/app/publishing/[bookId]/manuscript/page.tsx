"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Upload, FileText, CheckCircle2, AlertCircle, ChevronRight,
  BookOpen, Loader2, X, RefreshCw,
} from "lucide-react";
import { manuscriptApi } from "@/lib/publishing/api";
import type { PublishingChapter } from "@/lib/publishing/types";

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

const ACCEPTED_TYPES = [".docx", ".txt", ".md"];

export default function ManuscriptPage() {
  const params = useParams();
  const bookId = params.bookId as string;

  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ chapter_count: number; file_name: string } | null>(null);
  const [chapters, setChapters] = useState<PublishingChapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadChapters();
  }, [bookId]);

  async function loadChapters() {
    setLoadingChapters(true);
    try {
      const chs = await manuscriptApi.getChapters(bookId);
      setChapters(chs);
    } catch {
      // no chapters yet
    } finally {
      setLoadingChapters(false);
    }
  }

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setState("idle");
      const file = e.dataTransfer.files[0];
      if (file) await uploadFile(file);
    },
    [bookId]
  );

  async function uploadFile(file: File) {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setError(`지원하지 않는 형식: ${ext}. 허용 형식: ${ACCEPTED_TYPES.join(", ")}`);
      setState("error");
      return;
    }

    setState("uploading");
    setError(null);
    try {
      const res = await manuscriptApi.upload(bookId, file);
      setResult({ chapter_count: res.chapter_count, file_name: file.name });
      setState("success");
      await loadChapters();
    } catch (err: any) {
      setError(err.message);
      setState("error");
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">원고 업로드</h1>
        <p className="text-sm text-gray-500 mt-1">
          DOCX, TXT, Markdown 파일을 업로드하면 AI가 자동으로 구조를 분석합니다
        </p>
      </div>

      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-10 text-center mb-6 transition-all ${
          state === "dragging"
            ? "border-indigo-400 bg-indigo-50"
            : "border-gray-200 bg-white hover:border-indigo-300"
        }`}
        onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
        onDragLeave={() => setState("idle")}
        onDrop={handleDrop}
      >
        {state === "uploading" ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-sm font-medium text-gray-700">원고 분석 중...</p>
            <p className="text-xs text-gray-400">챕터 구조를 자동으로 파싱하고 있습니다</p>
          </div>
        ) : state === "success" ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
            <p className="text-sm font-semibold text-green-700">업로드 완료!</p>
            <p className="text-xs text-gray-500">
              <span className="font-medium">{result?.file_name}</span> —{" "}
              {result?.chapter_count}개 챕터 파싱됨
            </p>
            <button
              onClick={() => { setState("idle"); setResult(null); }}
              className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              다시 업로드
            </button>
          </div>
        ) : state === "error" ? (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm font-semibold text-red-600">업로드 실패</p>
            <p className="text-xs text-red-500">{error}</p>
            <button
              onClick={() => setState("idle")}
              className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              다시 시도
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Upload className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                파일을 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-xs text-gray-400">
                지원 형식: DOCX, TXT, Markdown (.md)
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              파일 선택
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.txt,.md,.markdown"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* Format guide */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "DOCX", desc: "Word에서 제목 스타일(Heading 1~3)을 사용하면 자동 인식", badge: "추천" },
          { label: "Markdown", desc: "# 헤딩 문법으로 챕터 구조 자동 파싱", badge: null },
          { label: "TXT", desc: "'제1장', '1.1' 등 한국어 번호 패턴 자동 인식", badge: null },
        ].map(({ label, desc, badge }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">{label}</span>
              {badge && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* Parsed chapter tree */}
      {(chapters.length > 0 || loadingChapters) && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">파싱된 목차 구조</h2>
            <span className="text-xs text-gray-400">
              {chapters.length}개 최상위 챕터
            </span>
          </div>
          <div className="p-5 max-h-96 overflow-y-auto">
            {loadingChapters ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                로딩 중...
              </div>
            ) : (
              <ChapterTree chapters={chapters} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ChapterTree({ chapters, depth = 0 }: { chapters: PublishingChapter[]; depth?: number }) {
  return (
    <ul className="space-y-0.5">
      {chapters.map((ch) => (
        <li key={ch.id}>
          <div
            className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {ch.level === 1 ? (
              <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            )}
            <span className={`text-sm ${ch.level === 1 ? "font-semibold text-gray-900" : "text-gray-600"}`}>
              {ch.title}
            </span>
          </div>
          {ch.children && ch.children.length > 0 && (
            <ChapterTree chapters={ch.children} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}
