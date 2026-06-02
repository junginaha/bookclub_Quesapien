interface Props {
  columns: string[];
  rows: Record<string, unknown>[];
  limit?: number;
}

export function DataPreview({ columns, rows, limit = 10 }: Props) {
  const preview = rows.slice(0, limit);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-3 py-3 text-xs font-semibold text-gray-400 text-left w-10">#</th>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {preview.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-3 py-2.5 text-gray-400 text-xs">{i + 1}</td>
              {columns.map((col) => {
                const val = row[col];
                const display =
                  val === null || val === undefined || val === ""
                    ? <span className="text-gray-300 italic">null</span>
                    : val instanceof Date
                    ? val.toISOString().slice(0, 10)
                    : String(val);
                return (
                  <td key={col} className="px-4 py-2.5 text-gray-700 max-w-[200px] truncate whitespace-nowrap" title={String(val ?? "")}>
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
