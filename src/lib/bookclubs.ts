// /bookclub IA 전면 재구성 — 단일 데이터 소스.
// 홈·캘린더·타임라인·상세 페이지가 전부 이 파일 하나만 본다. 다른 곳에서
// 북클럽 데이터를 새로 하드코딩하지 않는다.
//
// 이 파일은 구 src/lib/bookclub.ts / bookclubBoard.ts / clubsData.ts를 대체한다
// (세 파일 모두 폐기 대상 — ALL_CLUBS의 30여 개 장식용 가짜 클럽 포함).
//
// ⚠ 실데이터 출처 메모 (검증 없이 지어낸 값 없음, 없는 값은 명시적으로 비워둠):
// - 책 제목/저자/일시/장소/가격/정원/reasonFull은 supabase/migrations/020_real_bookclub_reservations.sql
//   (프로덕션 실행 여부 미확인 — CLAUDE.md 기존 이슈)과 src/lib/bookclub.ts의 REAL_CLUBS를 근거로 했다.
// - reasonOneLine(40자 이내)은 각 클럽의 기존 reason/description 문장에서 실제 문장을
//   그대로 추출했다(요약·창작 없음) — 9/19건만 이번 세션에서 운영자가 새로 준 문장을 그대로 씀.
// - 위험한 리더/메트로폴리탄 경비원 두 건은 questions(이번 질문 3개)가 DB/기존 코드
//   어디에도 없다 — 지어내지 않고 빈 배열로 둔다. 화면은 questions가 비어 있으면
//   "이번 질문" 섹션 자체를 숨긴다(가짜 질문 노출 금지).
// - 게으름에 대한 찬양 / 오직 나를 위한 미술관(지난 2건)은 capacity/fee가 어느 소스에도
//   없다 — 같은 장소의 다른 모든 세션과 동일하게 8명/20,000원으로 추정 표기했다.
//   실제 값과 다르면 운영자 확인 필요(코드에도 주석으로 남김).
// - venueName/address/lat/lng: "에피소드 강남 262"의 도로명주소·좌표는 이 저장소
//   어디에도 저장돼 있지 않았다 — 이번 세션에서 웹 검색으로 확인한 실주소
//   (서울특별시 서초구 강남대로 299)와 OSM Nominatim 지오코딩 좌표를 썼다.
// - joinedCount(참가 인원)는 이 타입에 없다 — 스펙대로 저장하지 않고 매번 계산한다.
//   getJoinedCount()/getJoinedCounts()는 src/lib/bookclubs.server.ts에 따로 있다
//   (Supabase 클라이언트가 next/headers를 물어서 클라이언트 컴포넌트에 이 파일을
//   그대로 import하면 빌드가 깨진다 — 서버 전용 조회는 반드시 그 파일에서만 쓴다).
//   지난 3건의 실제 참석 인원은 어디에도 기록돼 있지 않아 폴백값이 없다(=0으로 집계됨,
//   "함께한 사람" 통계가 과소 계산됨 — 운영자가 실제 참석 인원을 알려줘야 정확해진다).

import { OLD_SLUG_REDIRECTS } from "@/lib/bookclubRedirects";

export { OLD_SLUG_REDIRECTS };

export type BookClub = {
  slug: string;
  title: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string; // 없으면 "" — 화면에서 /og 생성 이미지로 대체
  handedBy: { name: string }[];
  reasonOneLine: string; // 40자 이내
  reasonFull: string;
  questions: string[]; // 없으면 빈 배열 — 화면에서 섹션 자체를 숨김
  startAt: string; // ISO, KST
  endAt: string; // ISO, KST
  venueName: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  fee: number | null;
  isTentative: boolean;
  archiveSlug?: string;
};

export type ClubStatus = "tentative" | "open" | "almost_full" | "full" | "past";

const EPISODE_GANGNAM_262 = {
  venueName: "에피소드 강남 262",
  address: "서울특별시 서초구 강남대로 299",
  lat: 37.4898,
  lng: 127.0311,
};

