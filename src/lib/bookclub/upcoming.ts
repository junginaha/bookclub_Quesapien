// 오픈 예정 북모임 — 북토크 투표 후보(2026-10 잼잼 북클럽 회원 추천 + 운영자 서가 추가분).
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
  isbn?: string; // ISBN-13 — 표지 검색을 정확히 맞추기 위한 값(있으면 제목 검색보다 우선)
  genre: "소설" | "인문" | "사회" | "심리" | "에세이" | "역사";
  pitch: string; // 카드용 한 줄 소개(추천 사유를 바탕으로, 수치·후기 창작 금지)
  /**
   * 북토크가 열리는 달 — "YYYY-MM". 2026~2027 북토크 포스터(운영자 제공 2026-10-30)로
   * **달까지만** 확정된 책에 붙인다. 포스터 자체가 "도서별 북토크 일정과 장소는 추후
   * 안내합니다"라고 적고 있으므로, 날짜·장소·정원은 여기에 없다 — 그것이 정해지면
   * BOOKCLUB_SESSIONS로 옮기고 이 책을 목록에서 지운다.
   */
  scheduledMonth?: string;
}

/** "2026-11" → "2026년 11월". 형식이 어긋나면 빈 문자열(화면에 아무것도 쓰지 않는다). */
export function formatScheduledMonth(month?: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(month ?? "");
  return m ? `${m[1]}년 ${Number(m[2])}월` : "";
}

