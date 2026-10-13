// "당신을 기다리는 북클럽" — 지난 모임 중 다시 열 가치가 있는 책을 큐레이션해
// 대기 명단으로 올려두고, ENCORE_THRESHOLD(5명)가 모이면 새 일정을 연다.
//
// - kind "encore": 이미 열었던 북클럽(sessionSlug가 BOOKCLUB_SESSIONS의 지난 모임).
// - kind "new":    새로 기획한 북클럽. 일정 없이 먼저 공개하고 5명이 모이면 출발.
//   (새 기획은 운영자가 확정한 책·설명이 생기면 이 배열에 추가한다 — 추측으로 채우지 않는다.)
//
// 대기 명단은 bookclub_waitlist 테이블에 club_slug = "encore:<id>"로 저장한다.
// 일반 모임의 정원 초과 대기자(club_slug = 세션 slug)와 섞이지 않게 접두사로 구분한다.
// 발제는 책마다 5개만, 대화가 실제로 열리는 순서(가볍게 → 깊게 → 나에게로)로 엄선했다.

import { BOOKCLUB_SESSIONS } from "./data";
import type { BookClubSession } from "./types";

export const WAITING_SLUG_PREFIX = "encore:";

export interface WaitingClub {
  id: string;
  kind: "encore" | "new";
  sessionSlug?: string; // kind "encore"일 때 원래 모임 slug
  bookTitle: string;
  author: string;
  pitch: string; // 왜 이 책을 다시/새로 여는지 — 한 문장
  questions: [string, string, string, string, string];
}

