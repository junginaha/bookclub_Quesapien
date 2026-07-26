import { callClaude } from "@/lib/anthropic";
import { GIANT_PERSPECTIVES, findPerspective } from "@/data/giantPerspectives";

export type Direction = "free" | "life" | "society" | "philosophy";
export type Depth = "first" | "general" | "deep";

const DIRECTION_LABEL: Record<Direction, string> = {
  free: "자유롭게",
  life: "삶과 연결",
  society: "사회와 연결",
  philosophy: "철학적으로 깊게",
};

const DEPTH_LABEL: Record<Depth, string> = {
  first: "처음 읽는 모임",
  general: "일반 북클럽",
  deep: "깊이 있는 토론",
};

export interface BookInput {
  title: string;
  author: string;
  description?: string;
  direction?: Direction;
  depth?: Depth;
}

export interface BookAnalysis {
  confirmed_title: string;
  confirmed_author: string;
  confidence: "high" | "medium" | "low";
  core_argument: string;
  key_concepts: string[];
  tensions: string[];
  premises: string;
  counterarguments: string;
  modern_connection: string;
}

export type QuestionStage = "opening" | "deep" | "giant" | "closing";

export interface DiscussionQuestion {
  number: number;
  stage: QuestionStage;
  question: string;
  intent: string;
  followup: string;
  concept: string;
  thinker?: string;
}

export interface GiantUsed {
  slug: string;
  name: string;
  stance: "support" | "critical";
  summary: string;
}

export interface DiscussionResult {
  analysis: BookAnalysis;
  giants: GiantUsed[];
  opening_lines: string[];
  tensions: string[];
  questions: DiscussionQuestion[];
  facilitator_notes: string;
}

export class DiscussionEngineError extends Error {
  code:
    | "missing_input"
    | "insufficient_description"
    | "api_error"
    | "timeout"
    | "invalid_json"
    | "rate_limited"
    | "network_error"
    | "config_missing";
  constructor(code: DiscussionEngineError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

function extractJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new DiscussionEngineError("invalid_json", "AI 응답에서 JSON을 찾지 못했습니다.");
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    throw new DiscussionEngineError("invalid_json", "AI 응답 JSON 파싱에 실패했습니다.");
  }
}

async function callClaudeGuarded(params: Parameters<typeof callClaude>[0]): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new DiscussionEngineError("config_missing", "ANTHROPIC_API_KEY가 설정되어 있지 않습니다.");
  }
  try {
    return await callClaude(params);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/timeout/i.test(msg)) throw new DiscussionEngineError("timeout", msg);
    if (/API 429|rate.?limit/i.test(msg)) throw new DiscussionEngineError("rate_limited", msg);
    if (/API \d{3}/.test(msg)) throw new DiscussionEngineError("api_error", msg);
    throw new DiscussionEngineError("network_error", msg);
  }
}

export async function analyzeBook(input: BookInput): Promise<BookAnalysis> {
  const system = `당신은 인문학 편집자입니다. 사용자가 입력한 책 정보(제목, 저자, 설명)를 분석해 북클럽 발제에 필요한 핵심 정보를 JSON으로 추출하세요.

규칙:
- 확인되지 않은 줄거리, 등장인물, 사건, 인용문을 지어내지 마세요. 이 책을 확실히 알고 있을 때만 구체적으로 쓰고, 그렇지 않다면 사용자가 준 설명 안에서만 근거를 찾으세요.
- confidence는 이 책의 내용을 신뢰 있게 알고 있으면 "high", 사용자가 준 설명으로만 추론 가능하면 "medium", 근거가 거의 없으면 "low"로 표시하세요.
- key_concepts는 이 책 고유의 개념·주제 3~5개. "사랑", "행복", "인간" 같은 범용 단어는 금지하고, 이 책이 다루는 구체적 개념/소재를 쓰세요.
- tensions는 이 책 내부의 갈등·모순·역설 3개.
- premises는 이 책이 당연하게 깔고 가는 전제 가치, counterarguments는 이 책에 제기할 수 있는 반론 지점입니다.
- modern_connection은 이 책의 문제의식이 오늘날 어떻게 이어지는지 1~2문장.

반드시 아래 JSON 형식으로만 응답하세요:
{"confirmed_title":"...","confirmed_author":"...","confidence":"high|medium|low","core_argument":"...","key_concepts":["...","..."],"tensions":["...","...","..."],"premises":"...","counterarguments":"...","modern_connection":"..."}`;

  const userMsg = `책 제목: ${input.title}\n저자: ${input.author || "(미상)"}${
    input.description ? `\n설명: ${input.description}` : ""
  }`;

  const text = await callClaudeGuarded({
    system,
    messages: [{ role: "user", content: userMsg }],
    maxTokens: 900,
    temperature: 0.4,
  });

  const analysis = extractJson<BookAnalysis>(text);
  if (!Array.isArray(analysis.key_concepts) || analysis.key_concepts.length === 0) {
    throw new DiscussionEngineError("invalid_json", "책 분석 결과가 불완전합니다.");
  }
  return analysis;
}

