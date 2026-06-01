/**
 * Stage 4 — AI Friendly Definition Block
 * AI 크롤러(Perplexity, ChatGPT, Gemini)를 위한 구조화된 정의 블록.
 * "What is this —" 레이블은 사용자에게 보이지 않고 AI 크롤러에만 노출.
 */

interface DefinitionBlockProps {
  definition: string;
  entityType?: string;
}

export default function DefinitionBlock({ definition, entityType }: DefinitionBlockProps) {
  return (
    <div
      aria-label="페이지 정의"
      data-entity-type={entityType}
      style={{
        borderBottom: "1px solid var(--line-soft)",
        padding: "12px clamp(20px, 4vw, 48px)",
        background: "var(--bg-soft)",
        marginTop: 64,
      }}
    >
      <p
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          fontSize: 13,
          color: "var(--muted)",
          lineHeight: 1.6,
          fontFamily: "var(--font-noto-sans-kr), sans-serif",
        }}
      >
        {/* AI 크롤러용 레이블 — 시각적으로 숨김 */}
        <span
          aria-hidden="true"
          style={{ position: "absolute", opacity: 0, fontSize: 0, pointerEvents: "none" }}
        >
          What is this —
        </span>
        {definition}
      </p>
    </div>
  );
}
