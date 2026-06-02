export type ColumnType = "numeric" | "categorical" | "datetime" | "unknown";

export interface ParsedData {
  columns: string[];
  rows: Record<string, unknown>[];
  fileName: string;
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

export type MenuId = "upload" | "analysis";

export interface MenuItem {
  id: MenuId;
  label: string;
  icon: string;
  requiresData: boolean;
}
