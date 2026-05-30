/**
 * Stage 5 — Internal Link Optimization
 * Renders related content links for Question Graph foundation.
 * - Minimal UI: small text links, no heavy components
 * - Server-renderable (no client hooks)
 * - Provides topical authority signals to crawlers
 */

import Link from "next/link";

export interface RelatedItem {
  label: string;
  href: string;
  type: "question" | "book" | "review" | "booktalk" | "giant" | "leader";
}

interface RelatedLinksProps {
  items: RelatedItem[];
  title?: string;
}

const TYPE_LABELS: Record<RelatedItem["type"], string> = {
  question: "Q",
  book: "B",
  review: "R",
  booktalk: "T",
  giant: "G",
  leader: "L",
};

const TYPE_COLORS: Record<RelatedItem["type"], string> = {
  question: "var(--accent)",
  book: "var(--gold)",
  review: "#5C6B3A",
  booktalk: "#2C5364",
  giant: "#553C2A",
  leader: "#4A5568",
};

export default function RelatedLinks({ items, title = "관련 콘텐츠" }: RelatedLinksProps) {
  if (!items.length) return null;

  // Group by type
  const grouped = items.reduce<Record<string, RelatedItem[]>>((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  return (
    <nav
      aria-label="관련 콘텐츠"
      style={{
        borderTop: "1px solid var(--line-soft)",
        padding: "28px 0",
        marginTop: 48,
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--muted-2)",
          fontFamily: '"EB Garamond", Georgia, serif',
          fontStyle: "italic",
          marginBottom: 16,
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Object.entries(grouped).map(([type, group]) => (
          <div
            key={type}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.12em",
                color: TYPE_COLORS[type as RelatedItem["type"]] ?? "var(--muted)",
                width: 16,
                flexShrink: 0,
                paddingTop: 2,
              }}
            >
              {TYPE_LABELS[type as RelatedItem["type"]]}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
              {group.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    fontSize: 13,
                    color: "var(--muted)",
                    textDecoration: "none",
                    lineHeight: 1.6,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      TYPE_COLORS[type as RelatedItem["type"]] ?? "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "var(--muted)";
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
