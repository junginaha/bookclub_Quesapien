"use client";

import { FileText, X } from "lucide-react";
import { useDataStore } from "@/store/dataStore";

export function Header() {
  const { data, clearData } = useDataStore();

  return (
    <header className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-200 shrink-0">
      <FileText className="w-4 h-4 text-gray-400 shrink-0" />
      {data ? (
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-medium text-gray-800 truncate">{data.fileName}</span>
          <span className="text-xs text-gray-500 shrink-0">
            {data.rows.length.toLocaleString()}행 · {data.columns.length}열
          </span>
          <button
            onClick={clearData}
            className="shrink-0 p-0.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="파일 닫기"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <span className="text-sm text-gray-400">파일을 업로드하면 요약 정보가 표시됩니다</span>
      )}
    </header>
  );
}
