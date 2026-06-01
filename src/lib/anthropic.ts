import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY ?? "";

// OpenRouter 키 (sk-or-v1-)는 baseURL + 모델명 형식이 다름
export const isOpenRouter = apiKey.startsWith("sk-or-v1-");

export const anthropic = new Anthropic({
  apiKey,
  ...(isOpenRouter
    ? {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://jilmunhaneun-saramdeul.vercel.app",
          "X-Title": "Quesapience",
        },
      }
    : {}),
});

// OpenRouter 모델명 (점 표기법 사용)
export const CHAT_MODEL = isOpenRouter
  ? "anthropic/claude-sonnet-4.5"
  : "claude-sonnet-4-6";

export const FAST_MODEL = isOpenRouter
  ? "anthropic/claude-haiku-4.5"
  : "claude-haiku-4-5-20251001";

/** 모든 AI 라우트에서 사용하는 공통 fetch helper (SDK ByteString 오류 우회) */
export async function callClaude(params: {
  system?: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
  model?: string;
}): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY ?? "";
  if (!key) throw new Error("ANTHROPIC_API_KEY not set");

  const baseURL = isOpenRouter ? "https://openrouter.ai/api/v1" : "https://api.anthropic.com/v1";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${key}`,
  };
  if (isOpenRouter) {
    headers["HTTP-Referer"] = "https://jilmunhaneun-saramdeul.vercel.app";
    headers["X-Title"] = "Quesapience";
  } else {
    headers["x-api-key"] = key;
    headers["anthropic-version"] = "2023-06-01";
  }

  const body: Record<string, unknown> = {
    model: params.model ?? CHAT_MODEL,
    max_tokens: params.maxTokens ?? 800,
    messages: params.messages,
  };
  if (params.system) body.system = params.system;

  const res = await fetch(`${baseURL}/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`API ${res.status}: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  const text = data?.content?.[0]?.text ?? "";
  if (!text) throw new Error("Empty response");
  return text;
}