interface RawGenResult {
  giants_used: { slug: string; stance: "support" | "critical" }[];
  opening_lines: string[];
  questions: DiscussionQuestion[];
  facilitator_notes: string;
}

function buildGenerationSystemPrompt(analysis: BookAnalysis, direction: Direction, depth: Depth): string {
  const roster = GIANT_PERSPECTIVES.map(
    (g) => `- ${g.name} (${g.slug}): 핵심개념 [${g.core_concepts.join(", ")}] — ${g.summary}`
  ).join("\n");

  return `당신은 북클럽 발제 전문가입니다. 아래 책 분석 결과와 사상가 관점카드 목록을 바탕으로 북클럽 현장에서 바로 쓸 발제문을 만드세요.

[책 분석]
확정 제목: ${analysis.confirmed_title}
저자: ${analysis.confirmed_author}
핵심 주장: ${analysis.core_argument}
핵심 개념: ${analysis.key_concepts.join(", ")}
내부 긴장: ${analysis.tensions.join(" / ")}
전제 가치: ${analysis.premises}
반론 가능성: ${analysis.counterarguments}
현대적 연결: ${analysis.modern_connection}

[사상가 관점카드 목록] — 이 중 이 책과 가장 날카롭게 맞닿는 2명만 고르세요. 반드시 한 명은 이 책의 주장에 힘을 싣는 "지지 관점(support)", 다른 한 명은 도전하거나 반박하는 "비판 관점(critical)"이어야 합니다. 저자 본인과 겹치는 인물이면 다른 인물을 고르세요.
${roster}

[발제 방향]: ${DIRECTION_LABEL[direction]}
[모임 깊이]: ${DEPTH_LABEL[depth]}

규칙:
- 모든 질문은 위 핵심 개념·내부 긴장 중 최소 하나와 명시적으로 연결되어야 합니다. 이 책이 아니어도 물을 수 있는 범용 질문("행복이란 무엇인가?", "인간이란 무엇인가?" 류)은 금지합니다.
- 예/아니오로 답이 끝나는 질문 금지. 참가자마다 다른 대답이 나올 수밖에 없는 구체적 질문을 만드세요.
- 감상("좋았나요?", "어땠나요?")에 머무르는 질문 금지.
- 10개 질문은 역할이 겹치지 않아야 합니다: 대화 시작(2) → 심화(5) → 거인의 시선(2) → 마무리(1).
- 관점은 개인적 경험 / 사회적 함의 / 윤리적 딜레마 / 비판적 반론 / 실천적 적용 중 서로 다른 각도로 분산하세요.
- "거인의 시선" 질문 2개는 선택한 두 사상가 각각의 핵심 개념을 실제로 적용해 만드세요. 인물 이름을 나열만 하지 말고 그 사유 방식이 질문 문장 안에 자연스럽게 녹아들게 하세요. 각 항목에 반드시 "thinker" 필드로 선택한 사상가 이름을 넣으세요.
- 확인되지 않은 줄거리·인물·사건·인용을 지어내지 마세요. 직접 인용(따옴표)은 만들지 마세요.
- opening_lines는 진행자가 책의 문제의식을 참가자에게 소개하는 짧은 멘트 3문장입니다.
- facilitator_notes는 진행 시 주의할 점 1~2문장입니다.
- 모든 텍스트는 한국어 존댓말로 작성하세요.
- 각 질문 객체의 "concept" 필드에는 그 질문이 연결된 핵심 개념/내부 긴장을 정확히 적으세요.

반드시 아래 JSON 형식으로만 응답하세요:
{"giants_used":[{"slug":"...","stance":"support"},{"slug":"...","stance":"critical"}],"opening_lines":["...","...","..."],"questions":[{"number":1,"stage":"opening","question":"...","intent":"...","followup":"...","concept":"..."}, ... 총 10개, stage는 opening(1~2), deep(3~7), giant(8~9, thinker 필드 포함), closing(10) 순서 ...],"facilitator_notes":"..."}`;
}

