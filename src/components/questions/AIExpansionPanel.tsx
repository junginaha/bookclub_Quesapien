"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronRight, BookOpen, Loader2 } from "lucide-react";
import type { QuestionExpansion } from "@/app/api/questions/expand/route";

interface AIExpansionPanelProps {
  questionId: string;
  questionTitle: string;
  description?: string;
  tags?: string[];
}

const SECTION_CONFIG: {
  key: keyof Omit<QuestionExpansion, "books">;
  label: string;
  color: string;
  prefix: string;
}[] = [
  { key: "related", label: "관련 질문", color: "#5E4632", prefix: "—" },
  { key: "opposite", label: "반대 질문", color: "#2C5364", prefix: "↔" },
  { key: "deepening", label: "심화 질문", color: "#4A5568", prefix: "▽" },
];

export default function AIExpansionPanel({
  questionTitle,
  description,
  tags,
}: AIExpansionPanelProps) {
  const [expansion, setExpansion] = useState<QuestionExpansion | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (expansion) { setOpen((o) => !o); return; }
    setOpen(true);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/questions/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionTitle, description, tags }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json() as QuestionExpansion;
      setExpansion(data);
    } catch {
      setError("AI 분석에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      marginTop: 32,
      borderRadius: 16,
      border: "1px solid var(--line-soft)",
      overflow: "hidden",
      background: "rgba(255,255,255,0.4)",
    }}>
      {/* Header — trigger */}
      <button
        onClick={load}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "18px 24px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <Sparkles size={15} style={{ color: "var(--gold)", flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 15, fontWeight: 500, color: "var(--ink)", flex: 1 }}>
          AI 질문 확장
        </span>
        <span style={{ fontSize: 11.5, color: "var(--muted)" }}>관련 · 반대 · 심화 · 책 추천</span>
        {loading
          ? <Loader2 size={14} style={{ color: "var(--muted)", animation: "spin 1s linear infinite", flexShrink: 0 }} />
          : <ChevronDown size={14} style={{ color: "var(--muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
        }
      </button>

      {/* Content */}
      {open && (
        <div style={{ borderTop: "1px solid var(--line-soft)", padding: "24px" }}>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)", fontSize: 14 }}>
              <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
              이 질문을 분석하고 있습니다…
            </div>
          )}

          {error && (
            <p style={{ fontSize: 13.5, color: "#EF4444" }}>{error}</p>
          )}

          {expansion && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {/* Related / Opposite / Deepening */}
              {SECTION_CONFIG.map(({ key, label, color, prefix }) => (
                <div key={key}>
                  <div style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted-2)", marginBottom: 12 }}>
                    {label}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(expansion[key] as string[]).map((q, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          padding: "12px 16px",
                          borderRadius: 10,
                          background: "rgba(255,255,255,0.5)",
                          border: "1px solid var(--line-soft)",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "white"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.5)"; }}
                      >
                        <span style={{ fontSize: 14, color, flexShrink: 0, marginTop: 1, fontWeight: 600 }}>{prefix}</span>
                        <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.65, flex: 1 }}>{q}</p>
                        <ChevronRight size={13} style={{ color: "var(--muted)", flexShrink: 0, marginTop: 2 }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Book recommendations */}
              {expansion.books?.length > 0 && (
                <div>
                  <div style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted-2)", marginBottom: 12 }}>
                    책 추천
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {expansion.books.map((book, i) => (
                      <div key={i} style={{
                        display: "flex",
                        gap: 14,
                        padding: "14px 16px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.5)",
                        border: "1px solid var(--line-soft)",
                      }}>
                        <BookOpen size={15} style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 14, fontWeight: 500, color: "var(--ink)", marginBottom: 2 }}>
                            {book.title}
                            <span style={{ fontWeight: 400, color: "var(--muted)", marginLeft: 6 }}>— {book.author}</span>
                          </div>
                          <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6 }}>{book.reason}</p>
                        </div>
                      </div>
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
