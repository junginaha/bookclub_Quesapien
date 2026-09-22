// BookClubSession 파생 셀렉터. status/자리수/문구는 전부 여기서 계산하고
// 절대 세션 객체에 저장하지 않는다 — "수동 상태 필드는 반드시 썩는다"(작업지시서).

import type { BookClubSession, SessionStatus } from "./types";
import { isPast, isWaitlistFull, seatsLeft } from "./types";

export { isPast, isWaitlistFull, seatsLeft };

/**
 * startsAt/endsAt + reserved에서만 파생한다.
 * "closed"는 현재 세션 모델에 신청마감 시각(registrationClosesAt) 필드가 없어
 * 파생할 근거가 없다 — TODO(unicorn): 신청마감 시각 필드가 추가되면 그때 구현.
 * 지금은 open/full/past 세 값만 실제로 나온다.
 */
export function getStatus(s: BookClubSession): SessionStatus {
  if (isPast(s)) return "past";
  if (s.registrationClosed) return "full";
  if (seatsLeft(s) <= 0) return "full";
  return "open";
}

// ─── Asia/Seoul 날짜 포맷 — 타임존 무관하게 항상 KST 기준으로 고정 표시 ───
const KOR_WEEKDAY: Record<string, string> = {
  Sun: "일", Mon: "월", Tue: "화", Wed: "수", Thu: "목", Fri: "금", Sat: "토",
};

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  weekday: "short",
});

function seoulParts(input: string | Date) {
  const map: Record<string, string> = {};
  for (const p of partsFormatter.formatToParts(new Date(input))) map[p.type] = p.value;
  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    weekdayKo: KOR_WEEKDAY[map.weekday] ?? map.weekday,
    hour24: parseInt(map.hour, 10),
    minute: parseInt(map.minute, 10),
  };
}

/** "2026-09-19" — 캘린더/URL 쿼리용 날짜 키(Asia/Seoul 기준, 보는 사람 브라우저 타임존 무관). */
export function dateKey(input: string | Date): string {
  const { year, month, day } = seoulParts(input);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatMonthDay(input: string | Date): string {
  const { month, day } = seoulParts(input);
  return `${month}월 ${day}일`;
}

export function formatWeekdayFull(input: string | Date): string {
  const { weekdayKo } = seoulParts(input);
  return `${weekdayKo}요일`;
}

export function formatTimeOfDay(input: string | Date): string {
  const { hour24, minute } = seoulParts(input);
  const ampm = hour24 < 12 ? "오전" : "오후";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return minute > 0 ? `${ampm} ${hour12}시 ${minute}분` : `${ampm} ${hour12}시`;
}

export function formatTimeRange(startsAt: string, endsAt: string): string {
  return `${formatTimeOfDay(startsAt)} – ${formatTimeOfDay(endsAt)}`;
}

export function feeLabel(fee: number): string {
  if (fee === 0) return "무료";
  return `${fee.toLocaleString("ko-KR")}원`;
}

/** 앵콜 재개설 기준 인원 — 작업지시서 문구("5명 모이면 재개설")에 명시된 값. */
export const ENCORE_THRESHOLD = 5;

/** "현재 n명 · 5명 모이면 재개설" / 0명일 때 문구 분기. */
export function encoreCopy(count: number, threshold: number = ENCORE_THRESHOLD): string {
  if (count <= 0) return "함께 읽을 사람들이 모이면 새 일정을 엽니다.";
  if (count >= threshold) return "함께 읽을 사람들이 모였습니다.\n새 일정을 준비하고 있어요.";
  return `현재 ${count}명이 기다리고 있어요.\n${threshold}명이 모이면 다시 열립니다.`;
}

/** 카드/타임라인에 보여줄 짧은 한 줄 — 대표 발제가 있으면 그것, 없으면 요약 첫 줄. */
export function cardBlurb(s: BookClubSession): string {
  if (s.leadQuestion) return s.leadQuestion;
  return s.summary.split("\n").find((line) => line.trim().length > 0)?.trim() ?? "";
}

export function sortByStart(a: BookClubSession, b: BookClubSession): number {
  return a.startsAt.localeCompare(b.startsAt);
}

export function sortByRecent(a: BookClubSession, b: BookClubSession): number {
  return b.startsAt.localeCompare(a.startsAt);
}

/** 사이드바/헤더 통계 — 세션 배열 + reserved에서 계산, 하드코딩 없음. */
export function computeStats(sessions: BookClubSession[]) {
  const held = sessions.filter(isPast);
  const totalSessions = held.length;
  const totalPeople = sessions.reduce((sum, s) => sum + s.reserved, 0);
  const totalBooks = new Set(sessions.map((s) => s.bookTitle)).size;
  return { totalSessions, totalPeople, totalBooks };
}
