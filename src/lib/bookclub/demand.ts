// bookclub_waitlist.club_slug에 담는 수요 키. 테이블 하나로 세 가지 수요를 구분한다.
//   encore:<id>          당신을 기다리는 북클럽 대기 명단 (waiting.ts)
//   genre:<genreId>      같은 장르 북클럽이 열리면 알림
//   request:<책> / <저자>  읽고 싶은 책 요청 (같은 키가 5명 모이면 개설 검토)
import { isGenreId } from "./genres";
import { isWaitingKey } from "./waiting";

export const GENRE_PREFIX = "genre:";
export const REQUEST_PREFIX = "request:";
const MAX_REQUEST_KEY = 200;

export function genreKey(genreId: string): string {
  return GENRE_PREFIX + genreId;
}

function clean(value: string): string {
  return value.normalize("NFKC").replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
}

/** 같은 책은 같은 키가 되도록 ISBN이 있으면 ISBN 우선, 없으면 제목/저자. 사람이 읽을 수 있게 제목을 남긴다. */
export function requestKey(title: string, author: string, isbn?: string | null): string {
  const isbn13 = isbn?.split(/\s+/).find((v) => /^\d{13}$/.test(v));
  const label = clean(author) ? `${clean(title)} / ${clean(author)}` : clean(title);
  return (REQUEST_PREFIX + (isbn13 ? `${isbn13} ` : "") + label).slice(0, MAX_REQUEST_KEY).trimEnd();
}

export function isRequestKey(key: string): boolean {
  if (!key.startsWith(REQUEST_PREFIX) || key.length > MAX_REQUEST_KEY) return false;
  const rest = key.slice(REQUEST_PREFIX.length);
  return rest.length > 0 && rest === clean(rest);
}

export function isGenreKey(key: string): boolean {
  return key.startsWith(GENRE_PREFIX) && isGenreId(key.slice(GENRE_PREFIX.length));
}

/** 정해진 모임 slug가 아닌 '수요 수집' 키인가. */
export function isDemandKey(key: string): boolean {
  return isWaitingKey(key) || isGenreKey(key) || isRequestKey(key);
}
