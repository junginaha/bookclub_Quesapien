// 북클럽 세션 — 단일 데이터 모델. /bookclub·홈 "함께 읽어요" 섹션·상세 페이지가
// 전부 이 타입 하나만 본다. status는 저장하지 않는다(파생 전용, selectors.ts).

export type SessionStatus = "open" | "full" | "closed" | "past";

export interface BookClubVenue {
  name: string; // '에피소드 강남 262'
  detail: string; // TODO(unicorn): 층/호실 등 상세 위치 — 운영자 확인 필요, 현재 빈 문자열
  address: string;
  lat: number;
  lng: number;
  nearestStation: string; // TODO(unicorn): 가까운 역/출구 안내 — 운영자 확인 필요, 현재 빈 문자열
}

export interface BookClubSession {
  id: string;
  slug: string; // 영문 slug 필수 — bookclub_applications(예약)이 이 슬러그로 조인된다
  title: string; // 북토크 타이틀(행사명)
  bookTitle: string;
  author: string;
  coverUrl?: string;
  startsAt: string; // ISO8601 + KST offset
  endsAt: string;
  venue: BookClubVenue;
  capacity: number;
  reserved: number; // 렌더 시점에 getJoinedCounts()로 덮어써진다 — 정적 값 아님
  fee: number; // 원 단위. 0이면 '무료'
  leadQuestion: string; // 히어로·카드에 노출할 대표 발제. 없으면 빈 문자열(화면에서 숨김)
  summary: string;
  agendaPreview: string[]; // 발제 미리보기. 없으면 빈 배열(화면에서 섹션 숨김)
  encoreCount?: number; // past 전용 — TODO(unicorn): 영문 slug 기준 앵콜 요청 집계 배선 필요
  archiveSlug?: string;
}

export const isPast = (s: BookClubSession) => new Date(s.endsAt) < new Date();
export const seatsLeft = (s: BookClubSession) => Math.max(0, s.capacity - s.reserved);
