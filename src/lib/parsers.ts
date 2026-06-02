import Papa from "papaparse";
import type { ParsedData } from "@/types/data-analysis";

export async function parseCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0 && result.data.length === 0) {
          reject(new Error(result.errors[0].message));
          return;
        }
        const rows = result.data as Record<string, unknown>[];
        const columns = result.meta.fields ?? [];
        resolve({ columns, rows, fileName: file.name });
      },
      error: (err) => reject(new Error(err.message)),
    });
  });
}

export async function parseXLSX(file: File): Promise<ParsedData> {
  const { read, utils } = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb = read(buffer, { type: "array", cellDates: true });

  // 모든 시트를 병합 — 컬럼 구성이 동일하다고 가정
  const allRows: Record<string, unknown>[] = [];
  let columns: string[] = [];
  const sheets: string[] = [];

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows = utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });
    if (rows.length === 0) continue;
    if (columns.length === 0) columns = Object.keys(rows[0]);
    // 시트 이름을 식별할 수 있도록 각 행에 __sheet__ 추가 (선택 분석용)
    for (const row of rows) {
      allRows.push({ ...row, __sheet__: sheetName });
    }
    sheets.push(sheetName);
  }

  // __sheet__ 컬럼은 분석 컬럼에 포함
  if (allRows.length > 0 && !columns.includes("__sheet__")) {
    columns = [...columns, "__sheet__"];
  }

  return {
    columns,
    rows: allRows,
    fileName: file.name,
    sheets: sheets.length > 1 ? sheets : undefined,
  };
}

export async function parseFile(file: File): Promise<ParsedData> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv") return parseCSV(file);
  if (ext === "xlsx" || ext === "xls") return parseXLSX(file);
  throw new Error(`지원하지 않는 파일 형식입니다: .${ext}`);
}
