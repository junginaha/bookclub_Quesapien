// 북클럽(landing_book_clubs) 공용 타입·분류·정렬 유틸리티.
// 리스트(/bookclub)·상세(/bookclub/[slug])·홈(LandingPage)가 전부 이 파일을 거쳐
// 같은 레코드 모양·같은 분류 규칙을 쓴다 — 페이지마다 다른 하드코딩 데이터셋을 만들지 않는다.

import { ALL_CLUBS } from "./clubsData";

export const DEFAULT_ENCORE_THRESHOLD = 8;

export const CLUB_COLOR_MAP: Record<string, string> = {
  navy: "#1B2536", cream: "#8B7A5E", rust: "#9B4A2E",
  olive: "#5C6B3A", dusk: "#4A5568", sage: "#7A9E7E",
  terra: "#8B5E3C", smoke: "#6B7280", mauve: "#7E6B8F",
  fog: "#9CA3AF", ochre: "#C68B2B", ink: "#1C1F26",
};

export const AREA_OPTIONS = [
  "강남·서초",
  "마포·홍대",
  "종로·광화문",
  "성수·건대",
  "온라인",
  "지역 무관",
] as const;

export const TIME_OPTIONS = [
  "평일 저녁",
  "토요일 오전",
  "토요일 오후",
  "일요일 오전",
  "일요일 오후",
  "시간 무관",
] as const;

export const INTENT_OPTIONS = [
  "일정이 맞으면 참여",
  "우선 알림 희망",
  "가격 확인 후 결정",
] as const;

export interface SessionDate {
  date: string;
  topic: string;
  closed?: boolean;
}

export interface Review {
  id?: string;
  author_name: string;
  content: string;
  rating: number;
  created_at?: string;
}

// landing_book_clubs 행 그대로의 모양(snake_case) — DB에서 select("*")한 결과와
// 기존/신규 컬럼을 모두 아우른다. 신규 컬럼(event_starts_at 등)은 마이그레이션
// 적용 전에는 전부 undefined일 수 있으므로 전부 optional.
export interface BookClubRecord {
  id: string;
  slug: string;
  title: string;
  author?: string;
  author_hosts?: boolean; // 저자가 직접 진행하는가 (저자 직접 진행/저자와의 만남 배지)
  color?: string;
  genre?: string;
  tag?: string;
  recommender?: string;
  reason?: string;
  host_name?: string;
  host_intro?: string;
  host_philosophy?: string;
  host_books_read?: number;
  host_sessions_count?: number;
  host_rating?: number;
  description?: string;
  why_this_book?: string;
  key_questions?: string[];
  recommended_for?: string[];
  session_format?: string;
  emotion_tags?: string[];

  // 레거시 자유 텍스트 일정 (예: "2026년 6월 28일 (토) 오후 3시 — 5시 30분")
  schedule?: string;
  // 신규 구조화 일정 — 있으면 이 값을 우선 사용한다
  event_starts_at?: string;
  event_ends_at?: string;
  registration_closes_at?: string;

  location?: string;
  location_url?: string;
  area?: string;
  price?: number;

  join_url?: string;
  has_join_url?: boolean;

  max_participants?: number;
  current_participants?: number;
  session_dates?: SessionDate[];
  reviews?: Review[];
  photo_url?: string;
  lat?: number;
  lng?: number;

  status?: "active" | "upcoming" | "closed";
  sort_order?: number;
  is_mini?: boolean;

  // 앵콜
  encore_eligible?: boolean;
  encore_threshold?: number;
  encore_request_count?: number;
  archived_at?: string;

  // 시드(목업) 데이터 여부 — true면 실제 서비스 화면에서 숨긴다(삭제는 아님).
  is_seed?: boolean;
}

export type ClubView = "now" | "again";

// ─── Asia/Seoul 날짜 유틸 ──────────────────────────────────────
const WEEKDAY_FMT = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", weekday: "short" });

/** ISO/Date 값에서 요일을 파생한다 — 절대 요일 텍스트를 별도 저장하지 않는다. */
export function deriveWeekday(input: string | Date): string {
  return WEEKDAY_FMT.format(new Date(input));
}

function seoulNow(): Date {
  return new Date();
}

