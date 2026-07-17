"use client";

import { useState } from "react";

export default function GiantsClient() {
  const [input, setInput] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/discussion/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
      });
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      if (!Array.isArray(data.topics) || data.topics.length === 0) throw new Error("empty");
      setTopics(data.topics);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{
      minHeight: "70vh",
      background: "linear-gradient(135deg, var(--bg-ink) 0%, #2D3748 100%)",
      position: "relative",
      overflow: "hidden",
      padding: "80px 0 120px",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 50% at 90% 50%, rgba(176,138,74,0.12), transparent 60%)",
      }} />
      <div style={{
        maxWidth: 640, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)",
        position: "relative", textAlign: "center",
      }}>
        <div style={{
          fontSize: 11.5, letterSpacing: "0.28em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)", fontFamily: '"EB Garamond", Georgia, serif',
          fontStyle: "normal", marginBottom: 24,
        }}>
          On the Shoulders of Giants — 거인의 어깨
        </div>
        <h1 style={{
          fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
          fontSize: "clamp(26px, 4.4vw, 46px)",
          fontWeight: 400,
          lineHeight: 1.35,
          color: "rgba(255,255,255,0.95)",
          marginBottom: 16,
        }}>
          책이나 문장을 남겨보세요.<br />
          위대한 사유자들의 <span style={{ color: "var(--gold)", fontWeight: 600 }}>시선</span>으로
          발제 10개를 만들어드릴게요.
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: 48 }}>
          니체, 칸트, 소크라테스, 도스토옙스키의 통찰을 빌려,<br />
          단순한 감상이 아니라 서로 다른 대답이 나올 수밖에 없는 질문을 만듭니다.
        </p>

        <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="책 제목이나 마음에 걸리는 문장을 적어주세요"
            maxLength={300}
            rows={2}
            style={{
              width: "100%", minHeight: 72, resize: "none",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12, padding: "16px 20px",
              color: "rgba(255,255,255,0.9)",
              fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
              fontSize: 15, outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || status === "loading"}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "16px 32px", borderRadius: 9999,
              background: "var(--cream-on-dark)", color: "var(--bg-ink)",
              fontSize: 14, fontWeight: 500, letterSpacing: "0.02em",
              border: "none",
              cursor: (!input.trim() || status === "loading") ? "not-allowed" : "pointer",
              opacity: (!input.trim() || status === "loading") ? 0.5 : 1,
              transition: "opacity .2s ease, transform .2s ease",
            }}
          >
            {status === "loading" ? (
              <>
                <span style={{
                  display: "inline-block", width: 14, height: 14,
                  border: "2px solid rgba(20,24,31,0.25)", borderTopColor: "var(--bg-ink)",
                  borderRadius: "50%", animation: "spin 0.75s linear infinite",
                }} />
                발제 만드는 중…
              </>
            ) : (
              "발제 10개 생성하기"
            )}
          </button>
          {status === "error" && (
            <p style={{ fontSize: 13, color: "#E08A6B" }}>
              발제를 만드는 중 문제가 생겼어요. 다시 시도해주세요.
            </p>
          )}
        </form>

        {status === "done" && topics.length > 0 && (
          <ol style={{
            listStyle: "none", margin: "48px 0 0", padding: 0,
            display: "flex", flexDirection: "column", gap: 14, textAlign: "left",
          }}>
            {topics.map((topic, idx) => (
              <li key={idx} style={{
                display: "flex", gap: 14, alignItems: "baseline",
                paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.12)",
                fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                fontSize: 15.5, lineHeight: 1.65, color: "rgba(255,255,255,0.9)",
              }}>
                <span style={{
                  fontFamily: '"EB Garamond", Georgia, serif', fontSize: 13,
                  color: "var(--gold)", flexShrink: 0, minWidth: 22,
                }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span>{topic}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
