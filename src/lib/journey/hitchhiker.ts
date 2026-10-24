// 2026→2027 은하수 히치하이커 독서여행 — 단일 콘텐츠 출처.
// 공지는 publishAt(Asia/Seoul) 이전에는 본문을 서버에서 아예 내보내지 않는다.
// 일시·장소·참가비가 확정되기 전에는 Event 스키마·예약 확정 문구를 만들지 않는다.

export const JOURNEY_SLUG = "2026-2027-hitchhiker";
export const JOURNEY_PATH = `/reading-journey/${JOURNEY_SLUG}`;

export type InterestKind = "journey" | "quiet";

export interface JourneyNotice {
  id: string;
  order: number;
  label: string; // "공지 1"
  publishAt: string; // ISO + KST offset
  publishLabel: string; // "2026년 10월"
  title: string;
  body: string[]; // 문단 배열(문단 내 줄바꿈은 \n)
  cta: { label: string; kind: InterestKind } | null;
}

export const JOURNEY = {
  title: "2026→2027 은하수 히치하이커 독서여행",
  headline: "2026년의 끝, 지구를 잠시 떠나볼까요?",
  sub: "2026년에 출발해 2027년에 돌아오는\n4개월간의 특별한 독서 여행.",
  period: "2026.12.12 → 2027.03",
  periodLong: "2026년 12월 12일 → 2027년 3월",
  departure: "2026-12-12",
  // 운영자가 일시·장소·참가비를 확정하면 true로 바꾸고 정식 신청을 연다.
  scheduleConfirmed: false,
  status: "추천·모집 중",
  book: {
    title: "은하수를 여행하는 히치하이커를 위한 안내서",
    originalTitle: "The Hitchhiker's Guide to the Galaxy",
    author: "더글러스 애덤스",
    authorEn: "Douglas Adams",
    firstPublished: "1979",
    note: "원작 장편 다섯 편과 단편 한 편이 수록된 합본으로도, 낱권으로도 읽을 수 있습니다.",
  },
  philosophy: [
    "완독 경쟁보다 독서의 즐거움.",
    "지식 자랑보다 좋은 질문.",
    "말해야 하는 모임보다 함께 있어도 편한 모임.",
  ],
  audience: ["기존 북클럽 회원", "새로운 독서 참여자", "SF를 처음 읽는 사람", "지적인 유머와 철학적 질문을 좋아하는 사람"],
};

/** 로드맵은 '예정' — 공지 1에서 이미 공개된 출발일과 월별 범위만 담는다. */
export const ROADMAP = [
  { month: "12월", range: "1권", theme: "낯선 우주에 적응하기", original: "The Hitchhiker's Guide to the Galaxy (1979)" },
  { month: "1월", range: "2권", theme: "우주의 끝에서 새해 맞이하기", original: "The Restaurant at the End of the Universe (1980)" },
  { month: "2월", range: "3권 · 4권", theme: "삶과 우주와 모든 것", original: "Life, the Universe and Everything (1982) · So Long, and Thanks for All the Fish (1984)" },
  { month: "3월", range: "5권 · 단편", theme: "마지막 여행과 종합 북토크", original: "Mostly Harmless (1992) · Young Zaphod Plays It Safe" },
];

