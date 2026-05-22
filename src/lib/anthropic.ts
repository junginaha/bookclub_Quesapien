import Anthropic from "@anthropic-ai/sdk";
import type { AIGenerateResponse } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateBookClubContent(
  keyword: string
): Promise<AIGenerateResponse> {
  const prompt = `당신은 "질문하는 사람들" 북클럽의 AI 발제 생성 도우미입니다.
사용자가 제공한 키워드를 바탕으로 깊이 있는 북클럽 발제 자료를 생성해주세요.

키워드: "${keyword}"

다음 형식의 JSON으로만 응답해주세요:
{
  "statement": "발제문 (2-3문장, 깊이 있고 사유를 자극하는 문장)",
  "discussion_questions": [
    "토론 질문 1",
    "토론 질문 2",
    "토론 질문 3"
  ],
  "recommended_books": [
    {
      "id": "ai_b1",
      "title": "책 제목",
      "author": "저자명",
      "description": "이 책을 추천하는 이유 (1-2문장)"
    }
  ],
  "icebreaker_questions": [
    "아이스브레이킹 질문 1",
    "아이스브레이킹 질문 2"
  ]
}

발제문은 한국어로, 철학적이고 감성적으로 작성해주세요.
토론 질문은 단순한 예/아니오가 아닌 깊은 사유를 유도하는 열린 질문이어야 합니다.
아이스브레이킹 질문은 가볍지만 대화의 물꼬를 트는 질문이어야 합니다.`;

  const message = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const textContent = message.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("AI 응답을 받지 못했습니다.");
  }

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI 응답 형식이 올바르지 않습니다.");
  }

  return JSON.parse(jsonMatch[0]) as AIGenerateResponse;
}
