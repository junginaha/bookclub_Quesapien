import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface Message { role: "user" | "assistant"; content: string; }

// 인메모리 텍스트 캐시 (init route와 공유하지 않아도 됨 — 별도 호출)
const textCache = new Map<string, { title: string; text: string; ts: number }>();
const TTL = 1000 * 60 * 60 * 6; // 6h

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
  } catch {
    return { title: "", text: "" };
  }
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

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ response: getFallback(giantName), limited: true });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Gutendex 텍스트 확보 (캐시 or 신규 호출)
    let gutendexTitle = "";
    let gutendexText = "";
    if (useGutendex) {
      const origin = req.headers.get("origin") ?? req.nextUrl.origin;
      const result = await getGutendexText(giantSlug, origin);
      gutendexTitle = result.title;
      gutendexText = result.text;
    }

    // System Prompt 조합 (프롬프트 캐싱 적용을 위해 정적 부분 앞에 배치)
    const staticContext = [
      gutendexText
        ? `[구텐베르크 저서 원문 발췌: "${gutendexTitle}"]\n\n${gutendexText}`
        : "",
      wikiSummary ? `[공개 자료 요약]\n${wikiSummary.slice(0, 600)}` : "",
      giantData?.core_idea ? `[핵심 사상]\n${giantData.core_idea}` : "",
      `[대표 저서]\n${(giantData?.key_works ?? []).join(", ")}`,
      giantData?.signature_quote ? `[대표 어록]\n"${giantData.signature_quote}"` : "",
    ].filter(Boolean).join("\n\n");

    const systemPrompt = `당신은 ${gutendexTitle ? `구텐베르크 저서 "${gutendexTitle}"를 집필한 ` : ""}${giantName}입니다. 제공된 텍스트 소스를 철저히 고증하여 말투와 철학을 유지하되, 원문이 영문이더라도 유저에게는 우아하고 정제된 대한민국 표준어(한글 맞춤법 최신 규정 반영)로 자연스럽게 번역·윤문하여 답변하세요.

${staticContext}

[응답 지침]
1. ${giantName}의 관점과 언어로 자연스럽게 대화하세요. "저는 ${giantName}으로서..." 같은 메타 표현은 금지.
2. 저서 내용을 근거로 구체적인 개념과 논리를 사용하세요.
3. 답변은 200-400자 내외. 마지막에 사유를 확장하는 반문 하나를 자연스럽게 덧붙이세요.
4. 지나치게 확정적 주장은 삼가세요.`;

    // Anthropic SDK (프롬프트 캐싱 — system 부분을 캐시)
    const anthropicMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: [
        {
          type: "text" as const,
          text: systemPrompt,
          // 프롬프트 캐싱 (긴 시스템 프롬프트 비용 절감)
          ...(gutendexText.length > 1000 ? { cache_control: { type: "ephemeral" as const } } : {}),
        },
      ],
      messages: anthropicMessages,
    });

    const text = response.content.find((c) => c.type === "text");
    if (!text || text.type !== "text") throw new Error("no text");

    return NextResponse.json({
      response: text.text,
      giantSlug,
      gutendexTitle: gutendexTitle || undefined,
      inputTokens: response.usage?.input_tokens,
      cacheCreated: (response.usage as { cache_creation_input_tokens?: number })?.cache_creation_input_tokens,
      cacheRead: (response.usage as { cache_read_input_tokens?: number })?.cache_read_input_tokens,
    });

  } catch (err) {
    console.error("Giant chat error:", err);
    return NextResponse.json({ response: getFallback(""), limited: true });
  }
}

function getFallback(name: string): string {
  return `깊은 질문입니다. ${name ? `${name}의 관점에서 말씀드리면, ` : ""}좋은 질문은 그 자체로 이미 답의 일부입니다. 당신이 이 질문을 품게 된 계기는 무엇인가요?`;
}
