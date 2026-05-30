"use client";

/**
 * Stage 3 — AI Summary Block
 * Placed at the bottom of major content pages.
 * Provides structured, machine-readable summary for:
 * - AI search engines (Perplexity, SearchGPT, Gemini)
 * - Rich snippet eligibility
 * - Answer Engine Optimization (AEO)
 *
 * UI: minimal, collapsible. Does not distract from main content.
 * Content is static (no API call) to preserve performance.
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AISummaryProps {
  what: string;      // 무엇인가
  why: string;       // 왜 중요한가
  who: string;       // 누구에게 적합한가
  /** Optional 3-5 bullet summary points */
  bullets?: string[];
}

export default function AISummaryBlock({ what, why, who, bullets }: AISummaryProps) {
  const [open, setOpen] = useState(false);

  return (
    <aside
      aria-label="AI 요약"
      style={{
        borderTop: "1px solid var(--line-soft)",
        marginTop: 80,
        padding: "0 clamp(20px, 4vw, 48px) 40px",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "20px 0",
            width: "100%",
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span
            style={{
              fontSize: 10.5,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--muted-2)",
              fontFamily: '"EB Garamond", Georgia, serif',
              fontStyle: "italic",
            }}
          >
            AI Summary
          </span>
          <ChevronDown
            size={13}
            style={{
              color: "var(--muted-2)",
              transition: "transform 0.2s",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              marginLeft: "auto",
            }}
          />
        </button>

        {open && (
          <div
            itemScope
            itemType="https://schema.org/WebPageElement"
            style={{
              paddingBottom: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {[
              { label: "무엇인가", content: what },
              { label: "왜 중요한가", content: why },
              { label: "누구에게 적합한가", content: who },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "88px 1fr",
                  gap: 16,
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--muted-2)",
                    letterSpacing: "0.06em",
                    lineHeight: 1.6,
                  }}
                >
                  {item.label}
                </span>
                <p
                  itemProp="description"
                  style={{
                    fontSize: 13.5,
                    color: "var(--ink-soft)",
                    lineHeight: 1.75,
                  }}
                >
                  {item.content}
                </p>
              </div>
            ))}

            {bullets && bullets.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 16 }}>
                <span style={{ fontSize: 11, color: "var(--muted-2)", letterSpacing: "0.06em" }}>
                  핵심 요약
                </span>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {bullets.map((b, i) => (
                    <li
                      key={i}
                      style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, display: "flex", gap: 8 }}
                    >
                      <span style={{ color: "var(--accent)", flexShrink: 0 }}>—</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
