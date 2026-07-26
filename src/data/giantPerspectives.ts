/**
 * 관점카드 — 발제 생성기가 "거인의 시선" 질문 2개(지지 관점 1 + 비판/도전 관점 1)를
 * 고를 때 참조하는 사상가 로스터. src/data/giants.ts(87명 전수 목록)와는 별개로,
 * 이 발제 기능 전용으로 12명만 선별했다.
 *
 * 몽테뉴를 제외한 11명은 giants.ts에 이미 사망 70년 규칙 1차 스크리닝을 통과해
 * 등재된 인물이며, core_concepts/summary/key_works는 그 항목의 core_idea/key_works를
 * 발제 매칭에 쓰기 좋은 키워드 형태로 재정리한 것이다(사실관계 재검증 없이 요약만 변경).
 * 몽테뉴(1533–1592)는 사후 430년이 넘어 사망 70년 규칙과 무관하며, 신규로 추가했다.
 *
 * quotable=false인 인물은 발제 생성 시 직접 인용을 넣지 않는다 — 정확한 원문 확인이
 * 어려운 경우 사유 방식/개념만 활용하고 따옴표 인용은 만들지 않는다는 뜻이다.
 */

export type GiantStance = "support" | "critical";

export interface GiantPerspectiveCard {
  slug: string;
  name: string;
  core_concepts: string[];
  summary: string;
  fit_topics: string[];
  question_style: string;
  key_works: string[];
  sourced: boolean;
  quotable: boolean;
  quote?: string;
}

