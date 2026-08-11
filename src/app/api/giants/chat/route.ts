import { NextRequest, NextResponse } from "next/server";
import { isOpenRouter, CHAT_MODEL } from "@/lib/anthropic";

const FALLBACKS: Record<string, string[]> = {
  "friedrich-nietzsche": ["진정한 강함은 자기 자신을 극복하는 데서 나옵니다. 당신은 오늘 무엇을 극복했나요?"],
  "immanuel-kant": ["당신의 행동이 보편적 법칙이 될 수 있다면 그것은 옳습니다."],
  "socrates": ["검토되지 않은 삶은 살 가치가 없습니다. 당신의 삶을 지금 검토해보시겠습니까?"],
  default: ["깊은 질문은 그 자체로 이미 답의 일부입니다. 당신이 이 질문을 품게 된 계기는 무엇인가요?"],
};
function getFallback(slug = "default") {
  const pool = FALLBACKS[slug] ?? FALLBACKS.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function POST(req: NextRequest) {
  let giantSlug = "default";
  try {
    const body = await req.json();
    const { giantName, giantData, messages, wikiSummary } = body;
    giantSlug = body.giantSlug ?? "default";

    if (!giantName || !messages?.length) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
    if (!apiKey) return NextResponse.json({ response: getFallback(giantSlug), giantSlug, limited: true });

    const wikiCtx = wikiSummary ? `\n[Wikipedia]\n${wikiSummary.slice(0, 800)}` : "";
    const system = `당신은 ${giantName}입니다. 실제 저서와 철학적 관점으로 질문에 답하세요.${wikiCtx}\n핵심 사상: ${giantData?.core_idea ?? ""}\n대표 저서: ${(giantData?.key_works ?? []).join(", ")}\n어록: "${giantData?.signature_quote ?? ""}"\n\n[지침] ${giantName}의 관점으로 자연스럽게. 메타 표현 금지. 200-350자. 마지막에 반문.`;

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

    const apiRes = await fetch(`${baseURL}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: CHAT_MODEL,
        max_tokens: 600,
        system,
        messages: messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!apiRes.ok) throw new Error(`API ${apiRes.status}`);
    const data = await apiRes.json();
    const text = data?.content?.[0]?.text ?? "";
    if (!text) throw new Error("no text");
    return NextResponse.json({ response: text, giantSlug });
  } catch (err) {
    console.error("Giants chat error:", err);
    return NextResponse.json({ response: getFallback(giantSlug), giantSlug });
  }
}