// "2026년 6월 28일 (토) 오후 3시" / "... 오후 3시 — 5시 30분" / "...– 5시 30분" 형태의
// 레거시 자유 텍스트를 파싱한다. 새 값을 지어내는 게 아니라 이미 저장된 문자열을
// 구조화된 날짜로 정규화하는 용도(신규 event_starts_at 컬럼이 비어 있는 기존 행 대응).
export function parseKoreanSchedule(schedule: string | undefined | null): { start: Date; end?: Date } | null {
  if (!schedule) return null;
  const m = schedule.match(
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일.*?(오전|오후)\s*(\d{1,2})시(?:\s*(\d{1,2})분)?/
  );
  if (!m) return null;
  const [, y, mo, d, ampm, h, min] = m;
  let hour = parseInt(h, 10) % 12;
  if (ampm === "오후") hour += 12;
  const start = new Date(
    `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T${String(hour).padStart(2, "0")}:${(min ?? "00").padStart(2, "0")}:00+09:00`
  );
  if (Number.isNaN(start.getTime())) return null;

  let end: Date | undefined;
  const endMatch = schedule.match(/[–—-]\s*(\d{1,2})시(?:\s*(\d{1,2})분)?/);
  if (endMatch) {
    const [, eh, emin] = endMatch;
    let endHour = parseInt(eh, 10) % 12;
    if (ampm === "오후" || parseInt(eh, 10) < parseInt(h, 10)) endHour += 12;
    const candidate = new Date(start);
    candidate.setHours(endHour, parseInt(emin ?? "0", 10), 0, 0);
    if (candidate.getTime() > start.getTime()) end = candidate;
  }
  return { start, end };
}

