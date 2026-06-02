import { Rows3, Columns3, AlertTriangle } from "lucide-react";
import type { DatasetSummary } from "@/types/data-analysis";

interface Props {
  summary: DatasetSummary;
}

export function SummaryCards({ summary }: Props) {
  const { rowCount, columnCount, totalMissing, missingRatio } = summary;

  const cards = [
    { label: "전체 행", value: rowCount.toLocaleString(), icon: Rows3, color: "bg-blue-50 text-blue-600" },
    { label: "전체 열", value: columnCount.toLocaleString(), icon: Columns3, color: "bg-purple-50 text-purple-600" },
    {
      label: "결측치 수",
      value: totalMissing.toLocaleString(),
      sub: `${(missingRatio * 100).toFixed(1)}%`,
      icon: AlertTriangle,
      color: totalMissing > 0 ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, color }) => (
        <div key={label} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-800">
              {value}
              {sub && <span className="ml-1.5 text-sm font-medium text-gray-400">({sub})</span>}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
