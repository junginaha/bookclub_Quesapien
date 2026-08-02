// 북클럽 참가 게시판(docs/bookclub-spec.md) 전용 타입·상태 판정·정렬·문구 유틸.
// 기존 src/lib/bookclub.ts(구 /bookclub 목록·상세, 앵콜 시스템)와는 별개다 —
// 이 게시판은 정원을 절대 노출하지 않고, 상태를 저장 없이 매번 계산한다.

export const DEFAULT_NAME_EXAMPLE = "지민";

/**
 * 기존 `reason` 컬럼은 명세의 "질문 한 줄"이 아니라 여러 줄 서사 + 그 안에 이미
 * 따옴표가 박힌 문장(예: '…묻습니다.\n"우리는 무엇을 지키고 있을까."')으로 채워져
 * 있다. 카드 얼굴엔 CSS가 앞뒤 따옴표를 붙이므로, 물음표가 있는 줄을 골라
 * 기존에 박혀 있던 따옴표만 벗겨 중복을 막는다 — 문구 자체는 한 글자도 바꾸지 않는다.
 */
export function pickAskLine(raw: string): string {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return raw.trim();
  const questionLine = lines.find((l) => l.includes("?")) ?? lines[lines.length - 1];
  return questionLine.replace(/^["“]+/, "").replace(/["”]+$/, "");
}

export interface BoardClub {
  id: string;
  slug: string;
  bookTitle: string;
  bookAuthor?: string;
  place: string;
  startsAt: string; // ISO
  endsAt?: string;
  closesAt: string; // ISO
  ask: string; // 카드 얼굴이 되는 질문 한 줄
  prose: string; // 본문 3문단 — \n\n으로 구분
  questions: string[]; // 정확히 3개
  who: string[]; // 정확히 3개
  hostName?: string; // 없으면 "질문하는 사람들" + 아바타 "?!"
  capacity: number; // 내부값 — 이 값 자체는 클라이언트로 넘기지 않는다
  price?: number;
  priceNote?: string;
  bring?: string;
  nameExample?: string;
}

export interface PastClub {
  id: string;
  slug: string;
  bookTitle: string;
  bookAuthor?: string;
  place: string;
  startsAt: string;
  note?: string; // past_notes — 없으면 제목·날짜만 표시
}

export type ClubStatus = "open" | "closing" | "full" | "closed" | "done";

// ── 계산된(저장하지 않는) 신청 현황 — 서버에서만 만든다 ─────────────
export interface ClubComputed {
  status: ClubStatus;
  left: number; // closing 문구용 내부 값(1~3만 화면 문구에 등장)
  waiting: number; // full 상태에서 대기자 수 문구용
}

const KOREAN_COUNT = ["", "한", "두", "세"];

export function leftToKorean(left: number): string {
  return KOREAN_COUNT[left] ?? "";
}

/**
 * 명세 2번 "상태 판정 — 이 순서 그대로"를 그대로 옮긴 것. capacity/applied는
 * 함수 밖으로 나가지 않고 left만 파생되어 쓰인다.
 */
export function computeStatus(
  now: Date,
  startsAt: Date,
  closesAt: Date,
  capacity: number,
  applied: number
): { status: ClubStatus; left: number } {
  const left = capacity - applied;
  if (now.getTime() > startsAt.getTime()) return { status: "done", left };
  if (now.getTime() > closesAt.getTime()) return { status: "closed", left };
  if (left <= 0) return { status: "full", left };
  if (left <= 3) return { status: "closing", left };
  return { status: "open", left };
}

export function badgeText(status: ClubStatus, left: number, waiting: number): string {
  switch (status) {
    case "open":
      return "함께 읽어요";
    case "closing":
      return `${leftToKorean(left)} 자리 남았어요`;
    case "full":
      return waiting > 0 ? `마감 · ${waiting}명 대기 중` : "마감 · 대기 가능";
    case "closed":
      return "이번 신청은 마쳤어요";
    case "done":
      return "";
  }
}

export function buttonText(status: ClubStatus): string {
  switch (status) {
    case "open":
    case "closing":
      return "신청할게요";
    case "full":
      return "기다릴게요";
    case "closed":
      return "다음 모임을 준비하고 있어요";
    case "done":
      return "";
  }
}

export type FillKind = "ink" | "gold" | "dim";

export function fillKind(status: ClubStatus): FillKind {
  switch (status) {
    case "open":
    case "closing":
      return "ink";
    case "full":
      return "gold";
    default:
      return "dim";
  }
}

// ── Asia/Seoul 날짜·시간 표기 — 이 게시판 전용 커스텀 포맷 ─────────
// Intl의 ICU 버전에 따라 hour12 조합 출력이 들쭉날쭉해서(예: "PM 3:30"처럼
// 단위 없이 나오는 경우가 있음) formatToParts로 값만 뽑아 직접 조립한다.
const KOR_WEEKDAY: Record<string, string> = {
  Sun: "일", Mon: "월", Tue: "화", Wed: "수", Thu: "목", Fri: "금", Sat: "토",
};

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  hourCycle: "h23",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  weekday: "short",
});

function seoulParts(input: string | Date) {
  const map: Record<string, string> = {};
  for (const p of partsFormatter.formatToParts(new Date(input))) map[p.type] = p.value;
  const hour24 = parseInt(map.hour, 10);
  return {
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    weekdayKo: KOR_WEEKDAY[map.weekday] ?? map.weekday,
    hour24,
    minute: parseInt(map.minute, 10),
  };
}

/** "8월 15일 토" — 카드 상단 날짜(요일 축약, 연도 없음). */
export function formatCardDate(input: string | Date): string {
  const { month, day, weekdayKo } = seoulParts(input);
  return `${month}월 ${day}일 ${weekdayKo}`;
}

/** "8월 15일 토요일" — 완료 문구·지난 모임 목록용(요일 전체). */
export function formatFullDateWeekday(input: string | Date): string {
  const { month, day, weekdayKo } = seoulParts(input);
  return `${month}월 ${day}일 ${weekdayKo}요일`;
}

/** "오전 10시" / "오후 3시 30분". */
export function formatTimeOfDay(input: string | Date): string {
  const { hour24, minute } = seoulParts(input);
  const ampm = hour24 < 12 ? "오전" : "오후";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return minute > 0 ? `${ampm} ${hour12}시 ${minute}분` : `${ampm} ${hour12}시`;
}

/** 신청 마감일 표기 — "9월 12일" 형태(준비 섹션 "신청은 {마감일}까지 받아요"용). */
export function formatDeadline(input: string | Date): string {
  const { month, day } = seoulParts(input);
  return `${month}월 ${day}일`;
}

// ── 정렬 ────────────────────────────────────────────────────────
export type BoardSort = "date" | "closing" | "seats";

export const BOARD_SORTS: { key: BoardSort; label: string }[] = [
  { key: "date", label: "가까운 일정순" },
  { key: "closing", label: "마감 임박순" },
  { key: "seats", label: "자리 적은 순" },
];

// 정렬은 서버에서 계산한 left(내부값)를 화면에 노출하지 않고 정렬 키로만 쓴다.
export function sortBoard<T extends { startsAt: string; closesAt: string; leftForSort: number }>(
  items: T[],
  sort: BoardSort
): T[] {
  const copy = [...items];
  switch (sort) {
    case "closing":
      copy.sort((a, b) => new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime());
      break;
    case "seats":
      copy.sort((a, b) => a.leftForSort - b.leftForSort);
      break;
    case "date":
    default:
      copy.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
      break;
  }
  return copy;
}
