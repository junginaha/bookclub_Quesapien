// "함께 읽고 싶은 책" 관심 집계 — 클라이언트·서버 공용(서버 전용 import 금지).
//
// 저장소는 기존 bookclub_waitlist(club_slug, name, phone) 하나만 쓴다(DB 변경 없음).
//  - 오픈 예정 북모임 카드: club_slug = "next-…"(upcoming.ts의 slug)
//  - 회원이 직접 추천한 책:  club_slug = "rec:<key>|<제목>|<저자>"
//    key는 띄어쓰기·문장부호·대소문자를 지운 제목이라 "호모데우스"와 "호모 데우스"가 한 책으로 모인다.
// 같은 책·같은 번호는 join_bookclub_waitlist RPC가 중복 등록을 막는다.

export const INTEREST_THRESHOLD = 5;

export function titleKey(title: string): string {
  return title
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]/gu, "")
    .slice(0, 60);
}

export function buildRecSlug(title: string, author: string): string {
  const t = title.replace(/\|/g, " ").trim().slice(0, 80);
  const a = author.replace(/\|/g, " ").trim().slice(0, 60);
  return `rec:${titleKey(t)}|${t}|${a}`;
}

export function parseRecSlug(slug: string): { key: string; title: string; author: string } | null {
  if (!slug.startsWith("rec:")) return null;
  const [key = "", title = "", author = ""] = slug.slice(4).split("|");
  return key ? { key, title, author } : null;
}

/** 집계 키 — next-* 는 그대로, rec: 는 제목 키 기준. */
export function interestKey(slug: string): string | null {
  if (slug.startsWith("next-")) return slug;
  const rec = parseRecSlug(slug);
  return rec ? `rec:${rec.key}` : null;
}

/**
 * 카드 바깥에 붙는 짧은 안내. 실제 집계값만 쓴다(0이면 인원 숫자를 노출하지 않음).
 * 긴 설명("책친구들이 모이면 알려드려요")은 신청서 안에서 한 번만 한다 —
 * 카드마다 같은 문장이 반복되면 안내가 아니라 잡음이 된다(운영자 지시 2026-10-28).
 */
export function interestCopy(count: number): string {
  if (count >= INTEREST_THRESHOLD) return `${INTEREST_THRESHOLD}명이 모였어요. 일정을 잡아 연락드릴게요.`;
  if (count > 0) return `지금 ${count}명 · ${INTEREST_THRESHOLD}명 이상 모이면 시작!`;
  return `${INTEREST_THRESHOLD}명 이상 모이면 시작!`;
}

/**
 * interestCopy()와 **같은 분기**에서 뽑는 손그림 얼굴 — 문구와 그림이 어긋날 수 없다.
 * 아직 아무도 없으면 편안한 얼굴, 모이는 중이면 서두르는 얼굴.
 * (자리 마감을 뜻하는 "full"은 여기 쓰지 않는다 — 5명은 마감이 아니라 시작이다.)
 */
export function interestFace(count: number): "open" | "soon" {
  return count > 0 ? "soon" : "open";
}
