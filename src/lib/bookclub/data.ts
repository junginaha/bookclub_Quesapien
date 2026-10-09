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
  lat: 37.5039551, // OSM Nominatim · 강남대로 465 교보타워
  lng: 127.0240401,
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
  lat: 37.5105088, // OSM Nominatim · 논현로 636 이디야커피랩
  lng: 127.0326807,
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
    id: "by-the-sea-gurnah",
    slug: "by-the-sea-gurnah",
    title: "누구나 책수다 · 『바닷가에서』",
    bookTitle: "바닷가에서",
    author: "압둘라자크 구르나",
    startsAt: "2026-10-27T19:00:00+09:00",
    endsAt: "2026-10-27T21:00:00+09:00",
    venue: CAFE_SINAMON,
    capacity: 1,
    reserved: 0,
    registrationClosed: true,
    fee: 0,
    feeLabelOverride: "별도 안내",
    leadQuestion: "고향을 떠난 뒤에도 우리는 어디까지 그곳의 사람일까요?",
    summary: "영어를 꽤 잘하면서 한마디도 못 하는 척하는 노인이 주인공입니다. 이쯤 되면 궁금해지실 거예요.\n10월 27일 저녁, 카페시나몬에서 압둘라자크 구르나의 『바닷가에서』를 함께 읽어요.\n지금은 자리가 다 찼고, 대기 신청을 받고 있어요.",
    bookIntro: "결론부터 말하면, 거짓말 하나로 시작해 서로의 이야기를 듣는 일로 끝나는 소설입니다. 잔지바르에서 온 노인 살레 오마르는 영국 공항에 내려 영어를 모르는 척합니다. 그런데 하필 통역을 부탁받고 연락이 닿은 사람이, 오래전 원한으로 얽힌 집안의 아들이에요. 세상은 넓다는데 소설 속 세상은 늘 이렇게 좁습니다. 두 사람이 같은 과거를 전혀 다르게 기억한다는 사실이 드러나면서, 망명과 이주, 기억과 소속이라는 커다란 주제가 아주 사적인 대화 안으로 들어옵니다. 2021년 노벨문학상 수상 작가 구르나의 장편이고, 한국어판은 2022년 문학동네 세계문학전집 210번으로 나왔습니다.",
    bookSourceUrl: "https://www.yes24.com/product/goods/109367120",
    bookSourceLabel: "YES24 · 문학동네 도서정보",
    agendaPreview: [
      "고향을 떠난 뒤에도 우리는 어디까지 그곳의 사람일까요?",
      "같은 과거를 두 사람이 전혀 다르게 기억할 때, 무엇을 진실이라고 부를 수 있을까요?",
      "타인의 이야기를 듣는 일은 실제로 화해의 시작이 될 수 있을까요?"
    ],
  },
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
    summary: "체호프는 의사였고, 그래서인지 등장인물을 심판하지 않고 진찰합니다. 바람난 사람조차도요.\n9월 22일 저녁, 카페시나몬에서 단편 선집 『사랑과 욕망의 변주곡』을 함께 읽어요.\n지금은 자리가 다 찼고, 대기 신청을 받고 있어요.",
    bookIntro: "한 줄로 말하면, 사랑 때문에 곤란해진 사람들에 관한 단편 16편입니다. 『사랑에 대하여』와 『개를 데리고 다니는 부인』처럼, 인물들은 이미 결혼했거나 이미 지루하거나, 곧잘 둘 다입니다. 보통의 작가라면 여기서 누가 나쁜지 알려줄 텐데, 체호프는 끝까지 알려주지 않아요. 대신 일상의 타성과 관계의 의무 사이에서 흔들리는 사람들을 아주 가까이서, 조금 안쓰럽게 보여줍니다. 읽고 나면 남의 연애를 쉽게 판단하던 버릇이 살짝 머쓱해집니다.",
    bookSourceUrl: "https://www.ptlib.go.kr/intro/menu/10045/program/30015/plusSearchResultDetail.do?bookKey=1102959829&currentPageNo=1&preSearchKey=ALL&preSearchKeyword=%EC%95%84%EB%9E%8C&publishFormCode=BO&reSearchYn=N&recKey=1102959827&searchCategory=NONBOOK&searchKdc=1&searchKey=ALL&searchKeyword=%EC%95%84%EB%9E%8C&searchOrder=DESC&searchRecordCount=10&searchSort=SIMILAR&searchType=SIMPLE&viewStatus=IMAGE",
    bookSourceLabel: "평택시도서관 도서정보",
    agendaPreview: ["욕망은 우리를 더 솔직하게 만들까요, 더 자기기만하게 만들까요?","체호프는 인물의 일탈을 왜 쉽게 심판하지 않을까요?","『사랑에 대하여』와 『개를 데리고 다니는 부인』에서 사랑과 의무의 충돌은 어떻게 달라지나요?"],
  },
  {
    id: "glass-bead-game",
    slug: "glass-bead-game",
    title: "고전문학 & 벽돌책깨기 · 『유리알 유희』",
    bookTitle: "유리알 유희",
    author: "헤르만 헤세",
    coverUrl: "/images/covers/glass-bead-game.webp",
    startsAt: "2026-10-11T15:00:00+09:00",
    endsAt: "2026-10-11T17:30:00+09:00",
    venue: DAEWOO_UTOPIA_OFFICETEL,
    capacity: 1,
    reserved: 0,
    registrationClosed: true,
    fee: 0,
    feeLabelOverride: "별도 안내",
    leadQuestion: "지성과 삶은 어디에서 만나고, 어디에서 서로를 놓칠까요?",
    summary: "헤세는 세상에서 가장 지적인 게임을 상상해 놓고, 그 규칙은 끝내 알려주지 않았습니다. 그래서 같이 읽어야 합니다.\n10월 11일 오후, 벽돌책은 혼자 깨면 외롭고 같이 깨면 조금 덜 무겁습니다.\n지금은 자리가 다 찼고, 대기 신청을 받고 있어요.",
    bookIntro: "요약하면, 세상에서 제일 똑똑한 사람들만 모인 곳에서 최고가 된 남자가 결국 그곳을 떠나는 이야기입니다. 무대는 먼 미래의 학문 공동체 카스탈리엔. 이곳 사람들은 음악과 수학, 철학을 한 판의 게임 안에서 엮는 ‘유리알 유희’에 인생을 겁니다. 주인공 요제프 크네히트는 이 유희의 명인 자리에 오르지만, 담장 밖 현실이 자꾸 마음에 걸립니다. 지식은 세상과 떨어져 있을수록 순수해질까요, 아니면 쓸모를 잃을까요? 헤세는 1931년에 쓰기 시작해 제2차 세계대전 한가운데서 이 책을 완성했습니다. 세상이 무너지는 동안 가장 고요한 세계를 그린 셈이에요. 책이 나오고 3년 뒤, 그는 노벨문학상을 받았습니다.",
    bookSourceUrl: "https://openlibrary.org/books/OL19694118M/The_glass_bead_game",
    bookSourceLabel: "Open Library · 1943년 초판 정보",
    agendaPreview: ["완벽하게 정제된 지식은 현실과 멀어질수록 더 가치 있어질까요?","크네히트가 카스탈리엔 밖의 삶을 의식하기 시작한 이유는 무엇일까요?","지식인의 자유와 사회적 책임은 어디에서 충돌할까요?"],
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
    summary: "방금 내린 판단, 사실 당신이 아니라 당신 머릿속의 성급한 동료가 내렸을지도 모릅니다.\n11월 8일 오후, 대니얼 카너먼의 『생각에 관한 생각』을 함께 읽어요. 두껍지만 읽는 내내 뜨끔해서 졸 틈이 없습니다.\n지금은 자리가 다 찼고, 대기 신청을 받고 있어요.",
    bookIntro: "핵심은 간단합니다. 우리 머릿속에는 빠르고 자신만만한 생각과, 느리고 귀찮아하는 생각이 함께 삽니다. 문제는 대부분의 결정을 앞의 녀석이 내리고, 뒤의 녀석은 그럴듯한 이유만 나중에 붙인다는 거예요. 심리학자로서 노벨경제학상을 받은 카너먼은 수많은 실험으로 휴리스틱, 편향, 과신, 손실회피가 우리의 선택에 얼마나 태연하게 끼어드는지 보여줍니다. 다 읽고 나면 ‘나는 합리적인 사람’이라는 말을 조금 작은 목소리로 하게 됩니다.",
    bookSourceUrl: "https://us.macmillan.com/books/9780374275631/thinkingfastandslow/",
    bookSourceLabel: "Farrar, Straus and Giroux · 공식 도서정보",
    agendaPreview: ["내가 ‘직감’이라고 믿는 판단은 언제 유용하고 언제 위험할까요?","틀렸다는 증거가 있어도 첫 판단을 고수하는 이유는 무엇일까요?","내 결정에서 가장 자주 작동하는 편향 하나를 찾는다면 무엇일까요?"],
  },

  {
    id: "dangerous-leaders",
    slug: "dangerous-leaders",
    title: "위험한 리더는 어떻게 만들어지는가 북토크",
    bookTitle: "불통, 독단, 야망",
    author: "스티브 테일러",
    startsAt: "2026-09-19T10:00:00+09:00",
    endsAt: "2026-09-19T12:00:00+09:00",
    venue: EPISODE_GANGNAM_262,
    capacity: 15,
    reserved: 0,
    fee: 20000,
    leadQuestion: "",
    summary:
      "좋은 자리는 사람을 바꿉니다. 안타깝게도 대개 나쁜 쪽으로요.\n그 변화는 뉴스 속 먼 나라가 아니라 회의실과 단톡방, 우리가 말없이 고개를 끄덕이는 순간에 일어납니다.\n\n스티브 테일러의 『불통, 독단, 야망』을 사이에 두고 물어봅니다.\n권력은 왜 사람을 귀 닫게 만드는지, 나는 어떤 리더 곁에 서고 싶은지.\n회사 이야기가 조금 나와도 괜찮아요. 아마 많이 나올 겁니다.",
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
      "형을 잃은 남자가 미국에서 가장 큰 미술관의 경비원이 됐습니다. 그리고 10년 동안 그림 앞에 서서, 아주 천천히 괜찮아졌습니다.\n\n깊어지는 가을, 상실과 회복에 대해 이야기 나눠요.\n슬픔을 지나온 분도, 지나는 중인 분도, 그 곁에 있고 싶은 분도 환영합니다.\n조용한 책이에요. 조용한 책이 원래 제일 오래 남습니다.",
    agendaPreview: [],
  },
  {
    id: "money-interview-author",
    slug: "money-interview-author",
    title: "『돈의 면접』 작가와의 만남",
    bookTitle: "돈의 면접",
    author: "박은규",
    coverUrl: "/images/covers/money-interview-author.webp",
    startsAt: "2026-10-17T14:00:00+09:00",
    endsAt: "2026-10-17T16:00:00+09:00",
    venue: KYOBO_GANGNAM,
    capacity: 20,
    reserved: 0,
    fee: 0,
    leadQuestion: "책에는 다 담지 못한 돈과 삶의 이야기를 작가에게 직접 묻습니다.",
    summary:
      "책에 다 쓰지 못한 돈 이야기를, 쓴 사람에게 직접 물어볼 수 있는 날입니다.\n10월 17일 오후, 교보문고 강남점에서 『돈의 면접』 박은규 작가를 만나요. 출간의 기쁨도, 책 밖의 뒷이야기도 함께 나눕니다.\n처음 오셔도 괜찮아요. 질문 하나만 들고 오시면 됩니다.",
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
      "누구의 반쪽도 아닌, 온전한 한 사람으로 사는 법을 브런치 먹으며 이야기합니다.\n곁들일 책은 쿤데라의 『참을 수 없는 존재의 가벼움』. 제목은 무겁지만 대화는 가벼워도 됩니다.\n싱글이거나, 사실상 싱글인 가을의 사람들을 기다려요.",
    agendaPreview: [],
  },
  {
    id: "notebooklm-workshop",
    slug: "notebooklm-workshop",
    title: "『노트북LM 완전정복』 강신범 작가 직강",
    bookTitle: "노트북LM 완전정복",
    author: "강신범",
    coverUrl: "/images/covers/notebooklm-workshop.webp",
    startsAt: "2026-10-31T14:00:00+09:00",
    endsAt: "2026-10-31T17:00:00+09:00",
    venue: EDIYA_LAB,
    capacity: 20,
    reserved: 0,
    fee: 30000,
    leadQuestion: "‘언젠가 써야지’ 모아둔 자료를 오늘 실제 결과물로 바꿀 수 있을까요?",
    summary:
      "‘언젠가 정리해야지’ 쌓아 둔 자료를, 오늘 오후 안에 진짜 초안으로 바꿉니다.\n현직 개발자인 강신범 작가와 함께 내 기록을 글이나 기획안으로 직접 만들어 봐요.\n전자책이 포함되고, 이디야랩 메뉴 할인도 있어요.",
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
      "민주주의는 쿠데타보다 박수 속에서 더 자주 무너진다는 책을, 하필 광복절 아침에 폈습니다.\n토요일 열 시, 에피소드 강남 262. 커피 향이 도는 테이블에 여덟 명이 둘러앉았어요.\n\n81년 전 누군가 되찾은 것을 우리는 지금 어떻게 지키고 있는지, 두 시간 동안 그 질문에 머물렀습니다.\n두 시간을 이렇게 보내고 나면, 같은 뉴스도 조금 다르게 보이기 마련입니다.",
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
      "노벨문학상까지 받은 철학자가 90여 년 전에 진지하게 주장했습니다. 우리는 일을 너무 많이 한다고요.\n투표에서 가장 많은 표를 받은 책이었고, 그날 우리는 꽤 성실하게 게으름을 옹호했습니다.",
    agendaPreview: [],
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
    summary: "그림 앞에서 잠깐 멈췄을 뿐인데, 그게 나를 위한 시간이었다는 걸 알게 된 날.\n정여울 작가의 『오직 나를 위한 미술관』과 함께한 아침이었어요.",
    agendaPreview: [],
  },
];

export function getSession(slug: string): BookClubSession | undefined {
  return BOOKCLUB_SESSIONS.find((s) => s.slug === slug);
}