export const GIANT_PERSPECTIVES: GiantPerspectiveCard[] = [
  {
    slug: "socrates",
    name: "소크라테스",
    core_concepts: ["무지의 지", "산파술(대화법)", "자기 검토"],
    summary: "스스로 모른다는 것을 아는 데서 앎이 시작된다고 보고, 질문을 통해 상대가 스스로 전제를 검토하게 만든다.",
    fit_topics: ["앎과 무지", "자기 인식", "전제 검토", "정의란 무엇인가"],
    question_style: "결론을 주기보다 상대가 당연시하는 전제를 다시 캐묻는 질문",
    key_works: ["소크라테스의 변론(플라톤 기록)", "국가(플라톤 기록)"],
    sourced: true,
    quotable: true,
    quote: "검토되지 않은 삶은 살 가치가 없다.",
  },
  {
    slug: "plato",
    name: "플라톤",
    core_concepts: ["이데아", "현상과 실재의 구분", "이상 국가"],
    summary: "눈에 보이는 것 너머에 변치 않는 실재가 있다고 보고, 개인의 삶과 국가 질서 모두를 그 실재에 비추어 판단한다.",
    fit_topics: ["보이는 것과 실재", "이상과 현실의 간극", "제도 설계"],
    question_style: "지금 당연하게 받아들이는 것이 '진짜'인지, 더 나은 형태가 있는지 묻는 질문",
    key_works: ["국가", "향연", "파이돈"],
    sourced: true,
    quotable: false,
  },
  {
    slug: "aristotle",
    name: "아리스토텔레스",
    core_concepts: ["중용", "덕의 실천", "행복(에우다이모니아)"],
    summary: "행복을 감정이 아니라 덕을 반복해서 실천하는 상태로 보고, 극단이 아닌 중용에서 좋은 삶의 기준을 찾는다.",
    fit_topics: ["습관과 성격", "균형과 절제", "좋은 삶의 조건"],
    question_style: "지금의 선택이 반복되면 어떤 사람이 되는지, 균형점이 어디인지 묻는 질문",
    key_works: ["니코마코스 윤리학", "정치학"],
    sourced: true,
    quotable: true,
    quote: "우리는 선한 행동을 반복함으로써 선한 사람이 된다.",
  },
  {
    slug: "confucius",
    name: "공자",
    core_concepts: ["인(仁)", "예(禮)", "자기 수양과 관계 윤리"],
    summary: "도덕은 관계 속에서 완성된다고 보고, 자기 수양이 가족·사회·국가의 질서로 확장되어야 한다고 가르쳤다.",
    fit_topics: ["관계와 책임", "공동체 윤리", "세대 간 가치"],
    question_style: "지금의 문제를 나와 타인의 관계·역할 안에서 다시 묻는 질문",
    key_works: ["논어"],
    sourced: true,
    quotable: true,
    quote: "아는 것을 안다고 하고 모르는 것을 모른다고 하는 것, 이것이 앎이다.",
  },
  {
    slug: "laozi",
    name: "노자",
    core_concepts: ["무위자연", "부드러움의 힘", "비움의 쓸모"],
    summary: "억지로 통제하려는 힘보다 흐름을 따르는 부드러움이 더 오래간다고 보고, 채우기보다 비우는 데서 쓸모를 찾는다.",
    fit_topics: ["통제와 순응", "노력과 여백", "강함과 부드러움"],
    question_style: "애써 붙잡고 있는 것을 놓았을 때 무엇이 달라지는지 묻는 질문",
    key_works: ["도덕경"],
    sourced: true,
    quotable: true,
    quote: "위로 선한 것은 물과 같다. 물은 만물을 이롭게 하나 다투지 않는다.",
  },
  {
    slug: "montaigne",
    name: "몽테뉴",
    core_concepts: ["자기 회의(Que sais-je?)", "일상 속 성찰", "판단의 잠정성"],
    summary: "『에세(Essais)』에서 자신의 생각과 습관을 끊임없이 되짚으며, 어떤 판단도 최종적이지 않다는 태도로 삶을 관찰했다.",
    fit_topics: ["확신에 대한 회의", "일상의 관찰", "자기 자신을 아는 일"],
    question_style: "지금 확신하고 있는 것을 '정말 그런가?'라고 한 번 더 되묻는 질문",
    key_works: ["에세(수상록)"],
    sourced: true,
    quotable: true,
    quote: "Que sais-je?(나는 무엇을 아는가?)",
  },
  {
    slug: "immanuel-kant",
    name: "임마누엘 칸트",
    core_concepts: ["정언명령", "의무로서의 도덕", "이성의 보편 원칙"],
    summary: "도덕은 결과나 감정이 아니라 누구에게나 적용 가능한 원칙(정언명령)에서 나와야 한다고 봤다.",
    fit_topics: ["원칙과 예외", "의무와 감정의 충돌", "보편화 가능성"],
    question_style: "'모두가 이렇게 해도 괜찮은가'라는 기준으로 되돌려 묻는 질문",
    key_works: ["순수이성비판", "실천이성비판"],
    sourced: true,
    quotable: true,
    quote: "두 가지가 나를 경외심으로 가득 채운다: 내 위의 별이 가득한 하늘과 내 안의 도덕 법칙.",
  },
  {
    slug: "john-stuart-mill",
    name: "존 스튜어트 밀",
    core_concepts: ["공리주의", "최대 다수의 행복", "개인의 자유(해악 원칙)"],
    summary: "타인에게 해를 끼치지 않는 한 개인의 자유는 최대한 보장돼야 하며, 좋음은 결과로서의 행복의 총량으로 판단한다고 봤다.",
    fit_topics: ["자유의 한계", "다수와 소수의 이해 충돌", "결과로 옳고 그름을 재는 일"],
    question_style: "이 선택이 나 한 사람이 아니라 관련된 모두의 행복에 어떤 영향을 주는지 묻는 질문",
    key_works: ["자유론", "공리주의"],
    sourced: true,
    quotable: true,
    quote: "한 사람을 침묵시키는 것은 진리가 드러날 기회를 박탈하는 것이다.",
  },
  {
    slug: "soren-kierkegaard",
    name: "쇠렌 키르케고르",
    core_concepts: ["실존적 불안", "선택과 자유", "심미적·윤리적·종교적 삶의 단계"],
    summary: "인간은 선택 앞에서 불안을 느끼며, 그 불안이야말로 자유가 실재한다는 증거라고 봤다.",
    fit_topics: ["결단의 순간", "회피와 직면", "삶의 단계 전환"],
    question_style: "지금 미루고 있는 선택, 그 앞의 불안이 무엇을 말해주는지 묻는 질문",
    key_works: ["이것이냐 저것이냐", "불안의 개념"],
    sourced: true,
    quotable: true,
    quote: "삶은 앞으로 살아야 하지만 뒤를 돌아봐야만 이해된다.",
  },
  {
    slug: "fyodor-dostoevsky",
    name: "표도르 도스토옙스키",
    core_concepts: ["고통과 구원", "자유의지와 책임", "인간 내면의 어둠과 빛"],
    summary: "인간을 선악으로 단순화하지 않고, 고통을 통과하는 과정에서 드러나는 자유의지와 도덕적 책임을 소설로 파고들었다.",
    fit_topics: ["죄와 책임", "고통의 의미", "자유가 주는 무게"],
    question_style: "그 인물(혹은 나)이 짊어진 자유와 책임의 무게를 되짚는 질문",
    key_works: ["죄와 벌", "카라마조프의 형제들"],
    sourced: true,
    quotable: true,
    quote: "인간은 고통에 익숙해질 수 있다.",
  },
  {
    slug: "friedrich-nietzsche",
    name: "프리드리히 니체",
    core_concepts: ["가치의 창조", "초인(Übermensch)", "영원회귀"],
    summary: "주어진 가치를 그대로 따르기보다 스스로 가치를 창조해야 한다고 봤고, 삶을 영원히 반복해도 긍정할 수 있는지를 시험대로 삼았다.",
    fit_topics: ["기존 가치에 대한 저항", "자기 긍정", "반복해도 괜찮은 선택"],
    question_style: "지금의 가치관이 스스로 만든 것인지, 물려받아 당연시하는 것인지 되묻는 질문",
    key_works: ["차라투스트라는 이렇게 말했다", "선악의 저편"],
    sourced: true,
    quotable: true,
    quote: "괴물과 싸우는 자는 스스로 괴물이 되지 않도록 조심해야 한다.",
  },
  {
    slug: "leo-tolstoy",
    name: "레프 톨스토이",
    core_concepts: ["삶의 의미", "도덕적 진실", "사랑과 죽음 앞의 정직함"],
    summary: "사랑, 죽음, 신앙, 사회 불평등 앞에서 인간이 스스로에게 얼마나 정직할 수 있는지를 문학으로 성찰했다.",
    fit_topics: ["삶과 죽음", "정직과 자기기만", "일상 속 도덕"],
    question_style: "지금 이 순간, 함께 있는 사람 앞에서 얼마나 정직한지 되묻는 질문",
    key_works: ["이반 일리치의 죽음", "안나 카레니나"],
    sourced: true,
    quotable: true,
    quote: "인생에서 가장 중요한 시간은 지금 이 순간이고, 가장 중요한 사람은 지금 함께 있는 사람이다.",
  },
];

export function findPerspective(slug: string): GiantPerspectiveCard | undefined {
  return GIANT_PERSPECTIVES.find((g) => g.slug === slug);
}
