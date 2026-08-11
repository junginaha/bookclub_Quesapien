// Qsapiens 2.0 — 저장은 timestamptz(UTC), 표시는 전부 Asia/Seoul.
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
});

const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: SEOUL_TZ,
  hour: "numeric",
  minute: "2-digit",
});

// 일부 Node/브라우저 ICU 버전은 hour12 표기 시 "오전/오후" 대신 "AM/PM"을 출력한다.
// dayPeriod 옵션은 구형 엔진에서 생성자 자체가 던질 수 있어(RangeError) 쓰지 않고,
// 포맷된 결과 문자열을 치환하는 방식으로 모든 환경에서 안전하게 맞춘다.
function koreanizeAmPm(formatted: string): string {
  return formatted.replace(/AM/i, "오전").replace(/PM/i, "오후");
}

export function formatSeoulDate(input: string | Date): string {
  return dateFormatter.format(new Date(input));
}

export function formatSeoulDateTime(input: string | Date): string {
  return koreanizeAmPm(dateTimeFormatter.format(new Date(input)));
}

export function formatSeoulTime(input: string | Date): string {
  return koreanizeAmPm(timeFormatter.format(new Date(input)));
}

export function isPast(input: string | Date): boolean {
  return new Date(input).getTime() < Date.now();
}

export function daysUntil(input: string | Date): number {
  const ms = new Date(input).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
