/**
 * Stage 4 — AI Friendly Definition Block
 * Placed at top of each main section page.
 * Provides a single factual sentence that AI crawlers (Perplexity, ChatGPT, Gemini)
 * can use as a concise definition. Minimal UI, information-first.
 */

interface DefinitionBlockProps {
  definition: string;
  /** Optional machine-readable entity type */
  entityType?: string;
}

export default function DefinitionBlock({ definition, entityType }: DefinitionBlockProps) {
  return (
    <div
      aria-label="페이지 정의"
      data-entity-type={entityType}
      style={{
        borderBottom: "1px solid var(--line-soft)",
        padding: "14px clamp(20px, 4vw, 48px)",
        background: "var(--bg-soft)",
        marginTop: 64,
      }}
    >
      <p
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          fontSize: 13.5,
          color: "var(--muted)",
          lineHeight: 1.6,
          fontFamily: "var(--font-noto-sans-kr), sans-serif",
        }}
      >
        <span
          style={{
            fontSize: 10.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginRight: 10,
            color: "var(--muted-2)",
            fontFamily: '"EB Garamond", Georgia, serif',
            fontStyle: "italic",
          }}
        >
          What is this —
        </span>
        {definition}
      </p>
    </div>
  );
}
