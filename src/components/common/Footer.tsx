"use client";

import Link from "next/link";
import { GIANTS_ENABLED } from "@/lib/features";
import BusinessInfo from "@/components/common/BusinessInfo";

const SECTIONS = [
  {
    title: "탐색",
    links: [
      { href: "/questions", label: "질문" },
      // 구 /clubs(M1 잔존 화면) 대신 유지 중인 v3 지도로 보낸다 — 두 화면이
      // 같은 검색어를 두고 겹쳐 있었다. /clubs를 다시 쓰려면 이 href만 돌리면 된다.
      { href: "/bookclub?view=map", label: "내 근처 북클럽" },
      { href: "/bookclub", label: "북클럽" },
      { href: "/archive", label: "아카이빙" },
      ...(GIANTS_ENABLED ? [{ href: "/giants", label: "거인의 어깨" }] : []),
    ],
  },
  {
    title: "참여",
    links: [
      { href: "/questions/create", label: "질문 작성" },
      { href: "/bookclub", label: "북토크 신청" },
      // 참여 안내(/guide) — 롱테일 검색으로 들어오는 글들인데 사이트 어디에서도
      // 링크되지 않아 크롤러가 닿기 어려웠다. 바닥글은 전 페이지에 있다.
      { href: "/guide", label: "처음 오시는 분께" },
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
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, textDecoration: "none", transition: "opacity .2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
              <div style={{ display: "flex", gap: 1, fontSize: 20 }}>
                <span style={{ color: "var(--accent)", fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "italic" }}>?</span>
                <span style={{ color: "rgba(255,255,255,0.8)", fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "italic" }}>!</span>
              </div>
              <span style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.7)", letterSpacing: "0.03em" }}>
                질문하는 사람들
              </span>
            </Link>
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
              href="mailto:junginaha@qsapiens.com"
              style={{
                color: "rgba(176,138,74,0.65)",
                textDecoration: "none",
                transition: "color 0.2s",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(176,138,74,1)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(176,138,74,0.65)"; }}
            >
              junginaha@qsapiens.com
            </a>
          </div>
          {/* 전자상거래법 제10조 — 사이버몰에 표시해야 하는 사업자 정보.
              펼쳐 늘어놓지 않고 접어 둔다(BusinessInfo 주석 참조). */}
          <div style={{ color: "rgba(163,154,140,0.72)" }}>
            <BusinessInfo />
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}>
            <p style={{ fontSize: 12, color: "rgba(163,154,140,0.4)" }}>
              © 2026 <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>질문하는 사람들 · Qsapiens</Link>. All rights reserved.
            </p>
            <div style={{ display: "flex", gap: 14 }}>
              <Link href="/privacy" style={{ fontSize: 12, color: "rgba(163,154,140,0.5)", textDecoration: "none" }}>개인정보처리방침</Link>
              <Link href="/terms" style={{ fontSize: 12, color: "rgba(163,154,140,0.5)", textDecoration: "none" }}>이용약관</Link>
            </div>
            <p style={{ fontSize: 12, color: "rgba(163,154,140,0.3)", fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "italic" }}>
              <span aria-hidden="true" style={{ position: "absolute", opacity: 0, pointerEvents: "none", fontSize: 0 }}>질문 → 책 → 대화 → 사람 → 성장</span>
              <a href="https://toroom19.com" target="_blank" rel="noopener"
                style={{ color: "rgba(163,154,140,0.5)", textDecoration: "none", fontStyle: "normal", fontFamily: "inherit", transition: "color 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(163,154,140,0.5)"; }}>
                첫 질문을 던진 사람 · <span style={{ color: "rgba(176,138,74,0.8)" }}>출판 전문가 김정인</span> ↗
              </a>
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
