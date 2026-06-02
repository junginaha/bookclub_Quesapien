import type { MissingStrategy, OutlierMethod, OutlierAction } from "@/types/data-analysis";

type Row = Record<string, unknown>;

// ─── 결측치 처리 ─────────────────────────────────────────────────

function numericValues(rows: Row[], col: string): number[] {
  return rows
    .map((r) => Number(r[col]))
    .filter((n) => !isNaN(n));
}

function mean(nums: number[]) {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function median(nums: number[]) {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function mode(rows: Row[], col: string): unknown {
  const freq = new Map<string, { val: unknown; count: number }>();
  for (const row of rows) {
    const v = row[col];
    if (v === null || v === undefined || v === "") continue;
    const key = String(v);
    const prev = freq.get(key);
    freq.set(key, { val: v, count: (prev?.count ?? 0) + 1 });
  }
  let best: { val: unknown; count: number } | null = null;
  for (const entry of freq.values()) {
    if (!best || entry.count > best.count) best = entry;
  }
  return best?.val ?? null;
}

function isMissing(v: unknown): boolean {
  return v === null || v === undefined || v === "";
}

export function applyMissingStrategy(
  rows: Row[],
  col: string,
  strategy: MissingStrategy,
  constantValue?: string
): { rows: Row[]; affected: number } {
  if (strategy === "drop") {
    const filtered = rows.filter((r) => !isMissing(r[col]));
    return { rows: filtered, affected: rows.length - filtered.length };
  }

  let fill: unknown;
  if (strategy === "mean") {
    const nums = numericValues(rows, col);
    fill = nums.length > 0 ? mean(nums) : null;
  } else if (strategy === "median") {
    const nums = numericValues(rows, col);
    fill = nums.length > 0 ? median(nums) : null;
  } else if (strategy === "mode") {
    fill = mode(rows, col);
  } else {
    fill = constantValue ?? "";
  }

  let affected = 0;
  const newRows = rows.map((r) => {
    if (isMissing(r[col])) {
      affected++;
      return { ...r, [col]: fill };
    }
    return r;
  });
  return { rows: newRows, affected };
}

// ─── 이상치 탐지 ─────────────────────────────────────────────────

export interface OutlierResult {
  indices: Set<number>;
  bounds: { lower: number; upper: number };
}

export function detectOutliers(
  rows: Row[],
  col: string,
  method: OutlierMethod,
  threshold: number
): OutlierResult {
  const nums = rows.map((r, i) => ({ i, v: Number(r[col]) })).filter((x) => !isNaN(x.v));
  const vals = nums.map((x) => x.v);

  let lower: number;
  let upper: number;

  if (method === "iqr") {
    const sorted = [...vals].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    lower = q1 - threshold * iqr;
    upper = q3 + threshold * iqr;
  } else {
    const m = mean(vals);
    const std = Math.sqrt(vals.reduce((s, v) => s + (v - m) ** 2, 0) / vals.length);
    lower = m - threshold * std;
    upper = m + threshold * std;
  }

  const indices = new Set(nums.filter((x) => x.v < lower || x.v > upper).map((x) => x.i));
  return { indices, bounds: { lower, upper } };
}

export function applyOutlierAction(
  rows: Row[],
  col: string,
  result: OutlierResult,
  action: OutlierAction
): { rows: Row[]; affected: number } {
  if (action === "flag") {
    const newRows = rows.map((r, i) =>
      result.indices.has(i) ? { ...r, [`${col}_outlier`]: true } : r
    );
    return { rows: newRows, affected: result.indices.size };
  }

  if (action === "remove") {
    const newRows = rows.filter((_, i) => !result.indices.has(i));
    return { rows: newRows, affected: result.indices.size };
  }

  // clip
  const { lower, upper } = result.bounds;
  let affected = 0;
  const newRows = rows.map((r, i) => {
    if (!result.indices.has(i)) return r;
    affected++;
    const v = Number(r[col]);
    return { ...r, [col]: Math.max(lower, Math.min(upper, v)) };
  });
  return { rows: newRows, affected };
}