export async function generateDiscussion(
  analysis: BookAnalysis,
  direction: Direction = "free",
  depth: Depth = "general"
): Promise<{ giants: GiantUsed[]; opening_lines: string[]; questions: DiscussionQuestion[]; facilitator_notes: string }> {
  const system = buildGenerationSystemPrompt(analysis, direction, depth);
  const text = await callClaudeGuarded({
    system,
    messages: [{ role: "user", content: "위 조건에 맞춰 발제문 JSON을 생성하세요." }],
    maxTokens: 2400,
    temperature: 1,
  });

  const raw = extractJson<RawGenResult>(text);
  if (!Array.isArray(raw.questions) || raw.questions.length !== 10) {
    throw new DiscussionEngineError("invalid_json", "발제 10개가 온전히 생성되지 않았습니다.");
  }

  const giants: GiantUsed[] = (raw.giants_used ?? [])
    .map((g) => {
      const card = findPerspective(g.slug);
      if (!card) return null;
      return { slug: card.slug, name: card.name, stance: g.stance, summary: card.summary };
    })
    .filter((g): g is GiantUsed => g !== null);

  return {
    giants,
    opening_lines: Array.isArray(raw.opening_lines) ? raw.opening_lines.slice(0, 3) : [],
    questions: raw.questions,
    facilitator_notes: raw.facilitator_notes ?? "",
  };
}

const GENERIC_BLOCKLIST = [
  /인간이란 무엇/, /행복이란 무엇/, /사랑이란 무엇/, /삶의 의미는 무엇/,
  /닮은\s*(사람|인물)/, /10년\s*전의/, /결말을\s*어떻게\s*다시/,
  /가장\s*낯설게\s*느껴졌던/, /어땠나요\??$/, /좋았나요\??$/,
];

const YESNO_PATTERN = /(옳은가요?|맞는가요?|좋은가요?|나쁜가요?|가능한가요?)\??$/;
const WH_PATTERN = /(무엇|어떤|어떻게|왜|누구|언제|어디)/;

/** 생성 결과의 품질을 검사하고, 문제가 있는 질문의 index(0-based)를 반환한다. */
export function validateDiscussion(
  result: { questions: DiscussionQuestion[]; giants: GiantUsed[] },
  analysis: BookAnalysis
): number[] {
  const failed = new Set<number>();
  const concepts = [...analysis.key_concepts, ...analysis.tensions];
  const seenText = new Set<string>();

  result.questions.forEach((q, i) => {
    const text = (q.question ?? "").trim();
    if (!text) { failed.add(i); return; }
    if (GENERIC_BLOCKLIST.some((rx) => rx.test(text))) { failed.add(i); return; }
    if (YESNO_PATTERN.test(text) && !WH_PATTERN.test(text)) { failed.add(i); return; }
    if (/[""「」]/.test(text)) { failed.add(i); return; } // 미검증 인용 방지
    if (!q.concept || !q.concept.trim()) { failed.add(i); return; }

    const norm = text.replace(/\s/g, "");
    if (seenText.has(norm)) { failed.add(i); return; }
    seenText.add(norm);
  });

  const giantQs = result.questions
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => q.stage === "giant");
  if (giantQs.length === 2 && giantQs[0].q.thinker && giantQs[0].q.thinker === giantQs[1].q.thinker) {
    failed.add(giantQs[1].i);
  }
  giantQs.forEach(({ q, i }) => { if (!q.thinker) failed.add(i); });

  if (concepts.length > 0) {
    // 최소한의 개념 연결 검증: concept 필드가 분석 결과와 무관한 단어만은 아닌지 느슨하게 확인
    result.questions.forEach((q, i) => {
      if (failed.has(i)) return;
      const hasAnyOverlap = concepts.some(
        (c) => q.concept.includes(c) || c.includes(q.concept) || q.question.includes(c)
      );
      if (!hasAnyOverlap && q.concept.length < 2) failed.add(i);
    });
  }

  return Array.from(failed).sort((a, b) => a - b);
}

