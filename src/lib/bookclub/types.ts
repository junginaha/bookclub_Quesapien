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
  fee: number; // 원 단위. 0이면 무료(단, feeLabelOverride가 있으면 해당 문구 우선)\n  feeLabelOverride?: string; // 금액 미확정/별도 안내 등 운영 문구\n  registrationClosed?: boolean; // 일정은 예정이지만 일반 참여 신청을 닫은 경우
  leadQuestion: string; // 히어로·카드에 노출할 대표 발제. 없으면 빈 문자열(화면에서 숨김)
  summary: string;
  bookIntro?: string; // 검증된 서지/책소개를 바탕으로 한 상세페이지용 책 내용
  bookSourceUrl?: string;
  bookSourceLabel?: string;
  agendaPreview: string[]; // 발제 미리보기. 없으면 빈 배열(화면에서 섹션 숨김)
  encoreCount?: number; // past 전용 — TODO(unicorn): 영문 slug 기준 앵콜 요청 집계 배선 필요
  archiveSlug?: string;
  // TODO(unicorn): 대기열 정원 데이터가 아직 없다(운영자 확인 필요). 생기면
  // 채워 넣으면 isWaitlistFull()이 자동으로 "정원 마감 + 대기도 마감" 상태를
  // 판정한다 — 그 전까지는 항상 false(현재 UI 동작 변화 없음).
  waitlistCapacity?: number;
  waitlistCount?: number;
}

export const isPast = (s: BookClubSession) => new Date(s.endsAt) < new Date();
export const seatsLeft = (s: BookClubSession) => Math.max(0, s.capacity - s.reserved);
export const isWaitlistFull = (s: BookClubSession) =>
  s.waitlistCapacity != null && (s.waitlistCount ?? 0) >= s.waitlistCapacity;
