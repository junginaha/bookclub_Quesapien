"use client";

import { useMemo } from "react";
import { useDataStore } from "@/store/dataStore";
import { computeDatasetSummary, computeAllColumnStats } from "@/lib/analysis";
import { SummaryCards } from "./SummaryCards";
import { ColumnInfoTable } from "./ColumnInfoTable";
import { DataPreview } from "./DataPreview";

export function AnalysisDashboard() {
  const data = useDataStore((s) => s.data);

  const summary = useMemo(
    () => data ? computeDatasetSummary(data.columns, data.rows) : null,
    [data]
  );

  const columnStats = useMemo(
    () => data ? computeAllColumnStats(data.columns, data.rows) : [],
    [data]
  );

  if (!data || !summary) return null;

  return (
    <div className="space-y-8 max-w-full">
      {/* 1. 데이터셋 요약 카드 */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-700">데이터셋 요약</h2>
        <SummaryCards summary={summary} />
      </section>

      {/* 2. 컬럼 정보 표 */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-700">컬럼 정보</h2>
        <ColumnInfoTable stats={columnStats} />
      </section>

      {/* 3. 데이터 미리보기 */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-700">
          데이터 미리보기
          <span className="ml-2 text-sm font-normal text-gray-400">(상위 10행)</span>
        </h2>
        <DataPreview columns={data.columns} rows={data.rows} />
      </section>
    </div>
  );
}
