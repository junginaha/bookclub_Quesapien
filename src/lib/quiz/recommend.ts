/**
 * 북 MBTI 결과 → 추천 도서.
 *
 * 예전에는 결과 화면에 **존재하지 않는 책 12권**이 "추천 북클럽"으로 떠 있었고
 * (「다정함의 발명」·「흐린 날의 사유」·「도시의 올랜 해」 등, 우리 데이터와 대조해
 * 0/12), 링크는 전부 홈으로 가서 거기엔 그 책이 하나도 없었다. 그 필드를 지우고
 * **실제로 우리가 가진 책**만 건다.
 *
 * 고른 근거는 유형 설명과 각 책의 실제 장르·소개글이다(운영자 확인 2026-10-30):
 *  - 시인형(감성·문장에 머묾)   → 소설/에세이. 짧은 소설, 호숫가 2년, 216일의 대화
 *  - 탐구자형(철학·구조 이해)   → 전부 인문. 인류의 다음 질문, 사고의 구조, 삶의 의미
 *  - 탐험가형(장르 불문)       → 역사·사회·에세이·인문이 섞이도록
 *  - 연결자형(사람·관계)       → 전부 관계·소통이 주제
 *
 * 책이 '오픈 예정'에서 '열리는 모임'으로 옮겨가면 슬러그가 바뀌므로, 슬러그로 못
 * 찾으면 **제목으로 한 번 더** 찾는다. 그래도 없으면 그 칸은 조용히 뺀다 —
 * 목록에서 사라진 책을 화면에 남겨두지 않는다.
 */
import type { BookMBTI } from "@/lib/supabase/types";
import { BOOKCLUB_SESSIONS } from "@/lib/bookclub/data";
import { UPCOMING_BOOKS } from "@/lib/bookclub/upcoming";
import { getStatus } from "@/lib/bookclub/selectors";

export interface QuizPick {
  title: string;
  /** 지은이 · 상태 — 제목 아래 작은 줄 */
  sub: string;
  href: string;
}

/** 유형별 추천 — 값은 등록 당시의 슬러그다(바뀌면 제목으로 찾는다). */
const PICKS: Record<BookMBTI, { slug: string; title: string }[]> = {
  POET: [
    { slug: "next-small-things-like-these", title: "이처럼 사소한 것들" },
    { slug: "next-walden", title: "월든" },
    { slug: "next-captains-of-the-wreck", title: "난파선의 선장들" },
    { slug: "met-guard", title: "나는 메트로폴리탄 미술관의 경비원입니다" },
  ],
  SAGE: [
    { slug: "next-homo-deus", title: "호모 데우스" },
    { slug: "thinking-fast-slow", title: "생각에 관한 생각" },
    { slug: "next-seven-meanings-in-life", title: "인생의 의미" },
    { slug: "glass-bead-game", title: "유리알 유희" },
  ],
  SEEKER: [
    { slug: "next-the-wager", title: "웨이저" },
    { slug: "next-technofeudalism", title: "테크노퓨달리즘" },
    { slug: "next-saving-baghdad-zoo", title: "바그다드 동물원 구하기" },
    { slug: "next-comfort-crisis", title: "편안함의 습격" },
  ],
  BRIDGE: [
    { slug: "next-cutoff-society", title: "손절사회" },
    { slug: "next-extinction-of-experience", title: "경험의 멸종" },
    { slug: "next-snake-brain", title: "뱀의 뇌에게 말을 걸지 마라" },
    { slug: "next-gracian-reading-people", title: "그라시안의 사람을 읽는 눈" },
  ],
};

function resolve(ref: { slug: string; title: string }): QuizPick | null {
  // 1) 열리는·지난 모임 — 모임이 잡혀 있으면 그쪽이 먼저다(바로 예약할 수 있다).
  const session =
    BOOKCLUB_SESSIONS.find((s) => s.slug === ref.slug) ??
    BOOKCLUB_SESSIONS.find((s) => s.bookTitle === ref.title);
  if (session) {
    const past = getStatus(session) === "past";
    return {
      title: session.bookTitle,
      sub: [session.author, past ? "지난 북클럽" : "열리는 북클럽"].filter(Boolean).join(" · "),
      href: `/bookclub/${session.slug}`,
    };
  }
  // 2) 아직 일정이 없는 후보 도서 — 홈의 그 카드로 보낸다(섹션이 아니라 카드 앵커).
  const book =
    UPCOMING_BOOKS.find((b) => b.slug === ref.slug) ??
    UPCOMING_BOOKS.find((b) => b.bookTitle === ref.title);
  if (book) {
    return {
      title: book.bookTitle,
      sub: [book.author || "저자 확인 중", book.genre].filter(Boolean).join(" · "),
      href: `/#${book.slug}`,
    };
  }
  // 3) 목록에서 사라진 책 — 화면에 남기지 않는다.
  return null;
}

export function picksFor(type: BookMBTI): QuizPick[] {
  return (PICKS[type] ?? []).map(resolve).filter((p): p is QuizPick => p !== null);
}
