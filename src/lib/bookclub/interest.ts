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
/**
 * 카드 CTA — 한 버튼 안에서 두 줄로 끊는다(운영자 지시 2026-10-29).
 * 첫 줄은 걸어오는 말, 둘째 줄은 하는 일. 줄바꿈 위치를 글자 수에 맡기지 않는다.
 */
export const INTEREST_CTA_HOOK = "모이면 시작!";
export const INTEREST_CTA_ACTION = "같이 읽어요";

/**
 * 버튼 위에 남기는 짧은 집계. 아직 아무도 없으면 **아무것도 쓰지 않는다** —
 * 기준(5명)은 버튼이 이미 말하고 있다.
 */
export function interestCount(count: number): string {
  if (count >= INTEREST_THRESHOLD) return `${INTEREST_THRESHOLD}명이 모였어요`;
  if (count > 0) return `지금 ${count}명`;
  return "";
}

export function interestFace(count: number): "open" | "soon" {
  return count > 0 ? "soon" : "open";
}

/**
 * 북토크 달이 이미 정해진 책(2026~2027 북토크 포스터)의 CTA.
 *
 * 이 책들에는 "5명 이상 모이면 시작"이 맞지 않는다 — 이미 열리기로 정해졌다.
 * 포스터도 "도서별 북토크 일정과 장소는 추후 안내합니다"라고 적고 있으므로,
 * 사람이 할 일은 모으는 것이 아니라 **날짜가 정해지면 듣는 것**이다.
 * 신청은 기존 관심 등록(bookclub_waitlist)을 그대로 쓴다.
 */
export function scheduledCta(monthLabel: string): { hook: string; action: string } {
  // 좁은 카드(390px 2열)에서 네 줄로 접히면 읽히지 않는다 — 연도는 꼬리표 순서와
  // 신청서가 말하므로 버튼에서는 달만 쓴다("2026년 11월 북토크 / 미리 알려주세요" → 4줄).
  return { hook: `${monthLabel} 북토크`, action: "알려주세요" };
}

/** 신청서 안에서 한 번만 하는 설명 — 달이 정해진 책과 아닌 책이 다르다. */
export function interestLead(monthLabel?: string): string {
  return monthLabel
    ? `${monthLabel}에 여는 북토크예요. 날짜와 장소가 정해지면 가장 먼저 알려드릴게요.`
    : `같은 책을 고른 분이 ${INTEREST_THRESHOLD}명 이상 모이면 북토크를 열어드려요. 책친구들이 모이면 알려드릴게요. 같이 읽어요.`;
}
