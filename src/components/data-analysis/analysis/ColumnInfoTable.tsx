import { cn } from "@/lib/utils";
import type { ColumnStat } from "@/types/data-analysis";

const TYPE_BADGE: Record<string, string> = {
  numeric: "bg-blue-100 text-blue-700",
  categorical: "bg-purple-100 text-purple-700",
  datetime: "bg-green-100 text-green-700",
  unknown: "bg-gray-100 text-gray-500",
};

const TYPE_LABEL: Record<string, string> = {
  numeric: "연속형",
  categorical: "범주형",
  datetime: "날짜형",
  unknown: "미확인",
};

interface Props {
  stats: ColumnStat[];
}

export function ColumnInfoTable({ stats }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {["컬럼명", "데이터 타입", "고유값 수", "결측치 수", "결측치 비율", "범위 / 예시"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {stats.map((s) => {
            const hasMissing = s.missingCount > 0;
            const highMissing = s.missingRatio > 0.3;
            return (
              <tr key={s.name} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px] truncate" title={s.name}>
                  {s.name}
                </td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", TYPE_BADGE[s.type])}>
                    {TYPE_LABEL[s.type]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{s.uniqueCount.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-700">{s.missingCount.toLocaleString()}</td>
                <td className={cn("px-4 py-3 font-medium", highMissing ? "text-red-600" : hasMissing ? "text-amber-600" : "text-gray-400")}>
                  {hasMissing ? (
                    <span className={cn("px-1.5 py-0.5 rounded text-xs", highMissing ? "bg-red-50" : "bg-amber-50")}>
                      {(s.missingRatio * 100).toFixed(1)}%
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-[260px] truncate" title={s.range}>
                  {s.range}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
