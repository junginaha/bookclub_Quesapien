"use client";

import { useState } from "react";
import { Sparkles, Loader2, MessageSquare, BookOpen, Quote } from "lucide-react";
import type { ReviewSummary } from "@/app/api/archive/summarize/route";

interface AIReviewSummaryProps {
  reviews: { content: string; quote?: string }[];
  context?: string;
}

export default function AIReviewSummary({ reviews, context }: AIReviewSummaryProps) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (summary) { setOpen((o) => !o); return; }
    if (!reviews.length) return;
    setOpen(true);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/archive/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews: reviews.slice(0, 10), context }),
      });
      if (!res.ok) throw new Error();
      setSummary(await res.json() as ReviewSummary);
    } catch {
      setError("AI 요약에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!reviews.length) return null;

  return (
    <div style={{ marginBottom: 32, borderRadius: 14, border: "1px solid var(--line-soft)", overflow: "hidden", background: "rgba(255,255,255,0.35)" }}>
      <button
        onClick={load}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <Sparkles size={14} style={{ color: "var(--gold)", flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", flex: 1 }}>AI 후기 요약</span>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{reviews.length}개 후기 분석</span>
        {loading && <Loader2 size={13} style={{ color: "var(--muted)", animation: "spin 1s linear infinite" }} />}
      </button>

      {open && (
        <div style={{ borderTop: "1px solid var(--line-soft)", padding: "20px" }}>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", fontSize: 13.5 }}>
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> 후기를 분석하고 있습니다…
            </div>
          )}
          {error && <p style={{ fontSize: 13, color: "#EF4444" }}>{error}</p>}
          {summary && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Mood badge */}
              {summary.mood && (
                <span style={{ alignSelf: "flex-start", fontSize: 11.5, padding: "4px 12px", borderRadius: 9999, background: "var(--bg-warm)", color: "var(--muted)", letterSpacing: "0.06em" }}>
                  분위기: {summary.mood}
                </span>
              )}
              {/* Summary */}
              <p style={{ fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.85 }}>{summary.summary}</p>

              {/* Key sentences */}
              {summary.key_sentences?.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted-2)", marginBottom: 10 }}>
                    <Quote size={11} /> 핵심 문장
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {summary.key_sentences.map((s, i) => (
                      <blockquote key={i} style={{ margin: 0, padding: "10px 14px", borderLeft: "2px solid var(--accent)", fontFamily: "var(--font-noto-serif-kr),Georgia,serif", fontSize: 13.5, color: "var(--ink)", fontStyle: "italic", lineHeight: 1.7 }}>
                        &ldquo;{s}&rdquo;
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated questions */}
              {summary.generated_questions?.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted-2)", marginBottom: 10 }}>
                    <MessageSquare size={11} /> 파생 질문
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {summary.generated_questions.map((q, i) => (
                      <div key={i} style={{ fontSize: 13.5, color: "var(--ink-soft)", padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.5)", border: "1px solid var(--line-soft)", lineHeight: 1.6 }}>
                        {q}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related books */}
              {summary.related_books?.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted-2)", marginBottom: 10 }}>
                    <BookOpen size={11} /> 관련 책
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {summary.related_books.map((b, i) => (
                      <span key={i} style={{ fontSize: 12.5, padding: "5px 12px", borderRadius: 9999, background: "var(--bg-soft)", border: "1px solid var(--line-soft)", color: "var(--ink-soft)" }}>
                        {b.title} <span style={{ color: "var(--muted)" }}>— {b.author}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
