"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/questions", label: "질문 목록" },
  { href: "/questions/create", label: "발제 만들기" },
  { href: "/archive", label: "후기 아카이브" },
];

export default function Header() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [ctaOpen, setCtaOpen] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ctaRef.current && !ctaRef.current.contains(e.target as Node)) {
        setCtaOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            {/* 참여 신청 button — two-option dropdown */}
            <div ref={ctaRef} className="hidden md:block" style={{ position: "relative" }}>
              <button
                onClick={() => setCtaOpen((o) => !o)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "var(--ink)",
                  color: "var(--cream-on-dark)",
                  borderRadius: "9999px",
                  padding: "8px 20px",
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  border: "none",
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              >
                참여 신청
                <span style={{ fontSize: "9px", opacity: 0.7, marginLeft: "2px" }}>
                  {ctaOpen ? "▲" : "▼"}
                </span>
              </button>
              {ctaOpen && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  minWidth: "210px",
                  background: "rgba(244,239,229,0.97)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid var(--line)",
                  borderRadius: "12px",
                  boxShadow: "0 20px 50px -20px rgba(40,30,20,.25)",
                  overflow: "hidden",
                  zIndex: 200,
                }}>
                  <Link
                    href="/quiz"
                    onClick={() => setCtaOpen(false)}
                    style={{
                      display: "block",
                      padding: "16px 20px",
                      borderBottom: "1px solid var(--line)",
                      textDecoration: "none",
                    }}
                  >
                    <div style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--ink)", marginBottom: "3px" }}>
                      나에게 맞는 북토크 추천
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                      북 MBTI로 성향 파악하기
                    </div>
                  </Link>
                  <a
                    href="/#books"
                    onClick={() => setCtaOpen(false)}
                    style={{
                      display: "block",
                      padding: "16px 20px",
                      textDecoration: "none",
                    }}
                  >
                    <div style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--ink)", marginBottom: "3px" }}>
                      바로 참여 신청하기
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                      진행 중인 북클럽 보기
                    </div>
                  </a>
                </div>
              )}
            </div>

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
