"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function AskSection() {
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error("질문을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setQuestion("");
    toast.success("질문이 남겨졌습니다. 감사합니다.");
  };

  return (
    <section
      id="ask"
      style={{
        background: "var(--bg-ink)",
        paddingTop: "96px",
        paddingBottom: "96px",
        paddingLeft: "var(--gutter)",
        paddingRight: "var(--gutter)",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <p
            className="eyebrow"
            style={{ color: "rgba(163,154,140,0.7)", marginBottom: "16px" }}
          >
            Ask — 질문 남기기
          </p>
          <h2
            style={{
              fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
              fontWeight: 300,
              fontSize: "clamp(24px, 3.2vw, 44px)",
              color: "var(--cream-on-dark)",
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
            }}
          >
            당신의 질문을 남겨주세요
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Pen label */}
          <p
            style={{
              fontFamily: "\"EB Garamond\", Georgia, serif",
              fontStyle: "italic",
              fontSize: "13px",
              color: "rgba(163,154,140,0.7)",
              marginBottom: "10px",
              letterSpacing: "0.06em",
            }}
          >
            당신의 질문
          </p>

          {/* Textarea */}
          <div style={{ position: "relative", marginBottom: "24px" }}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="당신 마음속에 오래 남아있던 질문은 무엇인가요?"
              rows={6}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: focused
                  ? "1px solid var(--gold)"
                  : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "4px",
                padding: "20px 24px",
                fontSize: "16px",
                color: "var(--cream-on-dark)",
                fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                fontWeight: 300,
                lineHeight: 1.7,
                resize: "vertical",
                outline: "none",
                transition: "border-color 0.25s, box-shadow 0.25s",
                boxShadow: focused
                  ? "0 0 0 3px rgba(176,138,74,0.15)"
                  : "none",
              }}
            />
            <style>{`
              textarea::placeholder {
                color: rgba(163,154,140,0.45);
              }
            `}</style>
          </div>

          {/* Submit */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontFamily: "\"EB Garamond\", Georgia, serif",
                fontStyle: "italic",
                fontSize: "14px",
                color: "rgba(163,154,140,0.55)",
              }}
            >
              — 좋은 질문은 누군가를 살립니다.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="btn-cream-pill"
              style={{
                fontSize: "14px",
                padding: "12px 28px",
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "제출 중..." : "질문 남기기"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
