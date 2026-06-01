import { NextRequest, NextResponse } from "next/server";
import { anthropic, CHAT_MODEL } from "@/lib/anthropic";

const PHILOSOPHICAL_FALLBACKS: Record<string, string[]> = {
  "friedrich-nietzsche": [
    "진정한 강함은 자기 자신을 극복하는 데서 나옵니다. 당신은 오늘 무엇을 극복했나요?",
    "삶의 고통을 피하려 하지 마십시오. 고통은 더 깊은 의미로 이끄는 스승입니다.",
  ],
  "immanuel-kant": [
    "당신의 행동이 보편적 법칙이 될 수 있다면 그것은 옳습니다.",
    "인간은 항상 목적 그 자체로 대우받아야 하며, 수단으로 취급되어서는 안 됩니다.",
  ],
  "socrates": [
    "검토되지 않은 삶은 살 가치가 없습니다. 당신의 삶을 지금 검토해보시겠습니까?",
    "나는 내가 모른다는 것을 압니다. 당신이 모른다고 인정할 수 있는 것은 무엇인가요?",
  ],
  "fyodor-dostoevsky": [
    "고통은 인간을 변화시킵니다. 당신의 가장 큰 고통이 당신을 어떻게 바꿨나요?",
    "아름다움이 세계를 구원할 것입니다. 당신이 발견한 가장 작은 아름다움은 무엇인가요?",
  ],
  "leo-tolstoy": [
    "인생에서 가장 중요한 시간은 지금 이 순간입니다. 지금 이 순간을 어떻게 살고 계신가요?",
  ],
  "franz-kafka": [
    "우리는 스스로 만든 감옥 안에 있습니다. 당신은 어떤 감옥 안에 있나요?",
    "글쓰기는 우리 안의 얼어붙은 바다를 깨뜨리는 도끼입니다.",
  ],
  "marcus-aurelius": [
    "당신이 통제할 수 없는 것에 시간을 낭비하지 마십시오. 당신이 통제할 수 있는 것에 집중하세요.",
  ],
  "albert-einstein": [
    "상상력이 지식보다 중요합니다. 당신의 상상력은 어디까지 닿아 있나요?",
    "문제를 만든 사고방식으로는 그 문제를 해결할 수 없습니다.",
  ],
  "virginia-woolf": [
    "당신만의 방이 필요합니다. 당신에게 그 방이 있나요?",
    "인생이란 발광하는 후광입니다. 당신의 오늘은 어떤 빛을 내고 있나요?",
  ],
  default: [
    "깊은 질문은 그 자체로 이미 답의 일부입니다. 당신이 이 질문을 품게 된 계기는 무엇인가요?",
    "우리가 확신하는 것들을 의심해볼 때, 비로소 진정한 사유가 시작됩니다.",
  ],
};

function getFallback(giantSlug?: string): string {
  const pool = PHILOSOPHICAL_FALLBACKS[giantSlug ?? "default"] ?? PHILOSOPHICAL_FALLBACKS.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function POST(req: NextRequest) {
  let giantSlug = "default";
  try {
    const body = await req.json();
    const { giantName, giantData, messages, wikiSummary } = body;
    giantSlug = body.giantSlug ?? "default";

    if (!giantName || !messages?.length) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // API 키 없을 때 더 자연스러운 fallback 응답
      const fallback = getFallback(giantSlug);
      return NextResponse.json({ response: fallback, giantSlug, limited: true });
    }

    const client = anthropic;

    const wikiContext = wikiSummary
      ? `\n\n[공개 자료 요약 — Wikipedia]\n${wikiSummary.slice(0, 800)}`
      : "";

    const systemPrompt = `당신은 ${giantName}입니다. 실제 저서와 철학적 관점으로 질문에 답하세요.${wikiContext}

핵심 사상: ${giantData?.core_idea ?? ""}
대표 저서: ${(giantData?.key_works ?? []).join(", ")}
대표 어록: "${giantData?.signature_quote ?? ""}"

응답 지침:
1. ${giantName}의 관점과 언어로 자연스럽게 답하세요. "저는 ${giantName}으로서..." 같은 메타 표현은 금지
2. 실제 저서 개념과 논리로 구성하세요
3. 한국어로, 깊이 있고 사유를 자극하는 방식으로 200-350자 내외
4. 마지막에 상대방이 더 생각해볼 반문 하나를 자연스럽게 덧붙이세요
5. 지나치게 확정적 주장은 삼가고, AI의 창의적 해석임을 인지하세요`;

    const anthropicMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const response = await client.messages.create({
      model: CHAT_MODEL,
      max_tokens: 600,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const text = response.content.find((c) => c.type === "text");
    if (!text || text.type !== "text") {
      throw new Error("No text response");
    }

    return NextResponse.json({ response: text.text, giantSlug });
  } catch (err) {
    console.error("Giants chat error:", err);
    return NextResponse.json({ response: getFallback(giantSlug), giantSlug });
  }
}
