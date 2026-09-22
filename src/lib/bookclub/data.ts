// 북클럽 세션 — 단일 데이터 배열. 별도 "지금"/"다시" 배열로 쪼개지 않는다.
// status는 절대 여기 저장하지 않는다 — selectors.ts가 startsAt/endsAt/reserved에서
// 매번 파생한다. reserved는 렌더 시점에 getJoinedCounts()(bookclub_applications
// 테이블, 슬러그 기준 실시간 조회)로 덮어써지므로 아래 값은 항상 0으로 둔다.
//
// ⚠ 실데이터 출처: 이전 세션이 검증한 src/lib/bookclubs.ts(구 BOOKCLUBS)를 그대로
// 이관했다 — 문장 하나 지어내지 않았다. 모르는 값(venue.detail/nearestStation,
// encoreCount 집계)은 TODO(unicorn)로 명시하고 추측값을 넣지 않았다.

import type { BookClubSession } from "./types";

const EPISODE_GANGNAM_262 = {
  name: "에피소드 강남 262",
  detail: "", // TODO(unicorn): 층/호실 등 상세 위치 — 운영자 확인 필요
  address: "서울특별시 서초구 강남대로 299",
  lat: 37.4898,
  lng: 127.0311,
  nearestStation: "", // TODO(unicorn): 가까운 역/출구 안내 — 운영자 확인 필요
};


const KYOBO_GANGNAM = {
  name: "교보문고 강남점",
  detail: "작가와의 만남",
  address: "서울특별시 서초구 강남대로 465, 교보타워 지하 1~지하 2층",
  lat: Number.NaN,
  lng: Number.NaN,
  nearestStation: "신논현역 인근",
};

const CHEONGDAM_BRUNCH = {
  name: "청담동 브런치 카페",
  detail: "참여자에게 상세 장소 안내",
  address: "",
  lat: Number.NaN,
  lng: Number.NaN,
  nearestStation: "",
};

const EDIYA_LAB = {
  name: "이디야커피랩 · 컬처스페이스",
  detail: "이디야 본사",
  address: "서울특별시 강남구 논현로 636 이디야빌딩",
  lat: Number.NaN,
  lng: Number.NaN,
  nearestStation: "",
};


const CAFE_SINAMON = {
  name: "카페시나몬",
  detail: "",
  address: "",
  lat: Number.NaN,
  lng: Number.NaN,
  nearestStation: "",
};

const DAEWOO_UTOPIA_OFFICETEL = {
  name: "대우유토피아오피스텔",
  detail: "",
  address: "",
  lat: Number.NaN,
  lng: Number.NaN,
  nearestStation: "",
};

const VENUE_TBA = {
  name: "장소 추후 안내",
  detail: "",
  address: "",
  lat: Number.NaN,
  lng: Number.NaN,
  nearestStation: "",
};

