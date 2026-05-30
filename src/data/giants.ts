/**
 * Giants data — shared between GiantsClient.tsx (UI) and sitemap.ts (SSR).
 * No "use client" here so it's safe to import server-side.
 */

export type GiantCategory = "all" | "philosopher" | "author" | "scientist" | "thinker" | "entrepreneur";

export interface Giant {
  id: string;
  slug: string;
  name: string;
  name_en: string;
  birth_year: number;
  death_year?: number;
  nationality: string;
  category: Exclude<GiantCategory, "all">;
  tagline: string;
  core_idea: string;
  key_works: string[];
  color: string;
  signature_quote: string;
  related_questions: string[];
}

export const GIANTS: Giant[] = [
  {
    id: "1", slug: "friedrich-nietzsche", name: "프리드리히 니체", name_en: "Friedrich Nietzsche",
    birth_year: 1844, death_year: 1900, nationality: "독일",
    category: "philosopher",
    tagline: "신은 죽었다. 이제 우리가 살아야 한다.",
    core_idea: "허무주의를 극복하고 초인(Übermensch)의 개념을 통해 인간이 스스로 가치를 창조해야 한다고 주장했다. 영원회귀 개념으로 삶을 긍정하는 철학을 탐구했다.",
    key_works: ["차라투스트라는 이렇게 말했다", "선악의 저편", "도덕의 계보", "비극의 탄생"],
    color: "#2D3748",
    signature_quote: "괴물과 싸우는 자는 스스로 괴물이 되지 않도록 조심해야 한다.",
    related_questions: ["나는 어떤 가치를 스스로 만들고 있는가?", "삶을 영원히 반복한다면 지금 이 선택을 할 수 있는가?"],
  },
  {
    id: "2", slug: "immanuel-kant", name: "임마누엘 칸트", name_en: "Immanuel Kant",
    birth_year: 1724, death_year: 1804, nationality: "독일",
    category: "philosopher",
    tagline: "도덕은 감정이 아니라 이성에서 나온다.",
    core_idea: "순수이성비판을 통해 인간 인식의 한계를 탐구했다. 정언명령(Kategorischer Imperativ)으로 도덕의 보편적 기초를 세웠다.",
    key_works: ["순수이성비판", "실천이성비판", "판단력비판", "영원한 평화"],
    color: "#4A5568",
    signature_quote: "두 가지가 나를 경외심으로 가득 채운다: 내 위의 별이 가득한 하늘과 내 안의 도덕 법칙.",
    related_questions: ["모든 사람이 해도 괜찮다면 나도 해도 되는가?", "이성과 감정 중 무엇을 따르는 것이 옳은가?"],
  },
  {
    id: "3", slug: "arthur-schopenhauer", name: "아르투어 쇼펜하우어", name_en: "Arthur Schopenhauer",
    birth_year: 1788, death_year: 1860, nationality: "독일",
    category: "philosopher",
    tagline: "삶은 의지와 고통의 연속이다.",
    core_idea: "세계는 의지의 표상이라는 철학으로 삶의 고통과 예술, 금욕을 통한 해방을 탐구했다. 동양 철학(불교)과의 연결로 서구 철학에 새로운 시각을 열었다.",
    key_works: ["의지와 표상으로서의 세계", "윤리학의 두 가지 근본 문제", "여록과 보유"],
    color: "#553C2A",
    signature_quote: "재능은 다른 사람이 맞히지 못하는 과녁을 맞히지만, 천재는 아무도 볼 수 없는 과녁을 맞힌다.",
    related_questions: ["고통 없이 살 수 있다면 삶은 더 의미 있을까?", "욕망을 줄이는 것이 행복으로 가는 길인가?"],
  },
  {
    id: "4", slug: "han-kang", name: "한강", name_en: "Han Kang",
    birth_year: 1970, nationality: "한국",
    category: "author",
    tagline: "폭력과 아름다움 사이에서 인간을 묻다.",
    core_idea: "한국 현대사의 폭력과 인간 내면의 아름다움을 섬세한 언어로 교차시킨다. 채식주의자부터 소년이 온다까지 몸과 기억, 트라우마를 탐구한다.",
    key_works: ["채식주의자", "소년이 온다", "흰", "작별하지 않는다"],
    color: "#744C24",
    signature_quote: "우리는 끝까지 인간이고 싶다.",
    related_questions: ["폭력 앞에서 인간은 무엇을 지킬 수 있는가?", "고통의 기억을 어떻게 대면해야 하는가?"],
  },
  {
    id: "5", slug: "kim-young-ha", name: "김영하", name_en: "Kim Young-ha",
    birth_year: 1968, nationality: "한국",
    category: "author",
    tagline: "이야기는 우리가 살아남는 방식이다.",
    core_idea: "인간이 이야기를 통해 삶을 이해하고 연결된다는 내러티브 인류학적 시각. 현대인의 소외와 정체성을 날카롭게 탐구한다.",
    key_works: ["나는 나를 파괴할 권리가 있다", "빛의 제국", "살인자의 기억법", "여행의 이유"],
    color: "#2C5364",
    signature_quote: "독서는 타인의 내면으로 들어가는 가장 깊은 방법이다.",
    related_questions: ["당신의 삶을 이야기로 만든다면 어떤 이야기인가?", "독서는 당신을 어떻게 바꿔왔나?"],
  },
  {
    id: "6", slug: "yuval-harari", name: "유발 하라리", name_en: "Yuval Noah Harari",
    birth_year: 1976, nationality: "이스라엘",
    category: "thinker",
    tagline: "호모 사피엔스, 스스로를 이해하기 시작한 종.",
    core_idea: "역사적 관점에서 인류의 과거(사피엔스), 현재(호모 데우스), 미래(21세기를 위한 21가지 제언)를 탐구. AI와 생명공학이 인류에게 미치는 영향을 분석한다.",
    key_works: ["사피엔스", "호모 데우스", "21세기를 위한 21가지 제언"],
    color: "#1A3A5C",
    signature_quote: "역사의 가장 큰 사기는 인류가 자신을 위해 발전해왔다는 믿음이다.",
    related_questions: ["AI 시대에 인간만이 할 수 있는 것은 무엇인가?", "역사는 진보하고 있는가?"],
  },
  {
    id: "7", slug: "peter-drucker", name: "피터 드러커", name_en: "Peter Drucker",
    birth_year: 1909, death_year: 2005, nationality: "오스트리아-미국",
    category: "entrepreneur",
    tagline: "경영의 목적은 고객을 창조하는 것이다.",
    core_idea: "현대 경영학의 아버지. 지식 사회의 도래를 예측하고 사람 중심 경영을 강조했다. 자기 관리와 리더십의 본질을 탐구했다.",
    key_works: ["경영의 실제", "자기 경영 노트", "프로페셔널의 조건", "변화 리더의 조건"],
    color: "#2D4A22",
    signature_quote: "가장 중요한 것은, 하는 것이 아니라 그만두는 것이다.",
    related_questions: ["당신이 진정으로 잘하는 일은 무엇인가?", "일을 통해 무엇을 남기고 싶은가?"],
  },
  {
    id: "8", slug: "charlie-munger", name: "찰리 멍거", name_en: "Charlie Munger",
    birth_year: 1924, death_year: 2023, nationality: "미국",
    category: "entrepreneur",
    tagline: "역발상. 항상 반대로 생각하라.",
    core_idea: "다학제적 사고(멘탈 모델)를 통해 복잡한 문제를 해결하는 방법론. 가치투자와 인지 편향 극복에 대한 실용적 지혜를 전파했다.",
    key_works: ["Poor Charlie's Almanack", "멍거의 말(워렌 버핏과의 대화 모음)"],
    color: "#4A3728",
    signature_quote: "내가 알고 싶은 것은 내가 어디서 죽을지이다. 그러면 그곳에 절대 가지 않을 것이다.",
    related_questions: ["역발상으로 생각할 때 문제가 어떻게 달라 보이는가?", "당신의 가장 큰 인지 편향은 무엇인가?"],
  },
  {
    id: "9", slug: "albert-camus", name: "알베르 카뮈", name_en: "Albert Camus",
    birth_year: 1913, death_year: 1960, nationality: "프랑스-알제리",
    category: "philosopher",
    tagline: "시지프스는 행복해야 한다.",
    core_idea: "부조리 철학. 의미 없는 세계에서 인간이 어떻게 존엄을 유지하며 살 수 있는지를 탐구했다. 저항과 연대의 철학자.",
    key_works: ["이방인", "페스트", "시지프 신화", "반항하는 인간"],
    color: "#5B4A6B",
    signature_quote: "인생에서 중요한 것은 죽음의 의미가 아니라 삶의 의미다.",
    related_questions: ["삶이 무의미하다면 어떻게 살아야 하는가?", "부조리한 상황에서도 계속 나아가는 이유는?"],
  },
  {
    id: "10", slug: "simone-de-beauvoir", name: "시몬 드 보부아르", name_en: "Simone de Beauvoir",
    birth_year: 1908, death_year: 1986, nationality: "프랑스",
    category: "philosopher",
    tagline: "여성은 태어나는 것이 아니라 만들어지는 것이다.",
    core_idea: "실존주의 페미니즘의 창시자. 여성의 타자성과 억압을 분석하고 자유와 책임의 철학으로 해방의 길을 제시했다.",
    key_works: ["제2의 성", "모든 인간은 죽는다", "아주 편안한 죽음"],
    color: "#7B4040",
    signature_quote: "당신의 삶은 당신이 만들어가는 것이다.",
    related_questions: ["사회가 당신에게 기대하는 역할과 당신이 원하는 삶은 얼마나 다른가?", "진정한 자유란 무엇인가?"],
  },
  {
    id: "11", slug: "virginia-woolf", name: "버지니아 울프", name_en: "Virginia Woolf",
    birth_year: 1882, death_year: 1941, nationality: "영국",
    category: "author",
    tagline: "자기만의 방과 자기만의 언어.",
    core_idea: "의식의 흐름 기법으로 인간의 내면을 탐구했다. 여성의 창조성과 독립성을 옹호하며 근대 문학의 새 길을 열었다.",
    key_works: ["자기만의 방", "파도", "등대로", "달러웨이 부인"],
    color: "#4A6B7B",
    signature_quote: "당신은 삶의 의미를 외부에서 찾지 말고, 당신 자신의 삶을 통해 만들어야 한다.",
    related_questions: ["당신만의 창조적 공간이 있는가?", "사회의 기대로부터 자유로울 수 있는가?"],
  },
  {
    id: "12", slug: "steve-jobs", name: "스티브 잡스", name_en: "Steve Jobs",
    birth_year: 1955, death_year: 2011, nationality: "미국",
    category: "entrepreneur",
    tagline: "미래를 예측하는 최선의 방법은 그것을 발명하는 것이다.",
    core_idea: "기술과 예술의 교차점에서 인간 경험을 재설계했다. 완벽주의와 단순성의 철학으로 제품이 어떻게 인간의 삶을 바꿀 수 있는지를 보여줬다.",
    key_works: ["잡스(월터 아이작슨)", "스탠퍼드 졸업 연설", "Think Different 캠페인"],
    color: "#2D2D2D",
    signature_quote: "죽음을 생각하는 것은 내가 아는 가장 중요한 도구다. 잃을 것이 없기 때문에 마음이 자유로워진다.",
    related_questions: ["당신이 진심으로 사랑하는 일을 하고 있는가?", "단순함이 복잡함보다 어려운 이유는?"],
  },
];
