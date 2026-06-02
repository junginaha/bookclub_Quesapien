"use client";

import { useState, useMemo } from "react";
import { Trash2, Replace, AlertTriangle, RotateCcw, Download, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataStore, selectActiveData } from "@/store/dataStore";
import { computeAllColumnStats } from "@/lib/analysis";
import {
  applyMissingStrategy,
  detectOutliers,
  applyOutlierAction,
  type OutlierResult,
} from "@/lib/cleaning";
import type { MissingStrategy, OutlierMethod, OutlierAction, ParsedData } from "@/types/data-analysis";

const MISSING_OPTIONS: { value: MissingStrategy; label: string }[] = [
  { value: "drop", label: "행 삭제" },
  { value: "mean", label: "평균값 대체" },
  { value: "median", label: "중앙값 대체" },
  { value: "mode", label: "최빈값 대체" },
  { value: "constant", label: "고정값 입력" },
];

const OUTLIER_METHODS: { value: OutlierMethod; label: string }[] = [
  { value: "iqr", label: "IQR" },
  { value: "zscore", label: "Z-score" },
];

const OUTLIER_ACTIONS: { value: OutlierAction; label: string; desc: string }[] = [
  { value: "remove", label: "행 제거", desc: "이상치 행을 데이터에서 삭제" },
  { value: "clip", label: "경계값 클리핑", desc: "상·하한으로 대체" },
  { value: "flag", label: "플래그 표시", desc: "_outlier 컬럼 추가" },
];

