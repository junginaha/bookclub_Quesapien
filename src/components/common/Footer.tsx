"use client";

import Link from "next/link";

const SECTIONS = [
  {
    title: "탐색",
    links: [
      { href: "/questions", label: "질문" },
      { href: "/bookclub", label: "북클럽" },
      { href: "/archive", label: "아카이빙" },
      { href: "/giants", label: "거인의 어깨" },
    ],
  },
  {
    title: "참여",
    links: [
      { href: "/questions/create", label: "질문 작성" },
      { href: "/bookclub", label: "북토크 신청" },
      { href: "/onboarding", label: "프로필 만들기" },
      { href: "/mypage", label: "마이페이지" },
    ],
  },
  {
    title: "멤버십",
    links: [
      { href: "/mypage#membership", label: "QReader" },
      { href: "/mypage#membership", label: "QLeader" },
      { href: "/signup", label: "회원가입" },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{
      background: "var(--bg-navy)",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      padding: "64px clamp(20px, 4vw, 48px) 40px",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 40,
          marginBottom: 56,
        }} className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 1, fontSize: 20 }}>
                <span style={{ color: "var(--accent)", fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "italic" }}>?</span>
                <span style={{ color: "rgba(255,255,255,0.8)", fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "italic" }}>!</span>
              </div>
              <span style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.7)", letterSpacing: "0.03em" }}>
                질문하는 사람들
              </span>
            </div>
            <p style={{ fontSize: 13.5, color: "rgba(163,154,140,0.7)", lineHeight: 1.8, maxWidth: 280 }}>
              질문으로 연결되는 지적 커뮤니티.<br />
              서초구 선정 미래혁신형 북클럽.
            </p>
            <p style={{ fontSize: 12.5, color: "rgba(163,154,140,0.4)", fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "italic", marginTop: 16 }}>
              &ldquo;좋은 질문은 좋은 사람을 데려옵니다.&rdquo;
            </p>
          </div>

          {/* Navigation Sections */}
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <div style={{ fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(163,154,140,0.5)", marginBottom: 16 }}>
                {section.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {section.links.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    style={{
                      fontSize: 13.5, color: "rgba(163,154,140,0.65)",
                      textDecoration: "none", transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(163,154,140,0.65)"; }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 24,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          <div style={{ fontSize: 12, color: "rgba(163,154,140,0.5)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span>협업·문의</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <a
              href="mailto:junginaha@qsapience.com"
              style={{
                color: "rgba(176,138,74,0.65)",
                textDecoration: "none",
                transition: "color 0.2s",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(176,138,74,1)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(176,138,74,0.65)"; }}
            >
              junginaha@qsapience.com
            </a>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}>
            <p style={{ fontSize: 12, color: "rgba(163,154,140,0.4)" }}>
              © 2026 질문하는 사람들 · Quesapience. All rights reserved.
            </p>
            <p style={{ fontSize: 12, color: "rgba(163,154,140,0.3)", fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "italic" }}>
              질문 → 책 → 대화 → 사람 → 성장
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .footer-grid > div:first-child {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
