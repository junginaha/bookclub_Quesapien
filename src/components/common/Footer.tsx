"use client";

import Link from "next/link";

const QUICK_LINKS = [
  { href: "#today", label: "오늘의 질문" },
  { href: "#books", label: "추천책" },
  { href: "/archive", label: "후기" },
  { href: "#seasons", label: "시즌" },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-navy)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        paddingTop: "40px",
        paddingBottom: "40px",
        paddingLeft: "var(--gutter)",
        paddingRight: "var(--gutter)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: "32px",
            alignItems: "center",
          }}
          className="grid-cols-1 md:grid-cols-[1fr_auto_1fr]"
        >
          {/* Left */}
          <div>
            <p
              style={{
                fontFamily: "\"EB Garamond\", var(--font-eb-garamond), Georgia, serif",
                fontStyle: "italic",
                fontSize: "14px",
                color: "var(--cream-on-dark)",
                letterSpacing: "0.02em",
              }}
            >
              — 질문하는 사람들 · 미래혁신형 북클럽
            </p>
          </div>

          {/* Center: quick links */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
            }}
          >
            {QUICK_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={
                  link.href.startsWith("#")
                    ? (e) => {
                        e.preventDefault();
                        const el = document.querySelector(link.href);
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }
                    : undefined
                }
                style={{
                  fontSize: "12px",
                  color: "rgba(163,154,140,0.6)",
                  textDecoration: "none",
                  letterSpacing: "0.06em",
                  transition: "color 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--cream-on-dark)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "rgba(163,154,140,0.6)";
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right */}
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontFamily: "\"EB Garamond\", Georgia, serif",
                fontStyle: "italic",
                fontSize: "12px",
                color: "rgba(163,154,140,0.45)",
              }}
            >
              © 2026 질문하는 사람들. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
