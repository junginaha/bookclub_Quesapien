// Quesapience 2.0 — 저장은 timestamptz(UTC), 표시는 전부 Asia/Seoul.
// 이 파일이 유일한 날짜 표시 유틸리티다 — 화면에서 직접 Date 포맷을 만들지 말 것.

const SEOUL_TZ = "Asia/Seoul";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: SEOUL_TZ,
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: SEOUL_TZ,
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
  dayPeriod: "short", // dayPeriod 명시 없이는 일부 Node/ICU 버전이 "오전/오후" 대신 "AM/PM"을 출력한다.
});

const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: SEOUL_TZ,
  hour: "numeric",
  minute: "2-digit",
  dayPeriod: "short",
});

export function formatSeoulDate(input: string | Date): string {
  return dateFormatter.format(new Date(input));
}

export function formatSeoulDateTime(input: string | Date): string {
  return dateTimeFormatter.format(new Date(input));
}

export function formatSeoulTime(input: string | Date): string {
  return timeFormatter.format(new Date(input));
}

export function isPast(input: string | Date): boolean {
  return new Date(input).getTime() < Date.now();
}

export function daysUntil(input: string | Date): number {
  const ms = new Date(input).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