/** 검증에 실패한 질문만 골라 1회 재생성한다. */
export async function regenerateFailedQuestions(
  analysis: BookAnalysis,
  giants: GiantUsed[],
  direction: Direction,
  depth: Depth,
  questions: DiscussionQuestion[],
  failedIndices: number[]
): Promise<DiscussionQuestion[]> {
  if (failedIndices.length === 0) return questions;

  const targets = failedIndices.map((i) => questions[i]);
  const system = `당신은 북클럽 발제 전문가입니다. 아래 발제 세트 중 문제가 있는 일부 항목만 다시 만듭니다.

[책 분석] 핵심 개념: ${analysis.key_concepts.join(", ")} / 내부 긴장: ${analysis.tensions.join(" / ")}
[선택된 사상가] ${giants.map((g) => `${g.name}(${g.stance})`).join(", ")}
[발제 방향]: ${DIRECTION_LABEL[direction]} / [모임 깊이]: ${DEPTH_LABEL[depth]}

규칙: 범용 질문·예소답형 질문·미검증 인용 금지. 각 질문은 핵심 개념 중 최소 하나와 연결. 아래 각 항목의 number/stage(및 giant 단계면 thinker)는 그대로 유지한 채 question/intent/followup/concept만 새로 채우세요. 기존 질문들과 내용이 겹치지 않게 하세요.

다시 만들 항목: ${JSON.stringify(targets.map((t) => ({ number: t.number, stage: t.stage, thinker: t.thinker })))}

반드시 다음 JSON 형식으로만 응답하세요: {"replacements":[{"number":1,"stage":"opening","question":"...","intent":"...","followup":"...","concept":"...","thinker":"(giant 단계일 때만)"}]}`;

  try {
    const text = await callClaudeGuarded({
      system,
      messages: [{ role: "user", content: "위 항목만 재생성하세요." }],
      maxTokens: 1200,
      temperature: 1,
    });
    const raw = extractJson<{ replacements: DiscussionQuestion[] }>(text);
    const byNumber = new Map(raw.replacements.map((r) => [r.number, r]));
    return questions.map((q) => byNumber.get(q.number) ?? q);
  } catch {
    // 재생성 1회 시도까지 실패하면 원본을 그대로 반환 — 전체 재생성은 하지 않는다
    return questions;
  }
}

export async function buildDiscussion(input: BookInput): Promise<DiscussionResult> {
  const direction = input.direction ?? "free";
  const depth = input.depth ?? "general";

  const analysis = await analyzeBook(input);

  if (analysis.confidence === "low" && !input.description?.trim()) {
    throw new DiscussionEngineError(
      "insufficient_description",
      "이 책을 확실히 식별하지 못했습니다. 책 설명을 조금 더 추가해주세요."
    );
  }

  const gen = await generateDiscussion(analysis, direction, depth);
  const failed = validateDiscussion(gen, analysis);
  const questions = await regenerateFailedQuestions(analysis, gen.giants, direction, depth, gen.questions, failed);

  return {
    analysis,
    giants: gen.giants,
    opening_lines: gen.opening_lines,
    tensions: analysis.tensions,
    questions,
    facilitator_notes: gen.facilitator_notes,
  };
}
