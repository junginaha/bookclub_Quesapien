"use client";

import { useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useDataStore, selectActiveData } from "@/store/dataStore";
import { computeAllColumnStats } from "@/lib/analysis";
import type { ColumnType } from "@/types/data-analysis";

type ChartType = "bar" | "line" | "scatter" | "histogram";

function recommendChart(xType: ColumnType, yType: ColumnType | null): ChartType {
  if (!yType) {
    return xType === "numeric" ? "histogram" : "bar";
  }
  if (xType === "datetime") return "line";
  if (xType === "numeric" && yType === "numeric") return "scatter";
  return "bar";
}

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

// ─── 히스토그램 빈 생성 ─────────────────────────────────────────
function buildHistogram(values: number[], bins = 20): { label: string; count: number }[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return [{ label: String(min), count: values.length }];
  const step = (max - min) / bins;
  const buckets = Array.from({ length: bins }, (_, i) => ({
    label: (min + i * step).toFixed(1),
    count: 0,
  }));
  for (const v of values) {
    const idx = Math.min(Math.floor((v - min) / step), bins - 1);
    buckets[idx].count++;
  }
  return buckets;
}

// ─── 범주형 빈도 집계 ────────────────────────────────────────────
function buildFrequency(
  rows: Record<string, unknown>[],
  col: string,
  limit = 20
): { label: string; count: number }[] {
  const freq = new Map<string, number>();
  for (const row of rows) {
    const v = row[col];
    if (v === null || v === undefined || v === "") continue;
    const key = String(v);
    freq.set(key, (freq.get(key) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

// ─── 시계열 집계 ─────────────────────────────────────────────────
function buildTimeSeries(
  rows: Record<string, unknown>[],
  xCol: string,
  yCol: string
): { label: string; value: number }[] {
  type Acc = Map<string, { sum: number; count: number }>;
  const acc: Acc = new Map();
  for (const row of rows) {
    const x = row[xCol];
    const y = Number(row[yCol]);
    if (x === null || x === undefined || isNaN(y)) continue;
    const key = String(x).slice(0, 10);
    const prev = acc.get(key) ?? { sum: 0, count: 0 };
    acc.set(key, { sum: prev.sum + y, count: prev.count + 1 });
  }
  return [...acc.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, { sum, count }]) => ({ label, value: sum / count }));
}

export function VisualizationPanel() {
  const activeData = useDataStore(selectActiveData);

  const colStats = useMemo(
    () => (activeData ? computeAllColumnStats(activeData.columns, activeData.rows) : []),
    [activeData]
  );

  const [xCol, setXCol] = useState("");
  const [yCol, setYCol] = useState("");
  const [chartType, setChartType] = useState<ChartType>("bar");

  const xStat = colStats.find((s) => s.name === xCol);
  const yStat = colStats.find((s) => s.name === yCol);

  // 자동 추천
  const recommended = xStat ? recommendChart(xStat.type, yStat?.type ?? null) : null;

  const chartData = useMemo(() => {
    if (!activeData || !xCol) return null;

    if (chartType === "histogram" && xStat?.type === "numeric") {
      const vals = activeData.rows
        .map((r) => Number(r[xCol]))
        .filter((v) => !isNaN(v));
      return buildHistogram(vals);
    }
    if (chartType === "bar" && !yCol) {
      return buildFrequency(activeData.rows, xCol);
    }
    if (chartType === "bar" && yCol) {
      const freq = buildFrequency(activeData.rows, xCol, 20);
      return freq.map(({ label }) => {
        const matched = activeData.rows.filter((r) => String(r[xCol]) === label);
        const vals = matched.map((r) => Number(r[yCol])).filter((v) => !isNaN(v));
        const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        return { label, value: avg };
      });
    }
    if (chartType === "line" && yCol) {
      return buildTimeSeries(activeData.rows, xCol, yCol);
    }
    if (chartType === "scatter" && yCol) {
      return activeData.rows
        .map((r) => ({ x: Number(r[xCol]), y: Number(r[yCol]) }))
        .filter((p) => !isNaN(p.x) && !isNaN(p.y))
        .slice(0, 2000);
    }
    return null;
  }, [activeData, xCol, yCol, chartType, xStat]);

  if (!activeData) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-gray-800">시각화</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {activeData.rows.length.toLocaleString()}행 기준으로 차트를 생성합니다
        </p>
      </div>

      {/* 설정 패널 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">X축 / 주요 컬럼</label>
            <select
              value={xCol}
              onChange={(e) => { setXCol(e.target.value); setYCol(""); }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— 컬럼 선택 —</option>
              {colStats.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.type === "numeric" ? "연속형" : s.type === "datetime" ? "날짜형" : "범주형"})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Y축 컬럼 (선택)</label>
            <select
              value={yCol}
              onChange={(e) => setYCol(e.target.value)}
              disabled={!xCol}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">— 없음 (빈도 집계) —</option>
              {colStats
                .filter((s) => s.name !== xCol && s.type === "numeric")
                .map((s) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
            </select>
          </div>
        </div>

        {/* 차트 종류 */}
        {xCol && (
          <div>
            {recommended && (
              <p className="text-xs text-blue-600 mb-2">
                추천 차트: <strong>{recommended}</strong>
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {(["bar", "line", "scatter", "histogram"] as ChartType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    chartType === t
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {t === "bar" ? "막대" : t === "line" ? "꺾은선" : t === "scatter" ? "산점도" : "히스토그램"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 차트 영역 */}
      {chartData && chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-4">
            {xCol}{yCol ? ` × ${yCol}` : ""} — {chartType}
          </p>
          <ResponsiveContainer width="100%" height={360}>
            {chartType === "scatter" ? (
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="x" name={xCol} tick={{ fontSize: 11 }} />
                <YAxis dataKey="y" name={yCol} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter
                  data={chartData as { x: number; y: number }[]}
                  fill="#3b82f6"
                  opacity={0.5}
                />
              </ScatterChart>
            ) : chartType === "line" ? (
              <LineChart data={chartData as { label: string; value: number }[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} strokeWidth={2} />
              </LineChart>
            ) : (
              <BarChart data={chartData as { label: string; count?: number; value?: number }[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey={chartData[0] && "count" in chartData[0] ? "count" : "value"} radius={[4, 4, 0, 0]}>
                  {(chartData as { label: string }[]).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
          {chartType === "scatter" && (
            <p className="text-xs text-gray-400 mt-2 text-center">최대 2,000개 샘플 표시</p>
          )}
        </div>
      )}

      {xCol && chartData?.length === 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
          표시할 데이터가 없습니다.
        </div>
      )}
    </div>
  );
}
