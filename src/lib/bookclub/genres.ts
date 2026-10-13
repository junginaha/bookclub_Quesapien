// 책 장르 — 홈 '지금 열리는 북클럽'·'당신을 기다리는 북클럽'의 필터 칩과
// 대기 신청 시 "같은 장르 북클럽 알림" 수요 수집에 쓴다.
// 장르 전용 랜딩 페이지는 장르당 4권 이상 쌓였을 때 연다(얇은 페이지 방지).

export const GENRES = [
  { id: "literature", label: "문학" },
  { id: "society", label: "사회·정치" },
  { id: "humanities", label: "인문·심리" },
  { id: "art", label: "예술·에세이" },
  { id: "practical", label: "경제·실용" },
] as const;

export type GenreId = (typeof GENRES)[number]["id"];

// 세션 slug(= 기다리는 북클럽 id) → 장르. 새 모임을 추가하면 여기에도 한 줄 넣는다.
const BOOK_GENRE: Record<string, GenreId> = {
  "by-the-sea-gurnah": "literature",
  "chekhov-love-desire": "literature",
  "glass-bead-game": "literature",
  "singler-lightness": "literature",
  "democracies-die": "society",
  "dangerous-leaders": "society",
  "praise-of-idleness": "humanities",
  "thinking-fast-slow": "humanities",
  "museum-for-me": "art",
  "met-guard": "art",
  "money-interview-author": "practical",
  "notebooklm-workshop": "practical",
};

export function genreOf(slug: string): GenreId | undefined {
  return BOOK_GENRE[slug];
}

export function genreLabel(id: GenreId): string {
  return GENRES.find((genre) => genre.id === id)?.label ?? "";
}

export function isGenreId(value: string): value is GenreId {
  return GENRES.some((genre) => genre.id === value);
}
