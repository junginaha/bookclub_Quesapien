"use client";

import { useCallback, useState } from "react";
import { UploadCloud, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseFile } from "@/lib/parsers";
import { useDataStore } from "@/store/dataStore";

export function FileUploader() {
  const setData = useDataStore((s) => s.setData);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setLoading(true);
      try {
        const parsed = await parseFile(file);
        setData(parsed);
      } catch (e) {
        setError(e instanceof Error ? e.message : "파싱 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [setData]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">데이터 파일 업로드</h1>
        <p className="mt-1 text-sm text-gray-500">CSV 또는 XLSX(Excel) 파일을 업로드하세요</p>
      </div>

      <label
        htmlFor="file-input"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center w-full max-w-lg h-60 rounded-2xl border-2 border-dashed cursor-pointer transition-colors",
          dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50",
          loading && "pointer-events-none opacity-60"
        )}
      >
        {loading ? (
          <>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-sm text-gray-500">파일을 분석하는 중...</p>
          </>
        ) : (
          <>
            <UploadCloud className={cn("w-10 h-10 mb-3", dragging ? "text-blue-500" : "text-gray-400")} />
            <p className="text-sm font-medium text-gray-700">파일을 여기에 드래그하거나</p>
            <p className="mt-1 text-sm text-gray-500">클릭해서 파일을 선택하세요</p>
            <div className="flex items-center gap-2 mt-4">
              {[".csv", ".xlsx", ".xls"].map((ext) => (
                <span key={ext} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                  {ext}
                </span>
              ))}
            </div>
          </>
        )}
        <input
          id="file-input"
          type="file"
          accept=".csv,.xlsx,.xls"
          className="sr-only"
          onChange={onInputChange}
        />
      </label>

      {error && (
        <div className="flex items-start gap-2 w-full max-w-lg px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <FileText className="w-3.5 h-3.5" />
        <span>첫 번째 행을 헤더(열 이름)로 인식합니다</span>
      </div>
    </div>
  );
}
