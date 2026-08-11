import { NextRequest, NextResponse } from "next/server";
import { isOpenRouter, CHAT_MODEL } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as { keyword?: string; context?: string };
  const { keyword, context } = body;

  if (!keyword || typeof keyword !== "string" || keyword.trim().length === 0) {
    return NextResponse.json({ error: "키워드를 입력해주세요." }, { status: 400 });
  }
  if (keyword.trim().length > 100) {
    return NextResponse.json({ error: "키워드는 100자 이하로 입력해주세요." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!apiKey) return NextResponse.json(getFallback(keyword));

  const systemPrompt = `당신은 깊이 있는 북클럽 발제문을 만드는 전문가입니다.

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

  try {
    const baseURL = isOpenRouter ? "https://openrouter.ai/api/v1" : "https://api.anthropic.com/v1";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    };
    if (isOpenRouter) {
      headers["HTTP-Referer"] = "https://jilmunhaneun-saramdeul.vercel.app";
      headers["X-Title"] = "Qsapiens";
    } else {
      headers["x-api-key"] = apiKey;
      headers["anthropic-version"] = "2023-06-01";
    }

    const res = await fetch(`${baseURL}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: CHAT_MODEL,
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const text = data?.content?.[0]?.text ?? "";
    if (!text) throw new Error("no text");

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("no json");
    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error("AI generation error:", err);
    return NextResponse.json(getFallback(keyword));
  }
}

function getFallback(keyword: string) {
  return {
    statement: `${keyword}은(는) 우리 삶과 깊이 연결된 주제입니다. 함께 탐구하며 새로운 시각을 발견해봐요.`,
    discussion_questions: [
      `${keyword}이(가) 당신의 삶에 어떤 영향을 미쳤나요?`,
      `이 주제에 대해 가장 오해받는 점은 무엇일까요?`,
      `${keyword}에 대한 당신의 관점이 바뀐 계기가 있었나요?`,
    ],
    icebreaker_questions: [
      `${keyword}을(를) 한 단어로 표현한다면?`,
      `이 주제와 관련된 당신의 첫 번째 기억은 무엇인가요?`,
    ],
    recommended_books: [
      { title: `${keyword} 관련 도서`, author: "", description: "북클럽 추천 도서를 탐색해보세요." },
    ],
  };
}