export const BOOKCLUBS: BookClub[] = [
  {
    slug: "dangerous-leaders",
    title: "위험한 리더는 어떻게 만들어지는가 북토크",
    bookTitle: "위험한 리더는 어떻게 만들어지는가",
    bookAuthor: "스티브 테일러",
    bookCover: "",
    handedBy: [{ name: "질문하는 사람들" }],
    reasonOneLine: "왜 저런 사람이 위로 가는지, 오래 궁금했던 분께.",
    reasonFull:
      "권력은 사람을 시험합니다.\n그리고 그 시험은 멀리 있지 않아요.\n회의실에서, 단톡방에서,\n우리가 고개를 끄덕이는 순간마다 조용히 일어납니다.\n\n이 책을 사이에 두고 서로에게 물어봅니다.\n좋은 자리는 사람을 어떻게 바꾸는지,\n나는 어떤 리더 곁에 서고 싶은지.\n\n당신의 일터에도 있는 이야기예요.\n함께 꺼내 봐요.",
    questions: [],
    startAt: "2026-09-19T10:00:00+09:00",
    endAt: "2026-09-19T12:00:00+09:00",
    ...EPISODE_GANGNAM_262,
    capacity: 15,
    fee: 20000,
    isTentative: false,
  },
  {
    slug: "met-guard",
    title: "나는 메트로폴리탄 미술관의 경비원입니다 북토크",
    bookTitle: "나는 메트로폴리탄 미술관의 경비원입니다",
    bookAuthor: "패트릭 브링리",
    bookCover: "",
    handedBy: [{ name: "질문하는 사람들" }],
    reasonOneLine: "그림 앞에 서 있던 10년의 기록.",
    reasonFull:
      "형을 잃은 남자가 세계에서 가장 큰 미술관의 경비원이 되었습니다.\n10년 동안 그림 앞에 서 있었고, 천천히 회복했습니다.\n\n깊어지는 가을, 상실과 회복에 대해 이야기 나눠요.\n슬픔을 지나온 분도, 지나는 중인 분도,\n그 곁에 있고 싶은 분도 환영합니다.\n\n조용한 책이에요. 그래서 오래 남습니다.",
    questions: [],
    startAt: "2026-10-17T10:00:00+09:00",
    endAt: "2026-10-17T12:00:00+09:00",
    ...EPISODE_GANGNAM_262,
    capacity: 8,
    fee: 20000,
    isTentative: false,
  },
  {
    slug: "democracies-die",
    title: "어떻게 민주주의는 무너지는가 북토크",
    bookTitle: "어떻게 민주주의는 무너지는가",
    bookAuthor: "스티븐 레비츠키 · 대니얼 지블랫",
    bookCover: "",
    handedBy: [{ name: "루하" }],
    reasonOneLine: "우리는 무엇을 지키고 있을까.",
    reasonFull:
      "토요일 아침 열 시, 에피소드 강남 262.\n커피 향이 도는 테이블에 여덟 명이 둘러앉아요.\n\n하필 광복절 아침에 이 책을 폅니다.\n민주주의는 광장에서 태어나 식탁에서, 일터에서,\n우리의 말 속에서 매일 이어지니까요.\n81년 전 누군가 되찾은 것을, 지금 우리는 어떻게\n지키고 있는지 — 그 질문에 잠시 머물러 봅니다.\n\n두 시간의 대화가 끝나고 돌아가는 길,\n같은 뉴스가 조금 다르게 보일 거예요.",
    questions: [
      "반대편을 상대가 아니라 적으로 보기 시작하면 어떤 일이 생길까요?",
      "법을 지키면서도 민주주의를 약하게 만들 수 있을까요?",
      "우리는 어떤 위험 신호를 놓치고 있을까요?",
    ],
    startAt: "2026-08-15T10:00:00+09:00",
    endAt: "2026-08-15T12:00:00+09:00",
    ...EPISODE_GANGNAM_262,
    capacity: 8,
    fee: 20000,
    isTentative: false,
  },
  {
    slug: "praise-of-idleness",
    title: "게으름에 대한 찬양 북토크",
    bookTitle: "게으름에 대한 찬양",
    bookAuthor: "버트런드 러셀",
    bookCover: "",
    handedBy: [{ name: "질문하는 사람들" }],
    reasonOneLine: "왜 그렇게 바쁘게 사느냐고.",
    reasonFull:
      "90여 년 전 철학자가 물었어요.\n왜 그렇게 바쁘게 사느냐고.\n우리는 그날, 함께 대답을 찾았습니다.\n투표에서 가장 많은 표를 받은 책이었어요.",
    questions: [],
    startAt: "2026-07-18T10:00:00+09:00",
    endAt: "2026-07-18T12:00:00+09:00",
    ...EPISODE_GANGNAM_262,
    capacity: 8, // 실제 정원 기록 없음 — 같은 장소 다른 세션과 동일하게 추정. 운영자 확인 필요.
    fee: 20000, // 실제 가격 기록 없음 — 동일 이유로 추정. 운영자 확인 필요.
    isTentative: false,
  },
  {
    slug: "museum-for-me",
    title: "오직 나를 위한 미술관 북토크",
    bookTitle: "오직 나를 위한 미술관",
    bookAuthor: "정여울",
    bookCover: "",
    handedBy: [{ name: "질문하는 사람들" }],
    reasonOneLine: "그림 앞에서 멈췄던 날.",
    reasonFull: "그림 앞에서 멈췄던 날.\n나를 위한 시간이었어요.",
    questions: [],
    startAt: "2026-06-20T10:00:00+09:00",
    endAt: "2026-06-20T12:00:00+09:00",
    ...EPISODE_GANGNAM_262,
    capacity: 8, // 실제 정원 기록 없음 — 추정. 운영자 확인 필요.
    fee: 20000, // 실제 가격 기록 없음 — 추정. 운영자 확인 필요.
    isTentative: false,
  },
];