export const NOTICES: JourneyNotice[] = [
  {
    id: "notice-1",
    order: 1,
    label: "공지 1",
    publishAt: "2026-10-01T00:00:00+09:00",
    publishLabel: "2026년 10월",
    title: "2026년의 끝, 지구를 잠시 떠나볼까요?",
    body: [
      "AI는 점점 똑똑해지고,\n세상은 점점 복잡해지고,\n인간은 여전히 내일 점심 메뉴도 결정하지 못합니다.",
      "이럴 때 필요한 건 어쩌면 우주여행일지도 모르겠습니다.",
      "어느 날 지구가 우주 고속도로 건설 때문에\n철거된다는 황당한 소설.",
      "그런데 삶과 우주의 궁극적인 답이\n'42'라니요?",
      "더글러스 애덤스의\n《은하수를 여행하는 히치하이커를 위한 안내서》.",
      "웃다가 생각하고,\n생각하다가 다시 웃게 되는 작품입니다.",
      "2026년을 돌아보고\n2027년을 함께 맞이하는\n4개월간의 독서 여행을 제안합니다.",
      "12월 12일,\n우리 함께 출발할까요?",
    ],
    cta: { label: "독서여행 참여 의향 남기기", kind: "journey" },
  },
  {
    id: "notice-2",
    order: 2,
    label: "공지 2",
    publishAt: "2026-11-01T00:00:00+09:00",
    publishLabel: "2026년 11월",
    title: "아무 말도 하지 않는 북클럽을 엽니다.",
    body: [
      "북클럽에 왔는데\n아무 말도 하지 않아도 된다니.",
      "인류가 드디어 꽤 괜찮은 모임을\n발명한 것 같습니다.",
      "이 책은 원작 장편 다섯 편과\n단편 한 편이 수록된 합본으로도 읽을 수 있습니다.",
      "하루 만에 전부 이야기하기에는\n우주가 조금 넓습니다.",
      "그래서 정식 토론에 앞서\n한두 차례 조용히 책만 읽는 시간을\n마련하려 합니다.",
      "책을 가져옵니다.\n편한 자리에 앉습니다.\n읽습니다.\n그리고 집에 갑니다.",
      "독후감도 발표도 없습니다.\n얼마나 읽었는지 검사하지도 않습니다.",
      "책을 읽다가 웃음이 터지는 것까지\n금지하지는 않겠습니다.",
      "혼자 읽되, 혼자가 아닌 시간.",
      "우리의 우주여행은\n이렇게 조용하게 시작됩니다.",
    ],
    cta: { label: "조용히 읽는 모임에 관심 표시", kind: "quiet" },
  },
  {
    id: "notice-3",
    order: 3,
    label: "공지 3",
    publishAt: "2026-12-01T00:00:00+09:00",
    publishLabel: "2026년 12월 초",
    title: "2027년으로 가는 히치하이커를 모집합니다.",
    body: [
      "우주의 모든 것에 관한 답은\n42라는데,",
      "우리는 아직 질문도\n제대로 정하지 못했습니다.",
      "괜찮습니다.\n그것부터 함께 찾아보죠.",
      "2026년 12월 12일부터\n2027년 3월까지.",
      "우리는 더글러스 애덤스와 함께\n약 4개월 동안 은하수를 여행합니다.",
      "12월:\n1권. 낯선 우주에 적응하기.",
      "1월:\n2권. 우주의 끝에서 새해 맞이하기.",
      "2월:\n3권과 4권. 삶과 우주와 모든 것.",
      "3월:\n5권과 단편. 마지막 여행과 종합 북토크.",
      "중간중간 조용히 함께 읽는 시간도 마련합니다.",
      "완독 경쟁도 독서 시험도 없습니다.",
      "각자의 속도로 읽고,\n함께 발견한 질문을 나누면 됩니다.",
      "2027년을 맞이하는 방법은 많겠지만,\n우주를 여행하며 맞이하는 새해는\n꽤 근사할 것 같습니다.",
      "당황하지 마세요.\n수건을 챙기세요.\n질문을 잃지 마세요.",
    ],
    // 정식 신청은 scheduleConfirmed=true 이후에만 '독서여행 참여하기'로 연다.
    cta: { label: "독서여행 참여하기", kind: "journey" },
  },
];

export const FAQ = [
  { question: "SF를 처음 읽어도 되나요?", answer: "네. 우주에 대한 전문지식 없이 참여할 수 있습니다." },
  { question: "합본을 꼭 구매해야 하나요?", answer: "아닙니다. 해당 작품을 읽을 수 있는 낱권이나 합본 모두 가능합니다." },
  { question: "반드시 완독해야 하나요?", answer: "완독을 권장하지만 참여 조건으로 강제하지 않습니다." },
  { question: "조용히 읽는 모임은 무엇인가요?", answer: "발표나 토론 없이 각자 책을 읽는 모임입니다." },
];

export function isPublished(notice: JourneyNotice, now: Date = new Date()): boolean {
  return now.getTime() >= Date.parse(notice.publishAt);
}

/** 서버에서만 호출 — 미공개 공지는 본문을 제거한 껍데기만 남긴다. */
export function noticesForNow(now: Date = new Date()) {
  return NOTICES.map((n) =>
    isPublished(n, now)
      ? { ...n, published: true as const }
      : { id: n.id, order: n.order, label: n.label, publishLabel: n.publishLabel, published: false as const }
  );
}
export type NoticeView = ReturnType<typeof noticesForNow>[number];
