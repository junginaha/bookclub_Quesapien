import { NextRequest, NextResponse } from "next/server";
import { anthropic, CHAT_MODEL } from "@/lib/anthropic";



export interface ReviewSummary {
  summary: string;
  key_sentences: string[];
  generated_questions: string[];
  related_books: { title: string; author: string }[];
  mood: string;
}

export async function POST(req: NextRequest) {
  try {
    const { reviews, context } = await req.json() as {
      reviews: { content: string; quote?: string }[];
      context?: string;
    };

    if (!reviews?.length) {
      return NextResponse.json({ error: "리뷰가 필요합니다." }, { status: 400 });
    }

    const reviewText = reviews
      .slice(0, 10)
      .map((r, i) => `[후기 ${i + 1}]\n${r.quote ? `인상적인 문장: "${r.quote}"\n` : ""}내용: ${r.content}`)
      .join("\n\n");

    const prompt = `당신은 "질문하는 사람들" 북클럽의 AI 에디터입니다.
아래는 북토크 참가자들이 남긴 후기들입니다.
${context ? `\n컨텍스트: ${context}\n` : ""}

후기들:
${reviewText}

이 후기들을 분석하여 정확히 아래 JSON 형식으로만 응답하세요:
{
  "summary": "3-5문장의 전체 요약. 공통된 통찰과 감동 포인트를 중심으로.",
  "key_sentences": ["가장 인상적인 문장 1", "가장 인상적인 문장 2", "가장 인상적인 문장 3"],
  "generated_questions": ["이 후기들에서 파생된 질문 1", "파생된 질문 2", "파생된 질문 3"],
  "related_books": [
    { "title": "관련 책 제목", "author": "저자" },
    { "title": "관련 책 제목", "author": "저자" }
  ],
  "mood": "이 북토크의 전체적인 분위기를 한 단어로 (예: 따뜻함, 성찰, 긴장, 해방감)"
}

지침:
- 요약은 구체적이고 감성적으로 작성
- 핵심 문장은 후기 원문에서 직접 추출
- 파생 질문은 후기를 읽고 자연스럽게 생성되는 깊은 질문
- JSON 외 텍스트 없이 JSON만 출력`;

    const message = await anthropic.messages.create({
      model: CHAT_MODEL,
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content.find((c) => c.type === "text");
    if (!text || text.type !== "text") throw new Error("No response");

    const jsonMatch = text.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON");

    return NextResponse.json(JSON.parse(jsonMatch[0]) as ReviewSummary);
  } catch (err) {
    console.error("Archive summarize error:", err);
    return NextResponse.json({ error: "AI 요약에 실패했습니다." }, { status: 500 });
  }
}
