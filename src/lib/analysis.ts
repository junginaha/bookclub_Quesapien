import type { ColumnType, ColumnStat, DatasetSummary } from "@/types/data-analysis";

// ─── Type detection ───────────────────────────────────────────────

const DATE_REGEX = /^\d{4}[-./]\d{1,2}[-./]\d{1,2}$/;

function isNumericValue(v: unknown): boolean {
  if (v === null || v === undefined || v === "") return false;
  return !isNaN(Number(v));
}

function isDateValue(v: unknown): boolean {
  if (v instanceof Date) return !isNaN(v.getTime());
  if (typeof v !== "string") return false;
  return DATE_REGEX.test(v.trim()) && !isNaN(Date.parse(v.trim()));
}

/** Determine column type from a sample of non-null values. */
export function detectColumnType(values: unknown[], totalRows: number): ColumnType {
  const nonNull = values.filter((v) => v !== null && v !== undefined && v !== "");
  if (nonNull.length === 0) return "unknown";

  const sample = nonNull.slice(0, 200);

  const numericRatio = sample.filter(isNumericValue).length / sample.length;
  if (numericRatio >= 0.9) return "numeric";

  const dateRatio = sample.filter(isDateValue).length / sample.length;
  if (dateRatio >= 0.8) return "datetime";

  const uniqueCount = new Set(nonNull.map(String)).size;
  const uniqueRatio = uniqueCount / totalRows;
  if (uniqueRatio < 0.5 || uniqueCount <= 30) return "categorical";

  return "categorical";
}

// ─── Range / example string ──────────────────────────────────────

export function buildRangeString(type: ColumnType, nonNull: unknown[]): string {
  if (nonNull.length === 0) return "—";

  if (type === "numeric") {
    const nums = nonNull.map(Number).filter((n) => !isNaN(n));
    if (nums.length === 0) return "—";
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    const fmt = (n: number) =>
      Number.isInteger(n) ? n.toLocaleString() : n.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return `${fmt(min)} ~ ${fmt(max)} (평균 ${fmt(avg)})`;
  }

  if (type === "datetime") {
    const dates = nonNull
      .map((v) => (v instanceof Date ? v : new Date(String(v))))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());
    if (dates.length === 0) return "—";
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return `${fmt(dates[0])} ~ ${fmt(dates[dates.length - 1])}`;
  }

  // categorical
  const unique = [...new Set(nonNull.map(String))].slice(0, 4);
  return unique.join(", ") + (new Set(nonNull).size > 4 ? " ..." : "");
}

// ─── Per-column stats ────────────────────────────────────────────

export function computeColumnStat(
  name: string,
  values: unknown[],
  totalRows: number
): ColumnStat {
  const nonNull = values.filter((v) => v !== null && v !== undefined && v !== "");
  const missingCount = totalRows - nonNull.length;
  const type = detectColumnType(values, totalRows);

  return {
    name,
    type,
    uniqueCount: new Set(nonNull.map(String)).size,
    missingCount,
    missingRatio: totalRows > 0 ? missingCount / totalRows : 0,
    range: buildRangeString(type, nonNull),
  };
}

// ─── Dataset summary ─────────────────────────────────────────────

export function computeDatasetSummary(
  columns: string[],
  rows: Record<string, unknown>[]
): DatasetSummary {
  const rowCount = rows.length;
  const columnCount = columns.length;
  let totalMissing = 0;

  for (const col of columns) {
    for (const row of rows) {
      const v = row[col];
      if (v === null || v === undefined || v === "") totalMissing++;
    }
  }

  const missingRatio = rowCount * columnCount > 0 ? totalMissing / (rowCount * columnCount) : 0;
  return { rowCount, columnCount, totalMissing, missingRatio };
}

// ─── All column stats ────────────────────────────────────────────

export function computeAllColumnStats(
  columns: string[],
  rows: Record<string, unknown>[]
): ColumnStat[] {
  return columns.map((col) => {
    const values = rows.map((r) => r[col]);
    return computeColumnStat(col, values, rows.length);
  });
}
