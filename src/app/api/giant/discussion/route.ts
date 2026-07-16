import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/anthropic";

interface Message { role: "user" | "assistant"; content: string; }

interface DiscussionResult {
  statement: string;
  discussion_questions: string[];
  icebreaker_questions: string[];
  recommended_books: { title: string; author: string; description: string }[];
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as {
    giantName?: string;
    giantCoreIdea?: string;
    giantKeyWorks?: string[];
    bookTitle?: string;
    topic?: string;
    context?: Message[];
  };

  const giantName = typeof body.giantName === "string" ? body.giantName.trim() : "";
  const bookTitle = typeof body.bookTitle === "string" ? body.bookTitle.trim().slice(0, 200) : "";
  const topic = typeof body.topic === "string" ? body.topic.trim().slice(0, 200) : "";

  if (!giantName) {
    return NextResponse.json({ error: "인물 정보가 없습니다." }, { status: 400 });
  }
  if (!bookTitle && !topic) {
    return NextResponse.json({ error: "책 제목이나 주제 중 하나는 입력해주세요." }, { status: 400 });
  }

  try {
    const contextText = Array.isArray(body.context) && body.context.length > 0
      ? body.context.slice(-12).map((m) => `${m.role === "user" ? "참가자" : giantName}: ${m.content}`).join("\n")
      : "";

    const focusLines = [
      bookTitle ? `함께 읽는 책: 「${bookTitle}」` : null,
      topic ? `다루고 싶은 주제: ${topic}` : null,
      body.giantCoreIdea ? `${giantName}의 핵심 사상: ${body.giantCoreIdea}` : null,
      Array.isArray(body.giantKeyWorks) && body.giantKeyWorks.length > 0
        ? `${giantName}의 대표 저서: ${body.giantKeyWorks.join(", ")}` : null,
    ].filter(Boolean).join("\n");

    const userPrompt = [
      focusLines,
      contextText ? `\n[참고할 이전 대화]\n${contextText}` : "",
    ].filter(Boolean).join("\n");

    const systemPrompt = `당신은 ${giantName}의 사상과 저작에 정통한 북클럽 발제 전문가입니다.
${bookTitle ? `이번 발제는 반드시 「${bookTitle}」의 구체적인 내용·장면·개념을 인용하거나 직접 언급하며 ${giantName}의 사상과 교차시켜야 합니다. 책과 무관한 일반론은 피하세요.` : ""}
${topic ? `제시된 주제(${topic})를 피상적으로 다루지 말고, ${giantName}의 사상 중 이 주제와 가장 날카롭게 부딪히는 지점을 찾아 발제에 담으세요.` : ""}
뻔하고 일반적인 질문("행복이란 무엇인가?" 류)을 피하고, 참가자들이 서로 다른 대답을 할 수밖에 없는 구체적이고 개인적인 질문을 만드세요.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "statement": "핵심 발제 문장 (3-4문장, ${giantName}의 사상과 ${bookTitle || "주제"}를 구체적으로 연결)",
  "discussion_questions": ["토론 질문 1", "토론 질문 2", "토론 질문 3", "토론 질문 4"],
  "icebreaker_questions": ["아이스브레이커 질문 1", "아이스브레이커 질문 2"],
  "recommended_books": [{"title": "책 제목", "author": "저자명", "description": "이 발제와 연결되는 이유 한 문장"}]
}`;

    const text = await callClaude({
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      maxTokens: 1200,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("no json");
    const result = JSON.parse(jsonMatch[0]) as DiscussionResult;
    if (!result.statement || !Array.isArray(result.discussion_questions)) throw new Error("incomplete");

    return NextResponse.json(result);
  } catch (err) {
    console.error("Giant discussion generation error:", err);
    return NextResponse.json(getFallback(giantName, bookTitle, topic));
  }
}

function getFallback(giantName: string, bookTitle: string, topic: string): DiscussionResult {
  const focus = bookTitle || topic || "이 주제";
  return {
    statement: `${giantName}의 사상으로 「${focus}」를 다시 읽어봅니다. 지금은 발제를 만드는 중 문제가 생겼어요 — 잠시 후 다시 시도해주세요.`,
    discussion_questions: [
      `${focus}에서 ${giantName}이라면 가장 먼저 무엇을 물었을까요?`,
      `당신의 경험 중 이 주제와 가장 가깝게 맞닿은 순간은 언제인가요?`,
      `${giantName}의 관점에 동의하지 않는 지점이 있다면 무엇인가요?`,
    ],
    icebreaker_questions: [`${focus}을(를) 한 문장으로 표현한다면?`],
    recommended_books: [],
  };
}
