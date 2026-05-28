"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

const navItems = [
  { href: "#today", label: "오늘의 질문" },
  { href: "#books", label: "추천책" },
  { href: "#ask", label: "질문 남기기" },
  { href: "#seasons", label: "시즌" },
  { href: "#leaders", label: "리더" },
];

export default function Header() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("로그아웃 되었습니다.");
    router.push("/");
    setMobileOpen(false);
  };

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 50,
        transition: "background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease",
        background: scrolled ? "rgba(244, 239, 229, 0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
      }}
    >
      <div className="container-base">
        <div
          style={{
            display: "flex",
            height: "68px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1px", fontSize: "22px", lineHeight: 1 }}>
              <span
                style={{
                  color: "var(--accent)",
                  fontFamily: "\"EB Garamond\", var(--font-eb-garamond), Georgia, serif",
                  fontStyle: "italic",
                  display: "inline-block",
                  animation: "markBreathe 3.8s ease-in-out infinite",
                  transformOrigin: "center",
                }}
              >
                ?
              </span>
              <span
                style={{
                  color: "var(--ink)",
                  fontFamily: "\"EB Garamond\", var(--font-eb-garamond), Georgia, serif",
                  fontStyle: "italic",
                  display: "inline-block",
                  animation: "markBob 2.6s ease-in-out infinite",
                  transformOrigin: "center",
                }}
              >
                !
              </span>
            </div>
            <span
              style={{
                fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--ink)",
                letterSpacing: "0.02em",
              }}
            >
              질문하는 사람들
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            style={{
              display: "none",
              alignItems: "center",
              gap: "2px",
            }}
            className="md:flex"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                style={{
                  padding: "6px 14px",
                  fontSize: "13.5px",
                  color: "var(--ink-soft)",
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                  transition: "color 0.2s",
                  fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                  fontWeight: 400,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--accent)"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--ink-soft)"; }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Side */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* 참여 신청 button - desktop */}
            <a
              href="#books"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("#books");
              }}
              className="hidden md:inline-flex"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--ink)",
                color: "var(--cream-on-dark)",
                borderRadius: "9999px",
                padding: "8px 20px",
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
                letterSpacing: "0.02em",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >
              참여 신청
            </a>

            {currentUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link
                  href="/mypage"
                  title={currentUser.name}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--bg-warm)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--muted)",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {currentUser.name[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  title="로그아웃"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted)",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : null}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="메뉴"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--ink)",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
              className="md:hidden"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          style={{
            background: "rgba(244, 239, 229, 0.97)",
            backdropFilter: "blur(16px)",
            borderTop: "1px solid var(--line)",
            padding: "16px 0 24px",
          }}
        >
          <div className="container-base">
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  style={{
                    padding: "12px 16px",
                    fontSize: "15px",
                    color: "var(--ink-soft)",
                    textDecoration: "none",
                    fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                    borderRadius: "6px",
                    transition: "background 0.15s",
                    cursor: "pointer",
                  }}
                >
                  {item.label}
                </a>
              ))}
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--line)",
                  display: "flex",
                  gap: "8px",
                }}
              >
                {currentUser ? (
                  <>
                    <Link
                      href="/mypage"
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 16px",
                        border: "1px solid var(--line)",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "var(--ink-soft)",
                        textDecoration: "none",
                        flex: 1,
                        justifyContent: "center",
                      }}
                    >
                      <User size={14} /> {currentUser.name}
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 16px",
                        border: "1px solid var(--line)",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "var(--muted)",
                        background: "none",
                        cursor: "pointer",
                      }}
                    >
                      <LogOut size={14} /> 로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        padding: "10px 16px",
                        border: "1px solid var(--line)",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "var(--ink-soft)",
                        textDecoration: "none",
                      }}
                    >
                      로그인
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        padding: "10px 16px",
                        background: "var(--ink)",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "var(--cream-on-dark)",
                        textDecoration: "none",
                      }}
                    >
                      회원가입
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
