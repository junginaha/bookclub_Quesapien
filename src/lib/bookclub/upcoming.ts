// 오픈 예정 북모임 — 북토크 투표 후보(2026-10 잼잼 북클럽 회원 추천).
// 날짜·장소·정원이 아직 없으므로 BOOKCLUB_SESSIONS(일정 확정 세션)와 분리해 둔다.
// 투표로 선정되면 해당 책을 BOOKCLUB_SESSIONS로 옮기고 여기서 지운다.
// "읽고 싶어요"는 bookclub_waitlist에 club_slug=아래 slug로 저장된다(관심 인원 집계용).
//
// 서지 출처: 회원이 올린 표지 사진·메시지, 교보문고·YES24·알라딘 검색으로 확인한 값만 적었다.
// 확인하지 못한 값은 빈 문자열 + TODO(unicorn).

export interface UpcomingBook {
  slug: string; // 영문, "next-" 접두 — 일정 세션 slug와 겹치지 않게
  bookTitle: string;
  author: string; // 미확인이면 빈 문자열
  translator?: string;
  publisher?: string;
  genre: "소설" | "인문" | "사회" | "심리" | "에세이";
  pitch: string; // 카드용 한 줄 소개(추천 사유를 바탕으로, 수치·후기 창작 금지)
}

export const UPCOMING_BOOKS: UpcomingBook[] = [
  {
    slug: "next-small-things-like-these",
    bookTitle: "이처럼 사소한 것들",
    author: "클레어 키건",
    genre: "소설",
    pitch: "부커상 최종후보에 오른 소설 가운데 가장 짧은 작품. 번역본 120쪽, 한 번에 읽고 오래 이야기하기 좋은 책.",
  },
  {
    slug: "next-east-of-eden",
    bookTitle: "에덴의 동쪽",
    author: "존 스타인벡",
    genre: "소설",
    pitch: "넷플릭스 시리즈로 만나기 전에 원작부터. 두 세대에 걸친 형제 이야기로 선택과 자유의지를 묻는 고전.",
  },
  {
    slug: "next-captains-of-the-wreck",
    bookTitle: "난파선의 선장들",
    author: "김새섬·김진경",
    publisher: "어크로스",
    genre: "에세이",
    pitch: "삶이 얼마 남지 않았음을 아는 저자가 서울과 취리히를 오가며 나눈 216일간의 책 대화.",
  },
  {
    slug: "next-homo-deus",
    bookTitle: "호모 데우스",
    author: "유발 하라리",
    genre: "인문",
    pitch: "굶주림·역병·전쟁을 넘어선 인류가 다음에 무엇을 원하게 될지 묻는 책. 『사피엔스』 다음 이야기.",
  },
  {
    slug: "next-technofeudalism",
    bookTitle: "테크노퓨달리즘",
    author: "야니스 바루파키스",
    translator: "노정태",
    publisher: "21세기북스",
    genre: "사회",
    pitch: "클라우드와 알고리즘을 쥔 새로운 지배 계급의 탄생. 우리가 매일 쓰는 플랫폼을 다시 보게 되는 책.",
  },
  {
    slug: "next-scarcity",
    bookTitle: "결핍은 우리를 어떻게 변화시키는가",
    author: "센딜 멀레이너선·엘다 샤퍼",
    translator: "이경식",
    genre: "심리",
    pitch: "시간이든 돈이든 부족할 때 우리의 선택과 행동이 어떻게 달라지는지 보여주는 행동경제학 책.",
  },
  {
    slug: "next-youth-reading",
    bookTitle: "청춘의 독서",
    author: "유시민",
    genre: "인문",
    pitch: "『맹자』 『사기』 『자유론』 『역사란 무엇인가』 『대위의 딸』까지, 세상을 바꾼 고전을 다시 읽는 독서 에세이.",
  },
  {
    slug: "next-gracian-reading-people",
    bookTitle: "그라시안의 사람을 읽는 눈",
    author: "발타자르 그라시안",
    genre: "인문",
    pitch: "17세기 스페인 수도사가 남긴 처세의 잠언. 사람을 알아보고 관계를 지키는 오래된 지혜.",
  },
  {
    slug: "next-snake-brain",
    bookTitle: "뱀의 뇌에게 말을 걸지 마라",
    author: "마크 고울스톤",
    translator: "황혜숙",
    publisher: "타임비즈",
    genre: "심리",
    pitch: "경계심에 닫힌 상대에게 말이 닿지 않는 이유를 '3개의 뇌'로 설명하는 설득과 대화의 책.",
  },
  {
    slug: "next-good-person-syndrome",
    bookTitle: "착한 사람 증후군에서 벗어나세요",
    author: "", // TODO(unicorn): 추천자에게 저자·출판사 확인 — 서점 검색에서 동일 제목 미확인
    genre: "심리",
    pitch: "거절하지 못하고 남의 기대에 맞추느라 지친 마음을 돌아보는 책.",
  },
];

export const UPCOMING_GENRES = ["전체", "소설", "인문", "사회", "심리", "에세이"] as const;

export function getUpcomingBook(slug: string): UpcomingBook | undefined {
  return UPCOMING_BOOKS.find((b) => b.slug === slug);
}
