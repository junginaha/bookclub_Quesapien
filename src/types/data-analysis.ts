export type ColumnType = "numeric" | "categorical" | "datetime" | "unknown";

export interface ParsedData {
  columns: string[];
  rows: Record<string, unknown>[];
  fileName: string;
  sheets?: string[];
}

export interface ColumnStat {
  name: string;
  type: ColumnType;
  uniqueCount: number;
  missingCount: number;
  missingRatio: number;
  range: string;
}

export interface DatasetSummary {
  rowCount: number;
  columnCount: number;
  totalMissing: number;
  missingRatio: number;
}

// ─── Cleaning ───────────────────────────────────────────────────

export type MissingStrategy = "drop" | "mean" | "median" | "mode" | "constant";
export type OutlierMethod = "iqr" | "zscore";
export type OutlierAction = "flag" | "remove" | "clip";

export interface CleaningLog {
  id: string;
  timestamp: number;
  description: string;
  rowsAffected: number;
}

// ─── Menu ───────────────────────────────────────────────────────

export type MenuId = "upload" | "analysis" | "cleaning" | "visualization" | "correlation";

export interface MenuItem {
  id: MenuId;
  label: string;
  icon: string;
  requiresData: boolean;
}
