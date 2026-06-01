import { NextRequest, NextResponse } from "next/server";
import { anthropic, CHAT_MODEL } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { keyword?: string; context?: string };
    const { keyword, context } = body;

    if (!keyword || typeof keyword !== "string" || keyword.trim().length === 0) {
      return NextResponse.json({ error: "키워드를 입력해주세요." }, { status: 400 });
    }
    if (keyword.trim().length > 100) {
      return NextResponse.json({ error: "키워드는 100자 이하로 입력해주세요." }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(getFallback(keyword));
    }

    const systemPrompt = `당신은 지적이고 깊이 있는 북클럽 발제문을 만드는 전문가입니다. 주어진 키워드와 대화 맥락을 바탕으로 북클럽 발제문을 생성하세요.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "statement": "핵심 발제 문장 (2-3문장)",
  "discussion_questions": ["토론 질문 1", "토론 질문 2", "토론 질문 3"],
  "icebreaker_questions": ["아이스브레이커 질문 1", "아이스브레이커 질문 2"],
  "recommended_books": [
    {"title": "책 제목", "author": "저자명", "description": "추천 이유 한 문장"}
  ]
}`;

    const userPrompt = context
      ? `키워드: ${keyword.trim()}\n\n대화 맥락:\n${context}`
      : `키워드: ${keyword.trim()}`;

    const message = await anthropic.messages.create({
      model: CHAT_MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") throw new Error("no text");

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("no json");

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(getFallback((await request.json().catch(() => ({}))).keyword ?? ""));
  }
}

function getFallback(keyword: string) {
  return {
    statement: `${keyword}은(는) 우리 시대의 중요한 주제입니다. 이 주제를 통해 우리는 삶의 더 깊은 의미를 탐구할 수 있습니다.`,
    discussion_questions: [
      `${keyword}이(가) 당신의 삶에 어떤 영향을 미쳤나요?`,
      `이 주제에 대해 사람들이 가장 오해하는 것은 무엇일까요?`,
      `${keyword}에 대한 당신의 관점이 바뀐 계기가 있었나요?`,
    ],
    icebreaker_questions: [
      `${keyword}을(를) 한 단어로 표현한다면?`,
      `이 주제와 관련된 당신의 첫 번째 기억은 무엇인가요?`,
    ],
    recommended_books: [
      { title: "관련 도서를 탐색 중", author: "", description: "AI 발제 생성을 위해 API 키가 필요합니다." },
    ],
  };
}
