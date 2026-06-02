type Row = Record<string, unknown>;

/** Pearson 상관계수 (pairwise deletion: 두 컬럼 모두 값 있는 행만 사용) */
export function pearson(rows: Row[], colA: string, colB: string): number | null {
  const pairs: [number, number][] = [];

  for (const row of rows) {
    const a = Number(row[colA]);
    const b = Number(row[colB]);
    if (!isNaN(a) && !isNaN(b) && row[colA] !== "" && row[colB] !== "") {
      pairs.push([a, b]);
    }
  }

  if (pairs.length < 3) return null;

  const n = pairs.length;
  const meanA = pairs.reduce((s, p) => s + p[0], 0) / n;
  const meanB = pairs.reduce((s, p) => s + p[1], 0) / n;

  let num = 0;
  let denA = 0;
  let denB = 0;
  for (const [a, b] of pairs) {
    const da = a - meanA;
    const db = b - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }

  const denom = Math.sqrt(denA * denB);
  if (denom === 0) return null;
  return num / denom;
}

export interface CorrelationMatrix {
  columns: string[];
  matrix: (number | null)[][];
}

export function buildCorrelationMatrix(
  rows: Row[],
  numericColumns: string[]
): CorrelationMatrix {
  const n = numericColumns.length;
  const matrix: (number | null)[][] = Array.from({ length: n }, () =>
    Array(n).fill(null)
  );

  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      const r = pearson(rows, numericColumns[i], numericColumns[j]);
      matrix[i][j] = r;
      matrix[j][i] = r;
    }
  }

  return { columns: numericColumns, matrix };
}

/** -1~1 값을 히트맵 색상으로 변환 */
export function correlationColor(r: number | null): string {
  if (r === null) return "#e5e7eb";
  const abs = Math.abs(r);
  if (r > 0) {
    const g = Math.round(255 - abs * 200);
    return `rgb(${Math.round(abs * 220)}, ${g}, 60)`;
  } else {
    const g = Math.round(255 - abs * 200);
    return `rgb(60, ${g}, ${Math.round(abs * 220)})`;
  }
}

export function correlationLabel(r: number | null): string {
  if (r === null) return "N/A";
  return r.toFixed(3);
}