/** 신규 구조화 컬럼 우선, 없으면 레거시 텍스트를 파싱해서라도 시작 시각을 구한다. */
export function getEventStart(club: BookClubRecord): Date | null {
  if (club.event_starts_at) {
    const d = new Date(club.event_starts_at);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return parseKoreanSchedule(club.schedule)?.start ?? null;
}

export function getEventEnd(club: BookClubRecord): Date | null {
  if (club.event_ends_at) {
    const d = new Date(club.event_ends_at);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return parseKoreanSchedule(club.schedule)?.end ?? null;
}

/** 남은 자리 — 계산 불가능하면(값 없음/NaN/음수) null. 화면에서 null이면 자리 수를 표시하지 않는다. */
export function remainingSeats(club: BookClubRecord): number | null {
  const max = club.max_participants;
  const cur = club.current_participants;
  if (typeof max !== "number" || typeof cur !== "number" || !Number.isFinite(max) || !Number.isFinite(cur)) {
    return null;
  }
  const remaining = max - cur;
  if (!Number.isFinite(remaining)) return null;
  return Math.max(0, remaining);
}

export function isNearFull(club: BookClubRecord): boolean {
  const r = remainingSeats(club);
  return r !== null && r > 0 && r <= 3;
}

export function isFull(club: BookClubRecord): boolean {
  const r = remainingSeats(club);
  return r !== null && r <= 0;
}

/**
 * 지금 함께 읽어요 / 다시 함께 읽어요 분류.
 * - now: 공개 + 확정된 시작 시각이 현재 이후 + 신청 가능(정원 미달)
 * - again: 그 외 전부(과거 진행, 활성 일정 없음, 마감, 앵콜 대상) — 두 탭뿐이므로
 *   레코드를 절대 숨기지 않고 반드시 둘 중 하나로 분류한다.
 */
export function classifyClub(club: BookClubRecord, now: Date = seoulNow()): ClubView {
  const start = getEventStart(club);
  const full = isFull(club);
  if (!club.archived_at && start && start.getTime() > now.getTime() && !full && club.status !== "closed") {
    return "now";
  }
  return "again";
}

export function sortNow(a: BookClubRecord, b: BookClubRecord): number {
  const sa = getEventStart(a)?.getTime() ?? Infinity;
  const sb = getEventStart(b)?.getTime() ?? Infinity;
  if (sa !== sb) return sa - sb; // 1. 가까운 일정순
  const ra = remainingSeats(a) ?? Infinity;
  const rb = remainingSeats(b) ?? Infinity;
  return ra - rb; // 2. 남은 자리 적은 순 (마감 임박)
}

export function sortAgain(a: BookClubRecord, b: BookClubRecord): number {
  const ca = a.encore_request_count ?? 0;
  const cb = b.encore_request_count ?? 0;
  if (ca !== cb) return cb - ca; // 1. 앵콜 요청 많은 순
  return sortByRecent(a, b); // 2. 최근 진행순
}

/** 최근 진행순 단독 정렬 — "다시 함께 읽어요" 탭의 보조 정렬 옵션. */
export function sortByRecent(a: BookClubRecord, b: BookClubRecord): number {
  const sa = getEventStart(a)?.getTime() ?? 0;
  const sb = getEventStart(b)?.getTime() ?? 0;
  return sb - sa;
}

export function encoreCopy(count: number, threshold: number = DEFAULT_ENCORE_THRESHOLD): string {
  if (count <= 0) return "함께 읽을 사람들이 모이면 새 일정을 엽니다.";
  if (count >= threshold) return "함께 읽을 사람들이 모였습니다.\n새 일정을 준비하고 있어요.";
  return `현재 ${count}명이 기다리고 있어요.\n${threshold}명이 모이면 다시 열립니다.`;
}

// ─── 통합 폴백 데이터셋 ────────────────────────────────────────
// 예전에는 리스트 페이지(clubsData.ts)와 상세 페이지([slug]/page.tsx)가 서로 다른
// 정적 데이터셋을 각자 하드코딩하고 있어 목록/상세 값이 어긋날 수 있었다. 여기서
// ALL_CLUBS(리스트가 쓰던 30개)를 기준으로 하나의 BookClubRecord[]를 만들고,
// 그중 실데이터가 더 풍부했던 6개 슬러그에는 상세 페이지가 쓰던 후기·핵심질문·
// 진행자 소개 등을 그대로 병합한다. DB(landing_book_clubs)에 해당 슬러그 행이
// 있으면 항상 DB 값이 우선이고, 이 폴백은 DB에 없을 때만 쓰인다.
const DETAIL_ENRICHMENT: Record<string, Partial<BookClubRecord>> = {
  "다정함의-발명": {
    host_philosophy: "대화는 답을 찾는 과정이 아니라, 함께 머무는 과정입니다. 이 공간에서 당신은 옳은 대답을 할 필요가 없어요.",
    host_books_read: 28, host_sessions_count: 12, host_rating: 4.9,
    location_url: undefined,
    why_this_book: "사랑을 거창하게 생각해온 우리에게 필요한 책입니다. 거대한 로맨스보다 매일의 작은 행동들이 우리를 연결한다는 것을 이 책은 조용히, 하지만 분명하게 말합니다.",
    recommended_for: ["관계에서 지쳐 있는 분", "일상의 작은 것들을 놓치고 있는 분", "다정함이 무엇인지 다시 생각해보고 싶은 분"],
    session_format: "자유로운 원형 대화 / 질문 카드 방식 / 음료 제공 / 사진 촬영 가능",
    reviews: [
      { id: "r1", author_name: "채현", content: "처음으로 모르는 사람 앞에서 솔직한 대화를 했어요. 그 밤이 한 달 동안 저를 흔들고 있었습니다.", rating: 5, created_at: "2026-05-15" },
      { id: "r2", author_name: "진우", content: "리더 정해린님이 질문을 정말 잘 던지세요. 강요하지 않는데 자연스럽게 마음을 열게 됩니다.", rating: 5, created_at: "2026-05-16" },
      { id: "r3", author_name: "윤서", content: "다시 신청할 것 같아요. 2시간이 금방 지나갔고, 집에 오는 길에 오래 생각했습니다.", rating: 4, created_at: "2026-05-20" },
    ],
    area: "강남·서초",
  },
  "혼자라는-감각": {
    why_this_book: "고독을 결핍이 아니라 깊이로 다루는 책. 혼자 있는 것이 부끄럽지 않아진 첫 번째 모임입니다.",
    recommended_for: ["혼자 있는 시간이 불편한 분", "고독을 두려워하는 분", "내면의 소리를 듣고 싶은 분"],
    reviews: [{ id: "r4", author_name: "도연", content: "대답을 잘 하려 애쓰지 않게 된 첫 번째 자리였어요.", rating: 5, created_at: "2026-05-10" }],
    area: "마포·홍대",
  },
  "최신간-북토크": {
    why_this_book: "새로 출간된 책들 중 가장 뜨거운 문장들을 함께 읽습니다. 매 회 다른 책, 같은 깊이의 질문.",
    area: "강남·서초",
  },
  "아무도-보지-않는-오후": {
    why_this_book: "실패한 사람이 아니라 멈춰본 적 있는 사람의 문장. 번아웃 이후를 살아가는 법을 함께 이야기합니다.",
    area: "온라인",
  },
  "오늘-저녁-당신께": {
    why_this_book: "시집은 빠르게 읽지 않는 것이라고 가르쳐준 책. 한 줄의 시로 한 시간을 이야기하는 모임입니다.",
    area: "종로·광화문",
  },
  "인간이라는-풍경": {
    why_this_book: "인간을 풍경처럼 멀리서 바라보는 시선. 미워하던 사람을 다시 사람으로 보게 만드는 책을 함께 읽습니다.",
    area: "마포·홍대",
  },
};

function toFallbackRecord(c: (typeof ALL_CLUBS)[number]): BookClubRecord {
  const parsed = parseKoreanSchedule(c.schedule);
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    author: c.author,
    color: c.color,
    genre: c.genre,
    tag: c.tag,
    recommender: c.recommender,
    reason: c.reason,
    host_name: c.hostName,
    host_intro: c.hostIntro,
    description: c.description,
    key_questions: c.keyQuestions,
    emotion_tags: c.emotionTags,
    schedule: c.schedule,
    event_starts_at: parsed?.start.toISOString(),
    event_ends_at: parsed?.end?.toISOString(),
    location: c.location,
    max_participants: c.maxParticipants,
    current_participants: c.currentParticipants,
    status: c.status,
    lat: c.lat,
    lng: c.lng,
    ...DETAIL_ENRICHMENT[c.slug],
    is_seed: true, // ALL_CLUBS는 전부 목업 시드 데이터 — 실제 화면에서는 숨긴다.
  };
}

// ─── 실제 등록 북클럽(is_seed: false) ──────────────────────────
// 2026년 8~10월 실제 모임 3건 + 지난 실제 진행 2건. DB(landing_book_clubs)가
// 비어 있거나 접근 불가할 때 로컬/폴백 화면에도 실데이터가 보이도록 여기 유지한다.
// 운영자가 Supabase에 동일 내용을 실제 행으로도 등록해야 한다(마이그레이션 016 참고).
export const REAL_CLUBS: BookClubRecord[] = [
  {
    id: "real-202608-democracies-die",
    slug: "어떻게-민주주의는-무너지는가",
    title: "어떻게 민주주의는 무너지는가",
    author: "스티븐 레비츠키 · 대니얼 지블랫",
    color: "navy",
    genre: "POLITICAL SCIENCE",
    tag: "#정치 #사회",
    host_name: "루하",
    event_starts_at: "2026-08-15T10:00:00+09:00",
    location: "에피소드 강남 262",
    max_participants: 8,
    current_participants: 0,
    price: 20000,
    reason: "광복절 아침, 여덟 명이\n둘러앉아 묻습니다.\n\"우리는 무엇을 지키고 있을까.\"",
    description:
      "토요일 아침 열 시,\n에피소드 강남 262.\n커피 향이 도는 테이블에\n여덟 명이 둘러앉아요.\n\n하필 광복절 아침에\n이 책을 폅니다.\n민주주의는 광장에서 태어나\n식탁에서, 일터에서,\n우리의 말 속에서\n매일 이어지니까요.\n81년 전 누군가 되찾은 것을,\n지금 우리는 어떻게\n지키고 있는지 —\n그 질문에 잠시 머물러 봅니다.\n\n두 시간의 대화가 끝나고\n돌아가는 길,\n같은 뉴스가 조금 다르게\n보일 거예요.",
    recommended_for: [
      "요즘 뉴스가 자꾸 마음에 걸리는 분",
      "주말 아침을 근사하게 열고 싶은 분",
      "책 이야기 나눌 사람이 그리웠던 분",
    ],
    session_format: "준비물은 책, 그리고 질문 하나. 나머지는 저희가 전부 준비해 둘게요.",
    is_seed: false,
  },
  {
    id: "real-202609-dangerous-leaders",
    slug: "위험한-리더는-어떻게-만들어지는가",
    title: "위험한 리더는 어떻게 만들어지는가",
    author: "스티브 테일러",
    color: "rust",
    genre: "PSYCHOLOGY",
    tag: "#리더십 #심리",
    host_name: "서결",
    event_starts_at: "2026-09-19T10:00:00+09:00",
    location: "에피소드 강남 262",
    max_participants: 8,
    current_participants: 0,
    price: 20000,
    reason: "자리가 사람을 만들고,\n추종이 리더를 만듭니다.",
    description:
      "권력은 사람을 시험합니다.\n그리고 그 시험은\n멀리 있지 않아요.\n회의실에서, 단톡방에서,\n우리가 고개를 끄덕이는\n순간마다 조용히 일어납니다.\n\n이 책을 사이에 두고\n서로에게 물어봅니다.\n좋은 자리는 사람을\n어떻게 바꾸는지.\n나는 어떤 리더 곁에\n서고 싶은지.\n\n당신의 일터에도 있는\n이야기예요.\n함께 꺼내 봐요.",
    is_seed: false,
  },
  {
    id: "real-202610-met-guard",
    slug: "나는-메트로폴리탄-미술관의-경비원입니다",
    title: "나는 메트로폴리탄 미술관의 경비원입니다",
    author: "패트릭 브링리",
    color: "olive",
    genre: "MEMOIR",
    tag: "#상실 #회복",
    host_name: "온새",
    event_starts_at: "2026-10-17T10:00:00+09:00",
    location: "에피소드 강남 262",
    max_participants: 8,
    current_participants: 0,
    price: 20000,
    reason: "그림 앞에 서 있던\n10년의 기록.\n조용히, 오래 남는 책이에요.",
    description:
      "형을 잃은 남자가\n세계에서 가장 큰 미술관의\n경비원이 되었습니다.\n10년 동안 그림 앞에\n서 있었어요.\n그리고 천천히, 회복했습니다.\n\n깊어지는 가을,\n상실과 회복에 대해\n이야기 나눠요.\n슬픔을 지나온 분도,\n지나는 중인 분도,\n그 곁에 있고 싶은 분도\n환영합니다.\n\n조용한 책이에요.\n그래서 오래 남습니다.",
    is_seed: false,
  },
  // ── 지난 실제 진행 (다시 함께 읽어요) ──────────────────────────
  {
    id: "real-202606-museum-for-me",
    slug: "오직-나를-위한-미술관",
    title: "오직 나를 위한 미술관",
    author: "정여울",
    color: "dusk",
    event_starts_at: "2026-06-20T10:00:00+09:00",
    location: "에피소드 강남 262",
    reason: "그림 앞에서 멈췄던 날.\n나를 위한 시간이었어요.",
    description: "그림 앞에서 멈췄던 날.\n나를 위한 시간이었어요.",
    is_seed: false,
  },
  {
    id: "real-202607-praise-of-idleness",
    slug: "게으름에-대한-찬양",
    title: "게으름에 대한 찬양",
    author: "버트런드 러셀",
    color: "sage",
    event_starts_at: "2026-07-18T10:00:00+09:00",
    location: "에피소드 강남 262",
    reason: "90여 년 전 철학자가 물었어요.\n왜 그렇게 바쁘게 사느냐고.\n우리는 그날,\n함께 대답을 찾았습니다.\n투표에서 가장 많은 표를\n받은 책이었어요.",
    description: "90여 년 전 철학자가 물었어요.\n왜 그렇게 바쁘게 사느냐고.\n우리는 그날,\n함께 대답을 찾았습니다.\n투표에서 가장 많은 표를\n받은 책이었어요.",
    is_seed: false,
  },
];

export const FALLBACK_CLUBS: BookClubRecord[] = [...REAL_CLUBS, ...ALL_CLUBS.map(toFallbackRecord)];

export function getFallbackClub(slug: string): BookClubRecord | undefined {
  return FALLBACK_CLUBS.find((c) => c.slug === slug && !c.is_seed);
}

/** 시드(목업) 레코드를 걸러낸다 — 삭제가 아니라 노출만 차단(작업1). */
export function visibleClubs(records: BookClubRecord[]): BookClubRecord[] {
  return records.filter((c) => !c.is_seed);
}
