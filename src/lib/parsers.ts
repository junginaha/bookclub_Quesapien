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
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const raw = utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });
  const columns = raw.length > 0 ? Object.keys(raw[0]) : [];
  return { columns, rows: raw, fileName: file.name };
}

export async function parseFile(file: File): Promise<ParsedData> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv") return parseCSV(file);
  if (ext === "xlsx" || ext === "xls") return parseXLSX(file);
  throw new Error(`지원하지 않는 파일 형식입니다: .${ext}`);
}
