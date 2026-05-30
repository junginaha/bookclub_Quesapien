/**
 * Question DNA 계산기
 * 온보딩 답변 + 활동 데이터를 기반으로 사용자의 질문 유형 DNA를 계산
 */

export interface DNAScore {
  existential: number;  // 실존 — 삶의 의미, 죽음, 자아
  relational: number;   // 관계 — 사랑, 가족, 연결
  creative: number;     // 창작 — 예술, 글쓰기, 아이디어
  practical: number;    // 실용 — 일, 돈, 성공
}

export interface DNAResult {
  scores: DNAScore;
  dominant: keyof DNAScore;
  label: string;
  description: string;
}

const DNA_LABELS: Record<keyof DNAScore, string> = {
  existential: "실존",
  relational: "관계",
  creative: "창작",
  practical: "실용",
};

const DNA_DESCRIPTIONS: Record<keyof DNAScore, string> = {
  existential: "삶의 의미와 존재에 대한 근본적인 질문을 던집니다.",
  relational: "사람과 사람 사이의 연결에서 답을 찾습니다.",
  creative: "새로운 것을 만들고 표현하는 과정에 의미를 둡니다.",
  practical: "현실 속에서 작동하는 것에 집중합니다.",
};

// 온보딩 질문 → DNA 유형 매핑 키워드
const KEYWORD_MAP: Record<keyof DNAScore, string[]> = {
  existential: ["의미", "존재", "죽음", "삶", "자아", "영혼", "실존", "왜", "철학", "목적", "진실", "깨달음", "혼자", "고독", "외로움"],
  relational: ["관계", "사랑", "가족", "친구", "연인", "사람", "연결", "대화", "소통", "공감", "이해", "함께", "만남", "이별"],
  creative: ["창작", "글쓰기", "예술", "디자인", "음악", "영화", "책", "아이디어", "상상", "표현", "만들기", "창의"],
  practical: ["일", "돈", "성공", "목표", "성장", "커리어", "사업", "효율", "전략", "생산성", "투자", "경제"],
};

function scoreText(text: string): Partial<DNAScore> {
  const scores: Partial<DNAScore> = {};
  const lower = text.toLowerCase();
  for (const [type, keywords] of Object.entries(KEYWORD_MAP)) {
    const hits = keywords.filter((k) => lower.includes(k)).length;
    if (hits > 0) scores[type as keyof DNAScore] = hits;
  }
  return scores;
}

function addScores(base: DNAScore, partial: Partial<DNAScore>): DNAScore {
  return {
    existential: base.existential + (partial.existential ?? 0),
    relational: base.relational + (partial.relational ?? 0),
    creative: base.creative + (partial.creative ?? 0),
    practical: base.practical + (partial.practical ?? 0),
  };
}

function normalize(scores: DNAScore): DNAScore {
  const total = Object.values(scores).reduce((s, v) => s + v, 0);
  if (total === 0) return { existential: 40, relational: 25, creative: 20, practical: 15 };
  return {
    existential: Math.round((scores.existential / total) * 100),
    relational: Math.round((scores.relational / total) * 100),
    creative: Math.round((scores.creative / total) * 100),
    practical: Math.round((scores.practical / total) * 100),
  };
}

export function computeDNA(onboardingAnswers: Record<string, string | string[]>): DNAResult {
  let raw: DNAScore = { existential: 1, relational: 1, creative: 1, practical: 1 };

  // q1: 최근 가장 자주 하는 질문
  if (typeof onboardingAnswers.q1 === "string") {
    raw = addScores(raw, scoreText(onboardingAnswers.q1));
    // 직접 가중치: 오래 남는 질문일수록 existential 가중
    raw.existential += 2;
  }

  // q2: 자주 읽는 분야
  const readingFields = Array.isArray(onboardingAnswers.q2) ? onboardingAnswers.q2 : [];
  for (const field of readingFields) {
    if (["철학 · 사상", "역사 · 인문"].includes(field)) raw.existential += 3;
    if (["소설 · 문학", "시 · 에세이"].includes(field)) raw.creative += 3;
    if (["경제 · 경영", "과학 · 기술"].includes(field)) raw.practical += 3;
    if (["심리 · 자기계발", "종교 · 영성"].includes(field)) raw.relational += 2;
  }

  // q3: 관심 있는 주제
  const interest = Array.isArray(onboardingAnswers.q3) ? onboardingAnswers.q3[0] : onboardingAnswers.q3;
  if (interest) {
    if (["삶의 의미", "자아와 정체성"].includes(interest)) raw.existential += 4;
    if (["관계와 사랑"].includes(interest)) raw.relational += 4;
    if (["창조와 예술"].includes(interest)) raw.creative += 4;
    if (["일과 커리어"].includes(interest)) raw.practical += 4;
    if (["사회와 변화"].includes(interest)) { raw.existential += 2; raw.practical += 2; }
  }

  // q4: 만나고 싶은 사람
  if (typeof onboardingAnswers.q4 === "string") {
    raw = addScores(raw, scoreText(onboardingAnswers.q4));
  }

  // q5: 현재 가장 큰 고민
  if (typeof onboardingAnswers.q5 === "string") {
    const s = scoreText(onboardingAnswers.q5);
    // 고민은 가중치 2배
    raw = addScores(raw, {
      existential: (s.existential ?? 0) * 2,
      relational: (s.relational ?? 0) * 2,
      creative: (s.creative ?? 0) * 2,
      practical: (s.practical ?? 0) * 2,
    });
  }

  const normalized = normalize(raw);
  const dominant = (Object.entries(normalized).sort(([, a], [, b]) => b - a)[0][0]) as keyof DNAScore;

  return {
    scores: normalized,
    dominant,
    label: DNA_LABELS[dominant],
    description: DNA_DESCRIPTIONS[dominant],
  };
}

/** Default DNA when no onboarding data is available */
export const DEFAULT_DNA: DNAResult = {
  scores: { existential: 40, relational: 25, creative: 20, practical: 15 },
  dominant: "existential",
  label: "실존",
  description: "삶의 의미와 존재에 대한 근본적인 질문을 던집니다.",
};
