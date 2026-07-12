import crypto from "node:crypto";
import type { BookClubRecord } from "./bookclub";

// 서버 전용 — 클라이언트 번들에 node:crypto가 섞이지 않도록 bookclub.ts와 분리한다.
// 앵콜 요청 중복 방지용 연락처 해시. 원문 연락처는 저장하지 않는다.
export function hashContact(value: string): string {
  const normalized = value.trim().toLowerCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * landing_book_club_encore_counts 뷰(011 마이그레이션)에서 클럽별 앵콜 요청 수를
 * 가져와 각 레코드에 encore_request_count로 병합한다. 뷰/테이블이 아직 없으면
 * (마이그레이션 미적용 상태) 조용히 0으로 채운다 — 계측 실패가 목록 렌더링을
 * 막아서는 안 된다.
 */
export async function attachEncoreCounts<T extends BookClubRecord>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  clubs: T[]
): Promise<T[]> {
  if (clubs.length === 0) return clubs;
  try {
    const ids = clubs.map((c) => c.id).filter(Boolean);
    const { data, error } = await supabase
      .from("landing_book_club_encore_counts")
      .select("club_id, encore_request_count")
      .in("club_id", ids);
    if (error || !data) return clubs;
    const counts = new Map<string, number>(
      data.map((row: { club_id: string; encore_request_count: number }) => [row.club_id, row.encore_request_count])
    );
    return clubs.map((c) => ({ ...c, encore_request_count: counts.get(c.id) ?? c.encore_request_count ?? 0 }));
  } catch {
    return clubs;
  }
}