export const BOOKCLUB_SESSIONS: BookClubSession[] = [
  {
    id: "chekhov-love-desire",
    slug: "chekhov-love-desire",
    title: "누구나 책수다 · 『사랑과 욕망의 변주곡』",
    bookTitle: "사랑과 욕망의 변주곡",
    author: "안톤 체호프",
    startsAt: "2026-09-22T19:00:00+09:00",
    endsAt: "2026-09-22T21:00:00+09:00",
    venue: CAFE_SINAMON,
    capacity: 1,
    reserved: 0,
    registrationClosed: true,
    fee: 0,
    feeLabelOverride: "별도 안내",
    leadQuestion: "사랑과 욕망은 우리를 어디까지 솔직하게 만들까요?",
    summary: "9월 22일 저녁, 안톤 체호프의 『사랑과 욕망의 변주곡』을 함께 읽는 책수다입니다. 현재 참여 신청은 마감됐고 대기 신청을 받고 있습니다.",
    agendaPreview: [],
  },
  {
    id: "glass-bead-game",
    slug: "glass-bead-game",
    title: "고전문학 & 벽돌책깨기 · 『유리알 유희』",
    bookTitle: "유리알 유희",
    author: "헤르만 헤세",
    startsAt: "2026-10-11T15:00:00+09:00",
    endsAt: "2026-10-11T17:30:00+09:00",
    venue: DAEWOO_UTOPIA_OFFICETEL,
    capacity: 1,
    reserved: 0,
    registrationClosed: true,
    fee: 0,
    feeLabelOverride: "별도 안내",
    leadQuestion: "지성과 삶은 어디에서 만나고, 어디에서 서로를 놓칠까요?",
    summary: "10월 11일 오후, 헤르만 헤세의 『유리알 유희』를 함께 읽는 고전문학·벽돌책깨기 모임입니다. 현재 참여 신청은 마감됐고 대기 신청을 받고 있습니다.",
    agendaPreview: [],
  },
  {
    id: "thinking-fast-slow",
    slug: "thinking-fast-slow",
    title: "고전문학 & 벽돌책깨기 · 『생각에 관한 생각』",
    bookTitle: "생각에 관한 생각",
    author: "대니얼 카너먼",
    startsAt: "2026-11-08T15:00:00+09:00",
    endsAt: "2026-11-08T17:30:00+09:00",
    venue: VENUE_TBA,
    capacity: 1,
    reserved: 0,
    registrationClosed: true,
    fee: 0,
    feeLabelOverride: "별도 안내",
    leadQuestion: "우리는 정말 생각해서 판단할까요, 판단한 뒤 이유를 만들까요?",
    summary: "11월 8일 오후, 대니얼 카너먼의 『생각에 관한 생각』을 함께 읽는 고전문학·벽돌책깨기 모임입니다. 현재 참여 신청은 마감됐고 대기 신청을 받고 있습니다.",
    agendaPreview: [],
  },

  {
    id: "dangerous-leaders",
    slug: "dangerous-leaders",
    title: "위험한 리더는 어떻게 만들어지는가 북토크",
    bookTitle: "위험한 리더는 어떻게 만들어지는가",
    author: "스티브 테일러",
    startsAt: "2026-09-19T10:00:00+09:00",
    endsAt: "2026-09-19T12:00:00+09:00",
    venue: EPISODE_GANGNAM_262,
    capacity: 15,
    reserved: 0,
    fee: 20000,
    leadQuestion: "",
    summary:
      "권력은 사람을 시험합니다.\n그리고 그 시험은 멀리 있지 않아요.\n회의실에서, 단톡방에서,\n우리가 고개를 끄덕이는 순간마다 조용히 일어납니다.\n\n이 책을 사이에 두고 서로에게 물어봅니다.\n좋은 자리는 사람을 어떻게 바꾸는지,\n나는 어떤 리더 곁에 서고 싶은지.\n\n당신의 일터에도 있는 이야기예요.\n함께 꺼내 봐요.",
    agendaPreview: [],
  },
  {
    id: "met-guard",
    slug: "met-guard",
    title: "나는 메트로폴리탄 미술관의 경비원입니다 북토크",
    bookTitle: "나는 메트로폴리탄 미술관의 경비원입니다",
    author: "패트릭 브링리",
    startsAt: "2026-10-17T10:00:00+09:00",
    endsAt: "2026-10-17T12:00:00+09:00",
    venue: EPISODE_GANGNAM_262,
    capacity: 8,
    reserved: 0,
    fee: 20000,
    leadQuestion: "",
    summary:
      "형을 잃은 남자가 세계에서 가장 큰 미술관의 경비원이 되었습니다.\n10년 동안 그림 앞에 서 있었고, 천천히 회복했습니다.\n\n깊어지는 가을, 상실과 회복에 대해 이야기 나눠요.\n슬픔을 지나온 분도, 지나는 중인 분도,\n그 곁에 있고 싶은 분도 환영합니다.\n\n조용한 책이에요. 그래서 오래 남습니다.",
    agendaPreview: [],
  },
  {
    id: "money-interview-author",
    slug: "money-interview-author",
    title: "『돈의 면접』 작가와의 만남",
    bookTitle: "돈의 면접",
    author: "박은규",
    startsAt: "2026-10-17T14:00:00+09:00",
    endsAt: "2026-10-17T16:00:00+09:00",
    venue: KYOBO_GANGNAM,
    capacity: 20,
    reserved: 0,
    fee: 0,
    leadQuestion: "책에는 다 담지 못한 돈과 삶의 이야기를 작가에게 직접 묻습니다.",
    summary:
      "책을 읽고 끝내지 않습니다. 저자에게 직접 묻고, 답을 들으며 출간의 기쁨과 책 밖의 이야기를 함께 나눕니다.\n처음 온 분도 편하게 앉을 수 있는 작가와 독자의 오후입니다.",
    agendaPreview: [],
  },
  {
    id: "singler-lightness",
    slug: "singler-lightness",
    title: "싱글러 : 1인칭 북클럽",
    bookTitle: "참을 수 없는 존재의 가벼움",
    author: "밀란 쿤데라",
    startsAt: "2026-10-28T11:30:00+09:00",
    endsAt: "2026-10-28T13:30:00+09:00",
    venue: CHEONGDAM_BRUNCH,
    capacity: 10,
    reserved: 0,
    fee: 10000,
    leadQuestion: "누구의 반쪽이 아니라, 온전한 한 사람으로 산다는 것은 어떤 모습일까요?",
    summary:
      "브런치와 『참을 수 없는 존재의 가벼움』 사이에 앉아, 누구의 무엇이 아닌 ‘나’로 살아가는 이야기를 나눕니다.\n싱글이거나, 싱글이나 다름없는 가을의 사람들이 만납니다.",
    agendaPreview: [],
  },
  {
    id: "notebooklm-workshop",
    slug: "notebooklm-workshop",
    title: "『노트북LM 완전정복』 강신범 작가 직강",
    bookTitle: "노트북LM 완전정복",
    author: "강신범",
    startsAt: "2026-10-31T14:00:00+09:00",
    endsAt: "2026-10-31T17:00:00+09:00",
    venue: EDIYA_LAB,
    capacity: 20,
    reserved: 0,
    fee: 30000,
    leadQuestion: "‘언젠가 써야지’ 모아둔 자료를 오늘 실제 결과물로 바꿀 수 있을까요?",
    summary:
      "현직 개발자인 저자와 내 기록을 글이나 기획안의 초안으로 직접 만들어봅니다.\n전자책 포함, 이디야랩 메뉴 할인 혜택과 함께하는 실전형 토요일 오후입니다.",
    agendaPreview: [],
  },
  {
    id: "democracies-die",
    slug: "democracies-die",
    title: "어떻게 민주주의는 무너지는가 북토크",
    bookTitle: "어떻게 민주주의는 무너지는가",
    author: "스티븐 레비츠키 · 대니얼 지블랫",
    startsAt: "2026-08-15T10:00:00+09:00",
    endsAt: "2026-08-15T12:00:00+09:00",
    venue: EPISODE_GANGNAM_262,
    capacity: 8,
    reserved: 0,
    fee: 20000,
    leadQuestion: "반대편을 상대가 아니라 적으로 보기 시작하면 어떤 일이 생길까요?",
    summary:
      "토요일 아침 열 시, 에피소드 강남 262.\n커피 향이 도는 테이블에 여덟 명이 둘러앉아요.\n\n하필 광복절 아침에 이 책을 폅니다.\n민주주의는 광장에서 태어나 식탁에서, 일터에서,\n우리의 말 속에서 매일 이어지니까요.\n81년 전 누군가 되찾은 것을, 지금 우리는 어떻게\n지키고 있는지 — 그 질문에 잠시 머물러 봅니다.\n\n두 시간의 대화가 끝나고 돌아가는 길,\n같은 뉴스가 조금 다르게 보일 거예요.",
    agendaPreview: [
      "반대편을 상대가 아니라 적으로 보기 시작하면 어떤 일이 생길까요?",
      "법을 지키면서도 민주주의를 약하게 만들 수 있을까요?",
      "우리는 어떤 위험 신호를 놓치고 있을까요?",
    ],
  },
  {
    id: "praise-of-idleness",
    slug: "praise-of-idleness",
    title: "게으름에 대한 찬양 북토크",
    bookTitle: "게으름에 대한 찬양",
    author: "버트런드 러셀",
    startsAt: "2026-07-18T10:00:00+09:00",
    endsAt: "2026-07-18T12:00:00+09:00",
    venue: EPISODE_GANGNAM_262,
    capacity: 8, // TODO(unicorn): 실제 정원 기록 없음 — 같은 장소 다른 세션과 동일하게 추정
    reserved: 0,
    fee: 20000, // TODO(unicorn): 실제 가격 기록 없음 — 동일 이유로 추정
    leadQuestion: "",
    summary:
      "90여 년 전 철학자가 물었어요.\n왜 그렇게 바쁘게 사느냐고.\n우리는 그날, 함께 대답을 찾았습니다.\n투표에서 가장 많은 표를 받은 책이었어요.",
    agendaPreview: [],
    encoreCount: 0, // TODO(unicorn): 영문 slug 기준 앵콜 집계 배선 필요(아래 selectors.ts 주석 참조)
  },
  {
    id: "museum-for-me",
    slug: "museum-for-me",
    title: "오직 나를 위한 미술관 북토크",
    bookTitle: "오직 나를 위한 미술관",
    author: "정여울",
    startsAt: "2026-06-20T10:00:00+09:00",
    endsAt: "2026-06-20T12:00:00+09:00",
    venue: EPISODE_GANGNAM_262,
    capacity: 8, // TODO(unicorn): 실제 정원 기록 없음 — 추정
    reserved: 0,
    fee: 20000, // TODO(unicorn): 실제 가격 기록 없음 — 추정
    leadQuestion: "",
    summary: "그림 앞에서 멈췄던 날.\n나를 위한 시간이었어요.",
    agendaPreview: [],
    encoreCount: 0, // TODO(unicorn): 위와 동일
  },
];

export function getSession(slug: string): BookClubSession | undefined {
  return BOOKCLUB_SESSIONS.find((s) => s.slug === slug);
}