function downloadCSV(data: ParsedData) {
  const header = data.columns.join(",");
  const rows = data.rows.map((r) =>
    data.columns.map((c) => {
      const v = r[c];
      if (v === null || v === undefined) return "";
      const s = String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    }).join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cleaned_${data.fileName.replace(/\.(xlsx?|csv)$/i, "")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function CleaningPanel() {
  const { data, cleanedData, cleaningLogs, setCleanedData, resetCleanedData } = useDataStore();
  const activeData = useDataStore(selectActiveData);

  const colStats = useMemo(
    () => (activeData ? computeAllColumnStats(activeData.columns, activeData.rows) : []),
    [activeData]
  );

  const colsWithMissing = colStats.filter((s) => s.missingCount > 0);
  const numericCols = colStats.filter((s) => s.type === "numeric").map((s) => s.name);

  // Missing state
  const [missingCol, setMissingCol] = useState("");
  const [missingStrategy, setMissingStrategy] = useState<MissingStrategy>("drop");
  const [constantVal, setConstantVal] = useState("");

  // Outlier state
  const [outlierCol, setOutlierCol] = useState("");
  const [outlierMethod, setOutlierMethod] = useState<OutlierMethod>("iqr");
  const [outlierThreshold, setOutlierThreshold] = useState(1.5);
  const [outlierAction, setOutlierAction] = useState<OutlierAction>("remove");
  const [outlierPreview, setOutlierPreview] = useState<OutlierResult | null>(null);

  if (!activeData) return null;

  function applyMissing() {
    if (!missingCol || !activeData) return;
    const { rows, affected } = applyMissingStrategy(
      activeData.rows,
      missingCol,
      missingStrategy,
      constantVal
    );
    const newData: ParsedData = { ...activeData, rows };
    setCleanedData(newData, {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      description: `[결측치] "${missingCol}" — ${MISSING_OPTIONS.find((o) => o.value === missingStrategy)?.label}`,
      rowsAffected: affected,
    });
  }

  function previewOutlier() {
    if (!outlierCol || !activeData) return;
    const result = detectOutliers(activeData.rows, outlierCol, outlierMethod, outlierThreshold);
    setOutlierPreview(result);
  }

  function applyOutlier() {
    if (!outlierCol || !activeData || !outlierPreview) return;
    const { rows, affected } = applyOutlierAction(
      activeData.rows,
      outlierCol,
      outlierPreview,
      outlierAction
    );
    const newData: ParsedData = { ...activeData, rows };
    setCleanedData(newData, {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      description: `[이상치] "${outlierCol}" — ${outlierMethod.toUpperCase()} ${outlierThreshold}, ${OUTLIER_ACTIONS.find((a) => a.value === outlierAction)?.label}`,
      rowsAffected: affected,
    });
    setOutlierPreview(null);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">데이터 클리닝</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            현재 {activeData.rows.length.toLocaleString()}행 기준
            {cleanedData && <span className="ml-2 text-blue-600 font-medium">(정제 데이터 적용 중)</span>}
          </p>
        </div>
        {cleanedData && (
          <div className="flex gap-2">
            <button
              onClick={() => downloadCSV(cleanedData)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> CSV 다운로드
            </button>
            <button
              onClick={resetCleanedData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 원본 복원
            </button>
          </div>
        )}
      </div>

      {/* 결측치 처리 */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Replace className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-gray-700">결측치 처리</h3>
          <span className="text-xs text-gray-400">({colsWithMissing.length}개 컬럼 결측)</span>
        </div>

        {colsWithMissing.length === 0 ? (
          <p className="text-sm text-green-600 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> 결측치가 없습니다.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">컬럼 선택</label>
                <select
                  value={missingCol}
                  onChange={(e) => setMissingCol(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— 컬럼 선택 —</option>
                  {colsWithMissing.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.missingCount.toLocaleString()}개, {(c.missingRatio * 100).toFixed(1)}%)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">처리 방법</label>
                <select
                  value={missingStrategy}
                  onChange={(e) => setMissingStrategy(e.target.value as MissingStrategy)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MISSING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {missingStrategy === "constant" && (
              <input
                type="text"
                placeholder="대체할 고정값 입력"
                value={constantVal}
                onChange={(e) => setConstantVal(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <button
              onClick={applyMissing}
              disabled={!missingCol}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              적용
            </button>
          </div>
        )}
      </section>

      {/* 이상치 처리 */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h3 className="font-semibold text-gray-700">이상치 탐지 및 처리</h3>
          <span className="text-xs text-gray-400">(연속형 컬럼만 해당)</span>
        </div>

        {numericCols.length === 0 ? (
          <p className="text-sm text-gray-400">연속형 컬럼이 없습니다.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">컬럼</label>
                <select
                  value={outlierCol}
                  onChange={(e) => { setOutlierCol(e.target.value); setOutlierPreview(null); }}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— 선택 —</option>
                  {numericCols.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">탐지 방법</label>
                <select
                  value={outlierMethod}
                  onChange={(e) => { setOutlierMethod(e.target.value as OutlierMethod); setOutlierPreview(null); }}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {OUTLIER_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  임계값 {outlierMethod === "iqr" ? "(IQR 배수)" : "(σ 배수)"}: <strong>{outlierThreshold}</strong>
                </label>
                <input
                  type="range"
                  min={outlierMethod === "iqr" ? 1 : 1.5}
                  max={outlierMethod === "iqr" ? 3 : 4}
                  step={0.1}
                  value={outlierThreshold}
                  onChange={(e) => { setOutlierThreshold(Number(e.target.value)); setOutlierPreview(null); }}
                  className="w-full mt-2"
                />
              </div>
            </div>

            {outlierPreview && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                <strong>{outlierPreview.indices.size.toLocaleString()}개</strong> 이상치 탐지 (
                하한 {outlierPreview.bounds.lower.toFixed(2)} / 상한 {outlierPreview.bounds.upper.toFixed(2)})
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {OUTLIER_ACTIONS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setOutlierAction(a.value)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-lg border transition-colors",
                    outlierAction === a.value
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
                  )}
                  title={a.desc}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={previewOutlier}
                disabled={!outlierCol}
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 transition-colors"
              >
                탐지 미리보기
              </button>
              <button
                onClick={applyOutlier}
                disabled={!outlierCol || !outlierPreview}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                처리 적용
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 처리 내역 로그 */}
      {cleaningLogs.length > 0 && (
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="w-4 h-4 text-gray-400" />
            <h3 className="font-semibold text-gray-700">처리 내역</h3>
          </div>
          <ul className="space-y-2">
            {cleaningLogs.map((log) => (
              <li key={log.id} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span className="text-gray-700">{log.description}</span>
                <span className="text-gray-400 ml-auto shrink-0">
                  {log.rowsAffected.toLocaleString()}행 처리
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