export const WAITING_CLUBS: WaitingClub[] = [
  {
    id: "democracies-die",
    kind: "encore",
    sessionSlug: "democracies-die",
    bookTitle: "어떻게 민주주의는 무너지는가",
    author: "스티븐 레비츠키 · 대니얼 지블랫",
    pitch: "광복절 아침에 펼쳤던 책. 같은 뉴스가 다르게 보이기 시작하는 두 시간.",
    questions: [
      "반대편을 상대가 아니라 적으로 보기 시작하면 어떤 일이 생길까요?",
      "법을 지키면서도 민주주의를 약하게 만들 수 있을까요?",
      "저자들이 말하는 ‘상호 관용’과 ‘제도적 자제’ 중 지금 우리에게 더 부족한 것은 무엇일까요?",
      "정당은 왜 위험한 인물을 걸러내는 문지기 역할에 실패할까요?",
      "우리는 지금 어떤 위험 신호를 놓치고 있을까요?",
    ],
  },
  {
    id: "praise-of-idleness",
    kind: "encore",
    sessionSlug: "praise-of-idleness",
    bookTitle: "게으름에 대한 찬양",
    author: "버트런드 러셀",
    pitch: "투표에서 가장 많은 표를 받았던 책. 성실하게 게으름을 옹호해 보는 시간.",
    questions: [
      "러셀은 하루 네 시간 노동이면 충분하다고 했습니다. 90여 년이 지난 지금, 우리는 왜 여전히 바쁠까요?",
      "‘일은 미덕’이라는 믿음은 누구에게 가장 이로웠을까요?",
      "여가가 생기면 우리는 정말 더 나은 것을 할까요?",
      "나는 언제 ‘게으르다’는 죄책감을 느끼나요?",
      "쓸모없어 보이지만 내 삶을 지켜준 일은 무엇인가요?",
    ],
  },
  {
    id: "glass-bead-game",
    kind: "encore",
    sessionSlug: "glass-bead-game",
    bookTitle: "유리알 유희",
    author: "헤르만 헤세",
    pitch: "헤세의 마지막 장편. 지성과 삶이 어디서 만나고 어디서 어긋나는지 묻는 책.",
    questions: [
      "완벽하게 정제된 지식은 현실과 멀어질수록 더 가치 있어질까요?",
      "크네히트는 왜 유희의 명인 자리를 내려놓고 카스탈리엔 밖으로 나갔을까요?",
      "카스탈리엔이 역사와 정치를 멀리한 것은 순수함일까요, 책임 회피일까요?",
      "크네히트와 데시뇨리, 두 사람 중 누구의 삶이 더 온전했다고 생각하나요?",
      "내 삶에도 아름답지만 세상과 떨어진 ‘유리알 유희’가 있나요?",
    ],
  },
  {
    id: "chekhov-love-desire",
    kind: "encore",
    sessionSlug: "chekhov-love-desire",
    bookTitle: "사랑과 욕망의 변주곡",
    author: "안톤 체호프",
    pitch: "심판하지 않는 작가, 체호프. 사랑과 의무 사이에서 흔들리는 사람들의 이야기.",
    questions: [
      "『개를 데리고 다니는 부인』의 구로프는 언제부터 진짜 사랑을 시작했다고 보나요?",
      "『사랑에 대하여』의 알료힌은 왜 끝내 고백하지 못했을까요?",
      "체호프는 인물의 일탈을 왜 쉽게 심판하지 않을까요?",
      "욕망은 우리를 더 솔직하게 만들까요, 더 자기기만하게 만들까요?",
      "열린 결말로 끝난 이야기의 다음 장면을 쓴다면, 어떻게 쓰고 싶나요?",
    ],
  },
  {
    id: "dangerous-leaders",
    kind: "encore",
    sessionSlug: "dangerous-leaders",
    bookTitle: "불통, 독단, 야망",
    author: "스티브 테일러",
    pitch: "왜 위험한 사람이 권력을 잡는지, 그리고 우리는 왜 그를 따르는지 묻는 책.",
    questions: [
      "공감이 부족한 사람이 왜 오히려 권력의 자리에 쉽게 오를까요?",
      "리더의 ‘자신감’과 ‘독단’은 어떻게 구별할 수 있을까요?",
      "위험한 리더를 만드는 것은 그 개인일까요, 그를 따르는 사람들일까요?",
      "내가 속한 조직에서 ‘불통’은 어떤 모습으로 나타나나요?",
      "연결과 공감을 회복하는 일은 개인의 몫일까요, 제도의 몫일까요?",
    ],
  },
  {
    id: "museum-for-me",
    kind: "encore",
    sessionSlug: "museum-for-me",
    bookTitle: "오직 나를 위한 미술관",
    author: "정여울",
    pitch: "그림 앞에서 잠깐 멈추는 일이 나를 위한 시간이 되는 아침.",
    questions: [
      "오래 기억에 남은 그림 한 점이 있다면, 그 그림은 왜 나를 붙잡았을까요?",
      "그림 앞에서 느끼는 ‘감상’과 ‘위로’는 어떻게 다를까요?",
      "미술관이 아닌 일상에서 나를 멈추게 하는 장면은 무엇인가요?",
      "다른 사람의 해석 없이 그림을 본다는 것이 가능할까요?",
      "지금의 나에게 꼭 필요한 그림 한 점을 고른다면 무엇인가요?",
    ],
  },
];

export function waitlistKey(club: WaitingClub): string {
  return WAITING_SLUG_PREFIX + club.id;
}

export function getWaitingClub(id: string): WaitingClub | undefined {
  return WAITING_CLUBS.find((club) => club.id === id);
}

/** "encore:<id>" 형태의 대기 명단 키를 검증한다. */
export function isWaitingKey(key: string): boolean {
  return key.startsWith(WAITING_SLUG_PREFIX) && !!getWaitingClub(key.slice(WAITING_SLUG_PREFIX.length));
}

/** 원래 모임 정보(표지·장소 기록 등) — encore만 해당. */
export function originalSession(club: WaitingClub): BookClubSession | undefined {
  return club.sessionSlug ? BOOKCLUB_SESSIONS.find((s) => s.slug === club.sessionSlug) : undefined;
}
