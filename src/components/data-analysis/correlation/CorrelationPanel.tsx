"use client";

import { useMemo, useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useDataStore, selectActiveData } from "@/store/dataStore";
import { computeAllColumnStats } from "@/lib/analysis";
import { buildCorrelationMatrix, correlationColor, correlationLabel } from "@/lib/correlation";

export function CorrelationPanel() {
  const activeData = useDataStore(selectActiveData);

  const colStats = useMemo(
    () => (activeData ? computeAllColumnStats(activeData.columns, activeData.rows) : []),
    [activeData]
  );

  const numericCols = colStats.filter((s) => s.type === "numeric").map((s) => s.name);

  const [selectedCols, setSelectedCols] = useState<Set<string>>(new Set());
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);
  const [drillPair, setDrillPair] = useState<[string, string] | null>(null);

  // 초기값: 전체 연속형 컬럼
  const activeCols = selectedCols.size > 0 ? numericCols.filter((c) => selectedCols.has(c)) : numericCols;

  const matrix = useMemo(
    () => (activeData && activeCols.length >= 2 ? buildCorrelationMatrix(activeData.rows, activeCols) : null),
    [activeData, activeCols]
  );

  const drillData = useMemo(() => {
    if (!drillPair || !activeData) return null;
    const [a, b] = drillPair;
    return activeData.rows
      .map((r) => ({ x: Number(r[a]), y: Number(r[b]) }))
      .filter((p) => !isNaN(p.x) && !isNaN(p.y))
      .slice(0, 2000);
  }, [drillPair, activeData]);

  if (!activeData) return null;

  if (numericCols.length < 2) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        상관관계 분석을 위해 연속형 컬럼이 2개 이상 필요합니다.
      </div>
    );
  }

  const toggleCol = (col: string) => {
    setSelectedCols((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  };

  const cellSize = Math.max(44, Math.min(80, Math.floor(560 / (activeCols.length || 1))));

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-lg font-bold text-gray-800">상관관계 분석</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Pearson 상관계수 · pairwise deletion (결측치 있는 쌍만 제외)
        </p>
      </div>

      {/* 컬럼 선택 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-500 mb-3">
          분석할 연속형 컬럼 선택 (미선택 시 전체 사용)
        </p>
        <div className="flex flex-wrap gap-2">
          {numericCols.map((col) => (
            <button
              key={col}
              onClick={() => toggleCol(col)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                selectedCols.size === 0 || selectedCols.has(col)
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "bg-gray-50 text-gray-400 border-gray-200"
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>

      {/* 히트맵 */}
      {matrix && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 mb-4">셀을 클릭하면 산점도를 볼 수 있습니다</p>
          <div className="overflow-x-auto">
            <table className="border-collapse" style={{ fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ width: cellSize, minWidth: cellSize }} />
                  {matrix.columns.map((col) => (
                    <th
                      key={col}
                      style={{ width: cellSize, minWidth: cellSize, maxWidth: cellSize }}
                      className="pb-2 px-1 font-medium text-gray-600 text-center"
                    >
                      <div
                        className="truncate"
                        title={col}
                        style={{ maxWidth: cellSize - 4, writingMode: "vertical-rl", textOrientation: "mixed", height: 80 }}
                      >
                        {col}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.columns.map((rowCol, ri) => (
                  <tr key={rowCol}>
                    <td
                      className="pr-2 font-medium text-gray-600 text-right whitespace-nowrap"
                      style={{ maxWidth: 120 }}
                      title={rowCol}
                    >
                      <span className="block truncate" style={{ maxWidth: 120 }}>{rowCol}</span>
                    </td>
                    {matrix.columns.map((colCol, ci) => {
                      const r = matrix.matrix[ri][ci];
                      const isHovered = hoveredCell?.r === ri && hoveredCell?.c === ci;
                      const isDiag = ri === ci;
                      return (
                        <td
                          key={colCol}
                          style={{
                            width: cellSize,
                            height: cellSize,
                            backgroundColor: correlationColor(r),
                            cursor: isDiag ? "default" : "pointer",
                            border: isHovered ? "2px solid #1d4ed8" : "1px solid #e5e7eb",
                            transition: "border-color 0.1s",
                          }}
                          className="text-center align-middle select-none"
                          onMouseEnter={() => setHoveredCell({ r: ri, c: ci })}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => {
                            if (!isDiag) setDrillPair([rowCol, colCol]);
                          }}
                          title={`${rowCol} × ${colCol}: ${correlationLabel(r)}`}
                        >
                          <span
                            style={{
                              color: r !== null && Math.abs(r) > 0.5 ? "#fff" : "#374151",
                              fontWeight: r !== null && Math.abs(r) > 0.7 ? 700 : 400,
                              fontSize: 10,
                            }}
                          >
                            {correlationLabel(r)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 범례 */}
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
            <span>-1</span>
            <div
              className="h-3 rounded flex-1"
              style={{
                background: "linear-gradient(to right, rgb(60,60,220), #e5e7eb, rgb(220,60,60))",
                maxWidth: 200,
              }}
            />
            <span>+1</span>
            <span className="ml-4">강한 음의 상관 → 없음 → 강한 양의 상관</span>
          </div>
        </div>
      )}

      {/* 산점도 드릴다운 */}
      {drillPair && drillData && (
        <div className="bg-white rounded-xl border border-blue-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-800">
                {drillPair[0]} × {drillPair[1]}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {drillData.length.toLocaleString()}개 포인트 (최대 2,000)
              </p>
            </div>
            <button
              onClick={() => setDrillPair(null)}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
            >
              닫기
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="x" name={drillPair[0]} tick={{ fontSize: 11 }} />
              <YAxis dataKey="y" name={drillPair[1]} tick={{ fontSize: 11 }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={drillData} fill="#3b82f6" opacity={0.5} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