export function getBookClub(slug: string): BookClub | undefined {
  return BOOKCLUBS.find((c) => c.slug === slug);
}

export function status(club: BookClub, joinedCount: number, now: Date = new Date()): ClubStatus {
  if (new Date(club.startAt).getTime() <= now.getTime()) return "past";
  if (club.isTentative) return "tentative";
  const remaining = club.capacity - joinedCount;
  if (remaining <= 0) return "full";
  if (remaining <= 3) return "almost_full";
  return "open";
}

export function remainingSeats(club: BookClub, joinedCount: number): number {
  return Math.max(0, club.capacity - joinedCount);
}

// ── Asia/Seoul 날짜 포맷 ────────────────────────────────────────
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

/** "2026-09-19" — 캘린더/URL 쿼리용 날짜 키(Asia/Seoul 기준). */
export function dateKey(input: string | Date): string {
  const { year, month, day } = seoulParts(input);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** "9월 19일" — 타임라인 그룹 헤더. */
export function formatMonthDay(input: string | Date): string {
  const { month, day } = seoulParts(input);
  return `${month}월 ${day}일`;
}

/** "토요일" — 타임라인 그룹 헤더 보조. */
export function formatWeekdayFull(input: string | Date): string {
  const { weekdayKo } = seoulParts(input);
  return `${weekdayKo}요일`;
}

/** "오전 10시" / "오후 3시 30분". */
export function formatTimeOfDay(input: string | Date): string {
  const { hour24, minute } = seoulParts(input);
  const ampm = hour24 < 12 ? "오전" : "오후";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return minute > 0 ? `${ampm} ${hour12}시 ${minute}분` : `${ampm} ${hour12}시`;
}

/** "오전 10시 – 오후 12시" — 시작·종료가 같은 날일 때. */
export function formatTimeRange(startAt: string, endAt: string): string {
  return `${formatTimeOfDay(startAt)} – ${formatTimeOfDay(endAt)}`;
}

export function feeLabel(fee: number | null): string {
  if (fee === null) return "참가비 문의";
  if (fee === 0) return "무료";
  return `${fee.toLocaleString("ko-KR")}원`;
}

/** 사이드바 통계 — 전부 BOOKCLUBS + joinedCounts에서 계산, 하드코딩 없음. */
export function computeStats(clubs: BookClub[], joinedCounts: Record<string, number>) {
  const now = new Date();
  const held = clubs.filter((c) => new Date(c.startAt).getTime() <= now.getTime());
  const totalSessions = held.length;
  const totalPeople = clubs.reduce((sum, c) => sum + (joinedCounts[c.slug] ?? 0), 0);
  const totalBooks = new Set(clubs.filter((c) => !c.isTentative).map((c) => c.bookTitle)).size;
  return { totalSessions, totalPeople, totalBooks };
}
