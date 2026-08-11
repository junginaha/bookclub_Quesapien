import { NextRequest, NextResponse } from "next/server";
import { isOpenRouter, CHAT_MODEL } from "@/lib/anthropic";

interface Message { role: "user" | "assistant"; content: string; }

const textCache = new Map<string, { title: string; text: string; ts: number }>();
const TTL = 1000 * 60 * 60 * 6;

async function getGutendexText(slug: string, baseUrl: string): Promise<{ title: string; text: string }> {
  const cached = textCache.get(slug);
  if (cached && Date.now() - cached.ts < TTL) return cached;
  try {
    const res = await fetch(`${baseUrl}/api/giant/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (!res.ok) return { title: "", text: "" };
    const data = await res.json();
    const result = { title: data.title ?? "", text: data.text ?? "" };
    if (result.text) textCache.set(slug, { ...result, ts: Date.now() });
    return result;
  } catch { return { title: "", text: "" }; }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      giantSlug: string;
      giantName: string;
      giantData?: { tagline?: string; core_idea?: string; key_works?: string[]; signature_quote?: string };
      messages: Message[];
      wikiSummary?: string;
      useGutendex?: boolean;
    };

    const { giantSlug, giantName, giantData, messages, wikiSummary, useGutendex = true } = body;

    if (!giantSlug || !giantName || !messages?.length) {
      return NextResponse.json({ error: "필수 파라미터 없음" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
    if (!apiKey) {
      return NextResponse.json({ response: getFallback(giantName), limited: true });
    }

    // Gutendex 텍스트 확보
    let gutendexTitle = "";
    let gutendexText = "";
    if (useGutendex) {
      const origin = req.headers.get("origin") ?? req.nextUrl.origin;
      const result = await getGutendexText(giantSlug, origin);
      gutendexTitle = result.title;
      gutendexText = result.text;
    }

    const staticContext = [
      gutendexText ? `[구텐베르크 저서 원문 발췌: "${gutendexTitle}"]\n\n${gutendexText}` : "",
      wikiSummary ? `[공개 자료 요약]\n${wikiSummary.slice(0, 600)}` : "",
      giantData?.core_idea ? `[핵심 사상]\n${giantData.core_idea}` : "",
      `[대표 저서]\n${(giantData?.key_works ?? []).join(", ")}`,
      giantData?.signature_quote ? `[대표 어록]\n"${giantData.signature_quote}"` : "",
    ].filter(Boolean).join("\n\n");

    const systemPrompt = `당신은 ${gutendexTitle ? `구텐베르크 저서 "${gutendexTitle}"를 집필한 ` : ""}${giantName}입니다. 제공된 텍스트 소스를 철저히 고증하여 말투와 철학을 유지하되, 원문이 영문이더라도 우아하고 정제된 한국어로 답변하세요.

${staticContext}

[응답 지침]
1. ${giantName}의 관점으로 자연스럽게 대화하세요.
2. 200-400자 내외. 마지막에 반문 하나를 덧붙이세요.`;

    // 직접 fetch (SDK 대신 — 한글 헤더 ByteString 오류 우회)
    const baseURL = isOpenRouter
      ? "https://openrouter.ai/api/v1"
      : "https://api.anthropic.com/v1";

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

    const requestBody: Record<string, unknown> = {
      model: CHAT_MODEL,
      max_tokens: 800,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    };

    const apiRes = await fetch(`${baseURL}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!apiRes.ok) {
      const errData = await apiRes.json().catch(() => ({}));
      console.error("API error:", apiRes.status, errData);
      return NextResponse.json({ response: getFallback(giantName), limited: true, debug: errData });
    }

    const data = await apiRes.json();
    const text = data?.content?.[0]?.text ?? "";
    if (!text) throw new Error("no text in response");

    return NextResponse.json({
      response: text,
      giantSlug,
      gutendexTitle: gutendexTitle || undefined,
    });

  } catch (err) {
    console.error("Giant chat error:", err);
    return NextResponse.json({ response: getFallback(""), limited: true });
  }
}

function getFallback(name: string): string {
  return `깊은 질문입니다. ${name ? `${name}의 관점에서, ` : ""}좋은 질문은 그 자체로 이미 답의 일부입니다. 당신이 이 질문을 품게 된 계기는 무엇인가요?`;
}
