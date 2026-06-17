"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Download, FileText, BookOpen, Loader2, CheckCircle2,
  AlertCircle, Clock, RefreshCw, Zap,
} from "lucide-react";
import { exportApi } from "@/lib/publishing/api";
import type { PublishingExport } from "@/lib/publishing/types";

export default function ExportPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const [exports, setExports] = useState<PublishingExport[]>([]);
  const [generating, setGenerating] = useState<"pdf" | "epub" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExports();
  }, [bookId]);

  async function loadExports() {
    try {
      const list = await exportApi.listExports(bookId);
      setExports(list);
    } catch {
      // no exports yet
    } finally {
      setLoading(false);
    }
  }

  async function generate(type: "pdf" | "epub") {
    setGenerating(type);
    try {
      const exp =
        type === "pdf"
          ? await exportApi.generatePdf(bookId)
          : await exportApi.generateEpub(bookId);
      setExports((p) => [exp, ...p]);

      // Poll for completion
      pollExport(exp.id);
    } catch (err: any) {
      alert(`생성 실패: ${err.message}`);
    } finally {
      setGenerating(null);
    }
  }

  function pollExport(exportId: string) {
    const interval = setInterval(async () => {
      try {
        const list = await exportApi.listExports(bookId);
        setExports(list);
        const exp = list.find((e) => e.id === exportId);
        if (exp && (exp.status === "completed" || exp.status === "failed")) {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 3000);
  }

  const pdfExports = exports.filter((e) => e.export_type === "pdf");
  const epubExports = exports.filter((e) => e.export_type === "epub");

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">PDF · ePub 생성</h1>
        <p className="text-sm text-gray-500 mt-1">
          출판 가능한 품질의 파일을 자동 생성합니다
        </p>
      </div>

      {/* Generate buttons */}
      <div className="grid grid-cols-2 gap-5 mb-10">
        {/* PDF */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">PDF 생성</p>
              <p className="text-xs text-gray-500">인쇄 및 POD 출판용</p>
            </div>
          </div>
          <ul className="space-y-1.5 mb-5">
            {[
              "판권 페이지 자동 포함",
              "목차 자동 생성",
              "챕터 시작 페이지",
              "이미지 자동 배치",
              "페이지 번호 · 머리말",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => generate("pdf")}
            disabled={!!generating}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {generating === "pdf" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</>
            ) : (
              <><Zap className="w-4 h-4" /> PDF 생성하기</>
            )}
          </button>
        </div>

        {/* ePub */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">ePub 생성</p>
              <p className="text-xs text-gray-500">전자책 플랫폼 업로드용</p>
            </div>
          </div>
          <ul className="space-y-1.5 mb-5">
            {[
              "ePub3 표준 (ePub2 호환)",
              "내비게이션 TOC 포함",
              "메타데이터 자동 설정",
              "이미지 최적화 내포",
              "판권 페이지 포함",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => generate("epub")}
            disabled={!!generating}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {generating === "epub" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</>
            ) : (
              <><Zap className="w-4 h-4" /> ePub 생성하기</>
            )}
          </button>
        </div>
      </div>

      {/* Export history */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" /> 로딩 중...
        </div>
      ) : exports.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">생성 이력</h2>
            <button
              onClick={loadExports}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              새로고침
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {exports.map((exp) => (
              <ExportRow key={exp.id} exp={exp} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <Download className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">아직 생성된 파일이 없습니다</p>
          <p className="text-xs mt-1">위 버튼으로 PDF 또는 ePub을 생성해보세요</p>
        </div>
      )}
    </div>
  );
}

function ExportRow({ exp }: { exp: PublishingExport }) {
  const createdAt = new Date(exp.created_at).toLocaleString("ko-KR", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
        exp.export_type === "pdf" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
      }`}>
        {exp.export_type === "pdf" ? "PDF" : "EPUB"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {exp.export_type === "pdf" ? "PDF 파일" : "ePub 파일"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {createdAt}
          {exp.page_count && ` · ${exp.page_count}페이지`}
          {exp.file_size_kb && ` · ${exp.file_size_kb}KB`}
        </p>
        {exp.error_message && (
          <p className="text-xs text-red-500 mt-0.5">{exp.error_message}</p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <StatusBadge status={exp.status} />
        {exp.status === "completed" && exp.file_url && (
          <a
            href={`/api/publishing/exports/${exp.id}/download`}
            download
            className="flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            다운로드
          </a>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") return (
    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
      <CheckCircle2 className="w-3.5 h-3.5" /> 완료
    </span>
  );
  if (status === "processing") return (
    <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
      <Clock className="w-3.5 h-3.5 animate-pulse" /> 처리중
    </span>
  );
  if (status === "pending") return (
    <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
      <Clock className="w-3.5 h-3.5" /> 대기
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
      <AlertCircle className="w-3.5 h-3.5" /> 실패
    </span>
  );
}
