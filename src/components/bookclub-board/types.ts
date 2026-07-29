import type { ClubStatus } from "@/lib/bookclubBoard";

export interface BoardCardData {
  id: string;
  slug: string;
  bookTitle: string;
  bookAuthor?: string;
  place: string;
  startsAt: string;
  endsAt?: string;
  closesAt: string;
  ask: string;
  prose: string;
  questions: string[];
  who: string[];
  hostName?: string;
  price?: number;
  priceNote?: string;
  bring?: string;
  nameExample?: string;
  status: ClubStatus;
  /** closing 배지에서 "한/두/세"로만 변환해 쓰는 내부값 — 그 외엔 렌더링하지 않는다. */
  left: number;
  waiting: number;
  /** "자리 적은 순" 정렬 전용 키 — 화면에 숫자로 노출하지 않는다. */
  leftForSort: number;
}

export interface PastClubData {
  id: string;
  slug: string;
  bookTitle: string;
  bookAuthor?: string;
  place: string;
  startsAt: string;
  note?: string;
}
