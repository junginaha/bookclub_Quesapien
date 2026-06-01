import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface Message { role: "user" | "assistant"; content: string; }

interface AgendaResult {
  agenda1: string;
  agenda2: string;
  advice: string;
}

export async function POST(req: NextRequest) {
  try {
    const { giantName, giantSlug, messages } = await req.json() as {
      giantName: string;
      giantSlug: string;
      messages: Message[];
    };

    if (!giantName || !messages || messages.length < 2) {
      return NextResponse.json({ error: "대화 내역 부족 (최소 2회)" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(getFallbackAgenda(giantName));
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const conversationText = messages
      .map((m) => `${m.role === "user" ? "유저" : giantName}: ${m.content}`)
      .join("\n\n");

    // Tool call로 Structured Output 강제
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001", // 저렴한 모델로 논제 추출
      max_tokens: 400,
      system: `당신은 ${giantName}의 사상을 바탕으로 유저의 사유를 확장하는 소크라테스식 질문을 생성하는 전문가입니다.`,
      messages: [
        {
          role: "user",
          content: `다음 대화를 분석하여 유저의 사유를 확장할 소크라테스식 논제 2가지와 나침반 조언 1가지를 도출하세요.

[대화 내역]
${conversationText}

아래 JSON 형식으로만 응답하세요:
{
  "agenda1": "첫 번째 소크라테스식 논제 (질문 형식, 30자 이내)",
  "agenda2": "두 번째 소크라테스식 논제 (질문 형식, 30자 이내)",
  "advice": "${giantName}의 관점에서 주는 나침반 조언 (60자 이내)"
}`,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") throw new Error("no content");

    // JSON 파싱 (robust)
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("no json");

    const result: AgendaResult = JSON.parse(jsonMatch[0]);
    if (!result.agenda1 || !result.agenda2 || !result.advice) throw new Error("incomplete json");

    return NextResponse.json(result);

  } catch (err) {
    console.error("Agenda error:", err);
    return NextResponse.json(getFallbackAgenda(""));
  }
}

function getFallbackAgenda(name: string): AgendaResult {
  return {
    agenda1: "당신이 가장 확신하는 것을 의심해본 적 있나요?",
    agenda2: "이 대화 이후 당신의 행동은 달라질까요?",
    advice: `${name ? `${name}은 말합니다: ` : ""}생각은 행동이 될 때 완성됩니다.`,
  };
}

