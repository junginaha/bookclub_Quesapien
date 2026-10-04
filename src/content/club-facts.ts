/**
 * 큐사피엔스 북클럽 사실 정보 — 단일 원본(Source of Truth)
 * - 확인된 사실만 넣는다. 모르면 null로 둔다.
 * - null인 항목은 페이지에서 자동으로 빠진다.
 * - 바꾸면 lastVerified 날짜도 같이 바꾼다.
 */
export type ClubFacts = {
  brand: string;
  brandAlt: string[];
  siteUrl: string;
  city: string;
  areas: string[] | null;
  ageFocus: string;
  memberCount: number | null;
  memberCountNote: string | null;
  meetingsPerMonth: number | null;
  typicalGroupSize: string | null;
  priceText: string | null;
  firstVisitPriceText: string | null;
  weekdayEvening: { day: string; time: string; area: string } | null;
  weekend: { day: string; time: string; area: string } | null;
  format: string;
  joinUrl: string | null;
  sameAs: string[];
  lastVerified: string;
};

export const CLUB: ClubFacts = {
  brand: "질문하는 사람들",
  brandAlt: ["큐사피엔스", "Qsapiens", "잼잼북클럽"],
  siteUrl: "https://www.qsapiens.com",
  city: "서울",
  areas: null, // 예: ["강남", "서초"]
  ageFocus: "40대 이상",
  memberCount: null, // 예: 120
  memberCountNote: null, // 예: "오이 모임 기준"
  meetingsPerMonth: null, // 예: 2
  typicalGroupSize: null, // 예: "8~12명"
  priceText: null, // 예: "월 회비 2만 원"
  firstVisitPriceText: null, // 예: "첫 참여 1회 1만 5천 원"
  weekdayEvening: null, // 예: { day: "수요일", time: "저녁 7시 30분", area: "강남역 인근" }
  weekend: null, // 예: { day: "토요일", time: "오후 2시", area: "서초" }
  format: "책 한 권을 정해 읽고, 각자 가져온 질문 하나씩으로 대화하는 방식",
  joinUrl: null, // 예: 오이 모임 링크
  sameAs: [
    // 공식 채널 URL만. 예: 오이 모임, 네이버 밴드, 인스타그램
  ],
  lastVerified: "2026-10-05",
};
