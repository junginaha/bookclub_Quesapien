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
          "X-Title": "질문하는 사람들",
        },
      }
    : {}),
});

// OpenRouter는 "anthropic/" 접두사 + 최신 모델명
export const CHAT_MODEL = isOpenRouter
  ? "anthropic/claude-sonnet-4-5"
  : "claude-sonnet-4-6";

export const FAST_MODEL = isOpenRouter
  ? "anthropic/claude-haiku-4-5"
  : "claude-haiku-4-5-20251001";
