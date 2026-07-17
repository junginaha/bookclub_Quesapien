import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/anthropic";
import { GIANTS } from "@/data/giants";

interface DiscussionGenerateResult {
  topics: string[];
  limited?: boolean;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { input?: string };
  const input = typeof body.input === "string" ? body.input.trim().slice(0, 300) : "";

  if (!input) {
    return NextResponse.json({ error: "책 제목이나 문장을 입력해주세요." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(getFallback(input));
  }

  try {
    const roster = GIANTS.map((g) => g.name).join(", ");

    const systemPrompt = `당신은 다음 위대한 사유자·창조자들의 사상에 정통한 북클럽 발제 전문가입니다: ${roster}.
사용자가 입력한 책 제목이나 문장을 바탕으로, 이 인물들 중 실제로 그 내용과 가장 날카롭게 맞닿는 몇 명을 골라, 그들의 통찰과 교차시킨 지적으로 깊이 있는 발제 질문 10개를 만드세요.

원칙:
- 각 질문은 서로 다른 사유자의 관점이나 사상을 자연스럽게 녹여내되, 매 질문마다 특정 인물 이름을 나열하지 말고 통찰 자체를 질문에 녹이세요.
- 뻔하고 일반적인 질문("행복이란 무엇인가?" 류)을 피하고, 참가자들이 서로 다른 대답을 할 수밖에 없는 구체적이고 개인적인 질문을 만드세요.
- 입력이 책 제목이면 그 책의 실제 내용·주제와 연결하고, 문장이면 그 문장이 던지는 함의를 파고드세요.
- 질문은 한국어로, 한 문장씩, 존댓말로 작성하세요.

반드시 다음 JSON 형식으로만 응답하세요:
{"topics": ["발제 질문 1", "발제 질문 2", "발제 질문 3", "발제 질문 4", "발제 질문 5", "발제 질문 6", "발제 질문 7", "발제 질문 8", "발제 질문 9", "발제 질문 10"]}`;

    const text = await callClaude({
      system: systemPrompt,
      messages: [{ role: "user", content: `입력: ${input}` }],
      maxTokens: 1400,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("no json");
    const parsed = JSON.parse(jsonMatch[0]) as DiscussionGenerateResult;
    if (!Array.isArray(parsed.topics) || parsed.topics.length === 0) throw new Error("incomplete");

    return NextResponse.json({ topics: parsed.topics.slice(0, 10) });
  } catch (err) {
    console.error("Discussion generate error:", err);
    return NextResponse.json(getFallback(input));
  }
}

function getFallback(input: string): DiscussionGenerateResult {
  return {
    limited: true,
    topics: [
      `「${input}」에서 당신이 가장 동의하기 어려웠던 지점은 어디인가요?`,
      `이 이야기 속 인물 중 지금의 당신과 가장 닮은 사람은 누구인가요?`,
      `「${input}」이 던지는 질문을 당신의 삶에 그대로 옮겨온다면 어떤 장면이 떠오르나요?`,
      `이 안에서 가장 낯설게 느껴졌던 가치관은 무엇이었나요?`,
      `당신이라면 이 이야기의 결말을 어떻게 다시 썼을까요?`,
      `이 책(문장)을 10년 전의 당신에게 보여준다면, 그때의 당신은 어떻게 반응했을까요?`,
      `「${input}」에서 침묵하고 있는, 하지만 꼭 물었어야 했던 질문은 무엇일까요?`,
      `당신의 경험 중 이 이야기와 가장 가깝게 맞닿은 순간은 언제인가요?`,
      `이 이야기가 옳다고 말하는 것과 당신이 옳다고 믿는 것이 갈라지는 지점은 어디인가요?`,
      `지금 이 자리에 있는 사람들과 이 질문을 나눈다면, 가장 듣고 싶은 대답은 누구의 것인가요?`,
    ],
  };
}
