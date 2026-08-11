import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY ?? "";
  const isOpenRouter = key.startsWith("sk-or-v1-");

  let testResult = "미테스트";
  if (key.length > 0) {
    try {
      const baseURL = isOpenRouter
        ? "https://openrouter.ai/api/v1"
        : "https://api.anthropic.com";
      const model = isOpenRouter
        ? "anthropic/claude-sonnet-4.5"
        : "claude-sonnet-4-6";

      const headers: Record<string, string> = {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      };
      if (isOpenRouter) {
        headers["HTTP-Referer"] = "https://jilmunhaneun-saramdeul.vercel.app";
        headers["X-Title"] = "Qsapiens";
      } else {
        headers["x-api-key"] = key;
        headers["anthropic-version"] = "2023-06-01";
      }

      const res = await fetch(`${baseURL}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          max_tokens: 30,
          messages: [{ role: "user", content: "안녕" }],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const text = data?.content?.[0]?.text ?? JSON.stringify(data).slice(0, 80);
        testResult = `✓ 성공 — "${text}"`;
      } else {
        testResult = `✗ ${res.status}: ${JSON.stringify(data).slice(0, 200)}`;
      }
    } catch (e) {
      testResult = `✗ 예외: ${String(e).slice(0, 150)}`;
    }
  }

  return NextResponse.json({ hasKey: key.length > 0, keyPrefix: key.slice(0, 12), isOpenRouter, testResult });
}