export const UPCOMING_BOOKS: UpcomingBook[] = [
  {
    slug: "next-small-things-like-these",
    scheduledMonth: "2026-11",
    bookTitle: "이처럼 사소한 것들",
    author: "클레어 키건",
    isbn: "9791130646381",
    genre: "소설",
    pitch: "부커상 최종후보에 오른 소설 가운데 가장 짧은 작품. 번역본 120쪽, 한 번에 읽고 오래 이야기하기 좋은 책.",
  },
  {
    slug: "next-east-of-eden",
    scheduledMonth: "2027-06",
    bookTitle: "에덴의 동쪽",
    author: "존 스타인벡",
    isbn: "9788937461811",
    genre: "소설",
    pitch: "10월 넷플릭스 시리즈로 공개된 원작. 두 세대에 걸친 형제 이야기로 선택과 자유의지를 묻는 고전.",
  },
  {
    slug: "next-captains-of-the-wreck",
    bookTitle: "난파선의 선장들",
    author: "김새섬·김진경",
    publisher: "어크로스",
    isbn: "9791167743312",
    genre: "에세이",
    pitch: "삶이 얼마 남지 않았음을 아는 저자가 서울과 취리히를 오가며 나눈 216일간의 책 대화.",
  },
  {
    slug: "next-homo-deus",
    scheduledMonth: "2027-05",
    bookTitle: "호모 데우스",
    author: "유발 하라리",
    translator: "김명주",
    publisher: "김영사",
    isbn: "9788934977841",
    genre: "인문",
    pitch: "굶주림·역병·전쟁을 넘어선 인류가 다음에 무엇을 원하게 될지 묻는 책. 『사피엔스』 다음 이야기.",
  },
  {
    slug: "next-technofeudalism",
    bookTitle: "테크노퓨달리즘",
    author: "야니스 바루파키스",
    translator: "노정태",
    publisher: "21세기북스",
    isbn: "9791171177943",
    genre: "사회",
    pitch: "클라우드와 알고리즘을 쥔 새로운 지배 계급의 탄생. 우리가 매일 쓰는 플랫폼을 다시 보게 되는 책.",
  },
  {
    slug: "next-scarcity",
    scheduledMonth: "2027-03",
    bookTitle: "결핍은 우리를 어떻게 변화시키는가",
    author: "센딜 멀레이너선·엘다 샤퍼",
    translator: "이경식",
    isbn: "9791192999739",
    genre: "심리",
    pitch: "시간이든 돈이든 부족할 때 우리의 선택과 행동이 어떻게 달라지는지 보여주는 행동경제학 책.",
  },
  {
    slug: "next-youth-reading",
    scheduledMonth: "2026-12",
    bookTitle: "청춘의 독서",
    author: "유시민",
    publisher: "웅진지식하우스",
    isbn: "9788901294742",
    genre: "인문",
    pitch: "『맹자』 『사기』 『자유론』 『역사란 무엇인가』 『대위의 딸』까지, 세상을 바꾼 고전을 다시 읽는 독서 에세이.",
  },
  {
    slug: "next-gracian-reading-people",
    bookTitle: "그라시안의 사람을 읽는 눈",
    author: "발타자르 그라시안",
    translator: "김철 편역",
    publisher: "히읏",
    isbn: "9791192559957",
    genre: "인문",
    pitch: "착한 사람 증후군에서 벗어나고 싶다면. 17세기 스페인 예수회 신부가 남긴 사람과 관계에 관한 잠언.",
  },
  {
    slug: "next-snake-brain",
    scheduledMonth: "2027-04",
    bookTitle: "뱀의 뇌에게 말을 걸지 마라",
    author: "마크 고울스톤",
    translator: "황혜숙",
    publisher: "타임비즈",
    isbn: "9788963894966",
    genre: "심리",
    pitch: "경계심에 닫힌 상대에게 말이 닿지 않는 이유를 '3개의 뇌'로 설명하는 설득과 대화의 책.",
  },
  {
    slug: "next-comfort-crisis",
    scheduledMonth: "2027-01",
    bookTitle: "편안함의 습격",
    author: "마이클 이스터",
    translator: "김원진",
    publisher: "수오서재",
    isbn: "9791193238691",
    genre: "인문",
    pitch: "알래스카 오지에서 33일을 보낸 저자가 묻는다. 너무 편해진 삶이 오히려 우리를 지치게 하는 건 아닐까.",
  },
  {
    slug: "next-seven-meanings-in-life",
    bookTitle: "인생의 의미",
    author: "토마스 힐란드 에릭센",
    translator: "이영래",
    publisher: "더퀘스트",
    isbn: "9791140710690",
    genre: "인문",
    pitch: "관계·결핍·꿈·느린 시간·순간·균형·실 끊기, 인류학자가 꼽은 일곱 가지 삶의 의미.",
  },
  {
    slug: "next-cutoff-society",
    scheduledMonth: "2027-02",
    bookTitle: "손절사회",
    author: "이승연",
    publisher: "어크로스",
    isbn: "9791167742827",
    genre: "사회",
    pitch: "불편한 관계는 끊는 게 답일까. '손절'이 자기 보호의 언어가 된 시대를 들여다보는 책.",
  },
  {
    slug: "next-walden",
    bookTitle: "월든",
    author: "헨리 데이비드 소로우",
    translator: "강승영",
    publisher: "은행나무",
    isbn: "9788956605418",
    genre: "에세이",
    pitch: "월든 호숫가 오두막에서 보낸 2년여의 기록. 덜 갖고 더 깊이 사는 법을 묻는 고전.",
  },
  {
    slug: "next-the-wager",
    bookTitle: "웨이저",
    author: "데이비드 그랜",
    translator: "김승욱",
    publisher: "프시케의숲",
    isbn: "9791189336899",
    genre: "역사",
    pitch: "1741년 파타고니아 앞바다에서 난파한 영국 군함 웨이저호. 무인도에 갇힌 사람들의 실화로 인간 본성을 묻는다.",
  },
  {
    slug: "next-psychology-of-money",
    bookTitle: "돈의 심리학",
    author: "모건 하우절",
    translator: "이지연",
    publisher: "인플루엔셜",
    isbn: "9791168343443",
    genre: "심리",
    pitch: "부는 지능보다 태도에서 나온다. 돈을 대하는 사람의 심리를 20개의 이야기로 풀어낸 책.",
  },
  {
    slug: "next-extinction-of-experience",
    bookTitle: "경험의 멸종",
    author: "크리스틴 로젠",
    translator: "이영래",
    publisher: "어크로스",
    isbn: "9791167742063",
    genre: "사회",
    pitch: "마주 앉은 대화, 손글씨, 기다림. 기술이 대신하면서 사라져 가는 경험들과 그 의미를 짚는 책.",
  },
  {
    slug: "next-saving-baghdad-zoo",
    bookTitle: "바그다드 동물원 구하기",
    author: "로렌스 앤서니·그레이엄 스펜스",
    translator: "고상숙",
    publisher: "뜨인돌",
    isbn: "9788958077046", // 예스24 goods/70772365(개정판 2019-03, 뜨인돌) 확인 — 리디 표기 9788958077398은 오기
    genre: "에세이",
    pitch: "이라크 전쟁 한복판, 굶주린 동물들을 살리러 바그다드로 들어간 한 남자의 실화.",
  },
];

export const UPCOMING_GENRES = ["전체", "소설", "인문", "사회", "심리", "역사", "에세이"] as const;

export function getUpcomingBook(slug: string): UpcomingBook | undefined {
  return UPCOMING_BOOKS.find((b) => b.slug === slug);
}
