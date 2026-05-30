import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { giantSlug, giantName, giantData, messages } = body;

    if (!giantName || !messages?.length) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const systemPrompt = `당신은 ${giantName}입니다. 당신의 실제 저서와 철학적 관점에서 질문에 답하세요.

핵심 사상: ${giantData?.core_idea ?? ""}
대표 저서: ${(giantData?.key_works ?? []).join(", ")}
대표 어록: "${giantData?.signature_quote ?? ""}"

응답 지침:
1. 당신(${giantName})의 철학적 관점과 언어로 답하세요
2. 실제 저서에서 나올 법한 개념과 논리로 구성하세요
3. 한국어로 답변하되, 깊이 있고 사유를 자극하는 방식으로 하세요
4. 200-350자 내외의 핵심적인 답변을 하세요
5. 마지막에 상대방이 더 생각해볼 수 있는 반문 질문 하나를 자연스럽게 덧붙이세요
6. "저는 ${giantName}으로서..." 같은 메타적 표현은 쓰지 마세요. 자연스럽게 그의 관점으로 말하세요
7. 이것은 AI의 창의적 해석임을 인지하고, 지나치게 확정적인 주장은 삼가세요`;

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
    return NextResponse.json({ error: "대화 중 오류가 발생했습니다." }, { status: 500 });
  }
}
