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

export const BOOKCLUB_SESSIONS: BookClubSession[] = [
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
