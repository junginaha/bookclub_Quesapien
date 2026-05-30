import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface QuestionExpansion {
  related: string[];
  opposite: string[];
  deepening: string[];
  books: { title: string; author: string; reason: string }[];
}

export async function POST(req: NextRequest) {
  try {
    const { question, description, tags } = await req.json();
    if (!question?.trim()) {
      return NextResponse.json({ error: "질문이 필요합니다." }, { status: 400 });
    }

    const prompt = `당신은 "질문하는 사람들" 북클럽의 AI 질문 분석가입니다.
아래 질문을 분석하여 JSON 형식으로만 응답하세요.

질문: "${question}"
${description ? `보충 설명: "${description}"` : ""}
${tags?.length ? `태그: ${tags.join(", ")}` : ""}

다음 형식으로 정확히 응답하세요:
{
  "related": ["관련 질문 1", "관련 질문 2", "관련 질문 3"],
  "opposite": ["반대 관점의 질문 1", "반대 관점의 질문 2"],
  "deepening": ["심화 질문 1", "심화 질문 2", "심화 질문 3"],
  "books": [
    { "title": "책 제목", "author": "저자", "reason": "추천 이유 1-2문장" },
    { "title": "책 제목", "author": "저자", "reason": "추천 이유 1-2문장" },
    { "title": "책 제목", "author": "저자", "reason": "추천 이유 1-2문장" }
  ]
}

지침:
- 모든 질문은 한국어로, 깊이 있고 사유를 자극하는 열린 질문
- related: 같은 주제를 다른 각도로 탐구
- opposite: 반대 입장이나 역발상으로 접근
- deepening: 더 근본적이거나 심층적인 탐구
- books: 이 질문을 탐구하는 데 도움이 되는 실제 존재하는 책
- JSON 외 다른 텍스트 없이 JSON만 출력`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content.find((c) => c.type === "text");
    if (!text || text.type !== "text") throw new Error("No response");

    const jsonMatch = text.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON");

    const expansion = JSON.parse(jsonMatch[0]) as QuestionExpansion;
    return NextResponse.json(expansion);
  } catch (err) {
    console.error("Question expand error:", err);
    return NextResponse.json({ error: "AI 분석에 실패했습니다." }, { status: 500 });
  }
}
