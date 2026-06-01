/**
 * Giants data — 저작권 안전: 사후 70년 이상 경과한 인물만 포함 (2026년 기준 1956년 이전 사망)
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
    id: "4", slug: "georg-hegel", name: "게오르크 헤겔", name_en: "Georg W. F. Hegel",
    birth_year: 1770, death_year: 1831, nationality: "독일",
    category: "philosopher",
    tagline: "이성적인 것은 현실적이고, 현실적인 것은 이성적이다.",
    core_idea: "정반합의 변증법으로 역사와 정신의 발전을 설명했다. 절대정신이 자연과 인간 역사를 통해 스스로를 실현한다고 보았다.",
    key_works: ["정신현상학", "논리학", "법철학", "역사철학 강의"],
    color: "#2C4A3E",
    signature_quote: "역사는 자유의 의식이 진보하는 과정이다.",
    related_questions: ["역사는 진보하는가?", "개인의 자유와 사회의 질서는 어떻게 조화를 이루는가?"],
  },
  {
    id: "5", slug: "socrates", name: "소크라테스", name_en: "Socrates",
    birth_year: -469, death_year: -399, nationality: "그리스",
    category: "philosopher",
    tagline: "나는 내가 모른다는 것을 안다.",
    core_idea: "대화를 통해 상대방 스스로 진리에 도달하게 하는 산파술(Maieutics)을 개발했다. '너 자신을 알라'는 명제로 자기 인식의 중요성을 강조했다.",
    key_works: ["국가(플라톤 기록)", "소크라테스의 변론(플라톤 기록)", "향연(플라톤 기록)"],
    color: "#5B4A35",
    signature_quote: "검토되지 않은 삶은 살 가치가 없다.",
    related_questions: ["나는 내가 모르는 것을 알고 있는가?", "진정한 앎이란 무엇인가?"],
  },
  {
    id: "6", slug: "fyodor-dostoevsky", name: "표도르 도스토옙스키", name_en: "Fyodor Dostoevsky",
    birth_year: 1821, death_year: 1881, nationality: "러시아",
    category: "author",
    tagline: "아름다움이 세계를 구원할 것이다.",
    core_idea: "인간 내면의 어둠과 빛을 동시에 탐구했다. 고통을 통한 구원, 자유의지와 도덕적 책임, 신과 인간의 관계를 소설로 풀어냈다.",
    key_works: ["죄와 벌", "카라마조프의 형제들", "백치", "지하로부터의 수기"],
    color: "#4A3728",
    signature_quote: "인간은 고통에 익숙해질 수 있다.",
    related_questions: ["고통은 인간을 어떻게 변화시키는가?", "자유는 축복인가, 형벌인가?"],
  },
  {
    id: "7", slug: "leo-tolstoy", name: "레프 톨스토이", name_en: "Leo Tolstoy",
    birth_year: 1828, death_year: 1910, nationality: "러시아",
    category: "author",
    tagline: "모든 행복한 가정은 서로 닮았고, 모든 불행한 가정은 제각각으로 불행하다.",
    core_idea: "인간 삶의 의미와 도덕적 진실을 문학으로 탐구했다. 사랑, 죽음, 신앙, 사회 불평등을 깊이 성찰했으며 비폭력 저항 사상을 발전시켰다.",
    key_works: ["전쟁과 평화", "안나 카레니나", "이반 일리치의 죽음", "부활"],
    color: "#3B4A3A",
    signature_quote: "인생에서 가장 중요한 시간은 지금 이 순간이고, 가장 중요한 사람은 지금 함께 있는 사람이다.",
    related_questions: ["삶의 의미는 무엇인가?", "죽음 앞에서 우리는 어떻게 살아야 하는가?"],
  },
  {
    id: "8", slug: "franz-kafka", name: "프란츠 카프카", name_en: "Franz Kafka",
    birth_year: 1883, death_year: 1924, nationality: "체코(오스트리아-헝가리)",
    category: "author",
    tagline: "글쓰기는 도끼다. 우리 안의 얼어붙은 바다를 깨뜨리는.",
    core_idea: "관료제와 현대 사회의 부조리함, 개인의 소외와 정체성 상실을 문학으로 형상화했다. 현실과 비현실의 경계를 허물며 실존적 불안을 탐구했다.",
    key_works: ["변신", "심판", "성", "유형지에서"],
    color: "#2D2D3A",
    signature_quote: "책은 우리 안의 얼어붙은 바다를 깨뜨리는 도끼여야 한다.",
    related_questions: ["나는 스스로 만든 감옥 안에 갇혀 있지 않은가?", "부조리한 세계에서 인간은 어떻게 의미를 찾는가?"],
  },
  {
    id: "9", slug: "virginia-woolf", name: "버지니아 울프", name_en: "Virginia Woolf",
    birth_year: 1882, death_year: 1941, nationality: "영국",
    category: "author",
    tagline: "자기만의 방이 필요하다.",
    core_idea: "의식의 흐름 기법으로 인간 내면의 복잡한 심리를 탐구했다. 젠더와 창의성, 사회적 제약 속에서의 예술과 자아 실현을 깊이 성찰했다.",
    key_works: ["댈러웨이 부인", "등대로", "올랜도", "자기만의 방"],
    color: "#4A3A5C",
    signature_quote: "인생이란 발광하는 후광이 아닌가?",
    related_questions: ["나만의 공간과 시간을 가지고 있는가?", "창의적 삶을 위해 무엇이 필요한가?"],
  },
  {
    id: "10", slug: "albert-einstein", name: "알베르트 아인슈타인", name_en: "Albert Einstein",
    birth_year: 1879, death_year: 1955, nationality: "독일/미국",
    category: "scientist",
    tagline: "상상력이 지식보다 중요하다.",
    core_idea: "상대성이론으로 시간과 공간에 대한 근본적인 이해를 바꿨다. 과학적 사유와 인문적 성찰을 결합하여 평화, 교육, 인류의 미래에 대해 깊이 고민했다.",
    key_works: ["특수 상대성 이론", "일반 상대성 이론", "나의 세계관", "물리학의 진화"],
    color: "#1A3A5C",
    signature_quote: "상상력이 지식보다 중요하다. 지식은 한계가 있지만 상상력은 세상을 감싸 안는다.",
    related_questions: ["우리는 알고 있는 것보다 더 많은 것을 상상할 수 있는가?", "과학과 인문학은 어떻게 연결되는가?"],
  },
  {
    id: "11", slug: "leo-da-vinci", name: "레오나르도 다 빈치", name_en: "Leonardo da Vinci",
    birth_year: 1452, death_year: 1519, nationality: "이탈리아",
    category: "scientist",
    tagline: "단순함은 궁극의 정교함이다.",
    core_idea: "예술과 과학, 공학, 철학을 경계 없이 탐구했다. 끝없는 호기심으로 자연과 인간을 관찰하며 시대를 수백 년 앞선 아이디어를 남겼다.",
    key_works: ["최후의 만찬", "모나리자", "비트루비우스적 인간", "코덱스 레스터"],
    color: "#8B6914",
    signature_quote: "아는 것으로 충분하지 않다. 적용해야 한다. 의지만으로 충분하지 않다. 행동해야 한다.",
    related_questions: ["예술과 과학은 어떻게 서로를 풍요롭게 하는가?", "끝없는 호기심은 삶을 어떻게 바꾸는가?"],
  },
  {
    id: "12", slug: "marcus-aurelius", name: "마르쿠스 아우렐리우스", name_en: "Marcus Aurelius",
    birth_year: 121, death_year: 180, nationality: "로마",
    category: "philosopher",
    tagline: "당신의 마음이 당신의 통치자여야 한다.",
    core_idea: "스토아 철학을 실천했으며, 황제로서 권력과 덕을 결합하려 했다. 자기 수양, 이성, 의무, 순간에 충실한 삶의 철학을 일기로 남겼다.",
    key_works: ["명상록"],
    color: "#6B5A3A",
    signature_quote: "당신이 통제할 수 없는 것에 시간을 낭비하지 말라. 당신이 통제할 수 있는 것에 집중하라.",
    related_questions: ["내가 통제할 수 있는 것과 없는 것을 구분하고 있는가?", "권력 앞에서 어떻게 덕을 지킬 수 있는가?"],
  },
];
