import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const PHILOSOPHICAL_FALLBACKS: Record<string, string[]> = {
  "friedrich-nietzsche": [
    "진정한 강함은 타인을 압도하는 것이 아니라, 자기 자신을 극복하는 데서 나옵니다. 당신은 오늘 무엇을 극복했나요?",
    "삶의 고통을 피하려 하지 마십시오. 고통은 우리를 단련시키고, 더 깊은 의미로 이끄는 스승입니다. 당신이 가장 두려워하는 것은 무엇입니까?",
    "모든 위대한 것은 위험과 함께 옵니다. 안전한 삶을 택하는 순간, 위대함을 포기하는 것입니다. 당신은 무엇을 위해 위험을 감수할 의향이 있습니까?",
  ],
  "immanuel-kant": [
    "당신의 행동이 보편적 법칙이 될 수 있다면 그것은 옳습니다. 지금 당신이 하려는 선택이 모든 사람에게 적용된다면 어떨까요?",
    "인간은 항상 목적 그 자체로 대우받아야 하며, 수단으로 취급되어서는 안 됩니다. 당신은 오늘 누군가를 수단으로 대한 적이 있습니까?",
  ],
  "han-kang": [
    "우리는 고통 앞에서도 인간으로 남을 수 있을까요? 그 물음 자체가 이미 인간임을 증명하는 것일지 모릅니다.",
    "아름다움은 고통과 공존합니다. 가장 아름다운 것들은 종종 상처의 자리에서 자랍니다.",
  ],
  default: [
    "깊은 질문은 그 자체로 이미 답의 일부입니다. 당신이 이 질문을 품게 된 계기는 무엇인가요?",
    "우리가 확신하는 것들을 의심해볼 때, 비로소 진정한 사유가 시작됩니다. 당신이 당연하다고 여기는 것 중 다시 생각해볼 것은 무엇인가요?",
    "모든 위대한 사상은 시대의 물음에 대한 응답이었습니다. 지금 당신의 시대가 던지는 가장 절실한 질문은 무엇인가요?",
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
      return NextResponse.json({ response: getFallback(giantSlug), giantSlug });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
      model: "claude-sonnet-4-6",
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
