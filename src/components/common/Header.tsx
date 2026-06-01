"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, LogOut, User, ChevronDown, Archive, Settings } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import SearchPalette from "./SearchPalette";

const navItems = [
  {
    href: "/questions",
    label: "질문",
    desc: "오늘의 질문과 인기 질문을 발견하세요",
    sub: [
      { href: "/questions", label: "질문 탐색" },
      { href: "/questions/create", label: "질문 작성" },
    ],
  },
  {
    href: "/bookclub",
    label: "북클럽",
    desc: "리더와 함께하는 오프라인 북토크",
    sub: [
      { href: "/bookclub", label: "북토크 일정" },
      { href: "/bookclub/leaders", label: "리더 소개" },
    ],
  },
  {
    href: "/archive",
    label: "아카이빙",
    desc: "질문과 독서의 기록",
    sub: [
      { href: "/archive", label: "후기 아카이브" },
      { href: "/archive/reviews", label: "리뷰 아카이브" },
    ],
  },
  {
    href: "/giants",
    label: "거인의 어깨",
    desc: "위대한 사유자들과의 대화",
    sub: [
      { href: "/giants", label: "인물 탐색" },
      { href: "/giants?category=philosopher", label: "철학자" },
      { href: "/giants?category=author", label: "작가" },
    ],
  },
];

const WORDMARKS = ["질문하는 사람들", "Quesapience"] as const;

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [wordmarkIdx, setWordmarkIdx] = useState(0);
  const [wordmarkFading, setWordmarkFading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authBtnIdx, setAuthBtnIdx] = useState(0); // 0=로그인, 1=회원가입
  const [authBtnFading, setAuthBtnFading] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 로그인/회원가입 버튼 순환 (비로그인 시)
  useEffect(() => {
    if (currentUser) return;
    const interval = setInterval(() => {
      setAuthBtnFading(true);
      setTimeout(() => {
        setAuthBtnIdx((i) => (i + 1) % 2);
        setAuthBtnFading(false);
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, [currentUser]);

  // 워드마크 자동 전환
  useEffect(() => {
    const interval = setInterval(() => {
      setWordmarkFading(true);
      setTimeout(() => {
        setWordmarkIdx((i) => (i + 1) % WORDMARKS.length);
        setWordmarkFading(false);
      }, 350);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const isLanding = pathname === "/";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveNav(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    toast.success("로그아웃됐어요.");
    router.push("/");
  };

  const openNav = (href: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveNav(href);
  };

  const closeNav = () => {
    dropdownTimeout.current = setTimeout(() => setActiveNav(null), 120);
  };

  const keepOpen = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Transparent on landing unless scrolled > 30px or hovered
  const showOpaque = scrolled || hovered || !isLanding;
  const headerBg = showOpaque ? "rgba(244, 239, 229, 0.95)" : "transparent";
  const headerBorder = showOpaque ? "1px solid var(--line)" : "1px solid transparent";

  return (
    <header
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 100,
        transition: "background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease",
        background: headerBg,
        backdropFilter: showOpaque ? "blur(16px)" : "none",
        WebkitBackdropFilter: showOpaque ? "blur(16px)" : "none",
        borderBottom: headerBorder,
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
        <div style={{ display: "flex", height: 64, alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo — 워드마크 자동 전환 */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 1, fontSize: 20, lineHeight: 1 }}>
              <span style={{
                color: "var(--accent)",
                fontFamily: '"EB Garamond", Georgia, serif',
                fontStyle: "normal",
                animation: "markBreathe 3.8s ease-in-out infinite",
                transformOrigin: "center",
              }}>?</span>
              <span style={{
                color: "var(--ink)",
                fontFamily: '"EB Garamond", Georgia, serif',
                fontStyle: "normal",
                animation: "markBob 2.6s ease-in-out infinite",
                transformOrigin: "center",
              }}>!</span>
            </div>
            {/* 워드마크 교차 — 질문하는 사람들 ↔ Quesapience */}
            <span style={{ position: "relative", display: "inline-block", height: 20, minWidth: 110, overflow: "hidden" }}>
              {WORDMARKS.map((wm, i) => (
                <span
                  key={wm}
                  style={{
                    position: "absolute", left: 0, top: 0, whiteSpace: "nowrap",
                    fontFamily: i === 1
                      ? '"EB Garamond", Georgia, serif'
                      : "var(--font-noto-serif-kr), Georgia, serif",
                    fontSize: i === 1 ? 14.5 : 13.5,
                    fontWeight: i === 1 ? 400 : 500,
                    color: "var(--ink)",
                    letterSpacing: i === 1 ? "0.06em" : "0.03em",
                    fontStyle: i === 1 ? "italic" : "normal",
                    lineHeight: "20px",
                    transition: "opacity 0.4s ease, transform 0.4s cubic-bezier(.2,.8,.2,1)",
                    opacity: wordmarkIdx === i && !wordmarkFading ? 1 : 0,
                    transform: wordmarkIdx === i && !wordmarkFading
                      ? "translateY(0)"
                      : wordmarkIdx === i ? "translateY(-4px)" : "translateY(4px)",
                  }}
                >
                  {wm}
                </span>
              ))}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav ref={navRef} style={{ display: "none", alignItems: "center", gap: 0 }} className="md:flex">
            {navItems.map((item, idx) => (
              <div
                key={item.href}
                style={{ position: "relative" }}
                onMouseEnter={() => openNav(item.href)}
                onMouseLeave={closeNav}
              >
                <Link
                  href={item.href}
                  className={idx === 0 ? "nav-glow" : idx === 1 ? "nav-glow-d1" : idx === 2 ? "nav-glow-d2" : "nav-glow-d3"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "6px 14px",
                    fontSize: 13.5,
                    color: isActive(item.href) ? "var(--accent)" : "var(--ink-soft)",
                    textDecoration: "none",
                    letterSpacing: "0.01em",
                    transition: "color 0.2s",
                    fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                    fontWeight: isActive(item.href) ? 500 : 400,
                    borderRadius: 6,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = isActive(item.href) ? "var(--accent)" : "var(--ink-soft)"; }}
                >
                  {item.label}
                  <ChevronDown size={11} style={{ opacity: 0.5, marginTop: 1 }} />
                </Link>

                {/* Dropdown */}
                {activeNav === item.href && (
                  <div
                    onMouseEnter={keepOpen}
                    onMouseLeave={closeNav}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      minWidth: 200,
                      background: "rgba(244,239,229,0.98)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid var(--line)",
                      borderRadius: 12,
                      boxShadow: "0 24px 60px -16px rgba(28,31,38,.18)",
                      padding: "8px 0",
                      zIndex: 200,
                    }}
                  >
                    <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid var(--line-soft)" }}>
                      <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{item.desc}</div>
                    </div>
                    {item.sub.map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        style={{
                          display: "block",
                          padding: "9px 16px",
                          fontSize: 13.5,
                          color: "var(--ink-soft)",
                          textDecoration: "none",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(28,31,38,0.04)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SearchPalette />
            {currentUser ? (
              /* 로그인 상태 — 프로필 드롭다운 */
              <div ref={profileRef} style={{ position: "relative" }} className="hidden md:block">
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "5px 12px 5px 5px",
                    border: "1px solid var(--line-soft)",
                    borderRadius: 9999, background: "rgba(255,255,255,0.6)",
                    cursor: "pointer", transition: "all .2s ease",
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "var(--accent)", color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12.5, fontWeight: 600, flexShrink: 0,
                  }}>
                    {currentUser.name[0]}
                  </div>
                  <span style={{ fontSize: 13, color: "var(--ink-soft)", fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
                    {currentUser.name}
                  </span>
                  <ChevronDown size={12} style={{ color: "var(--muted)", transition: "transform .2s ease", transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                </button>

                {profileOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    minWidth: 200, background: "rgba(244,239,229,0.98)",
                    backdropFilter: "blur(20px)", border: "1px solid var(--line)",
                    borderRadius: 14, boxShadow: "0 24px 60px -16px rgba(28,31,38,.18)",
                    padding: "8px 0", zIndex: 200,
                  }}>
                    <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid var(--line-soft)" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink)", fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
                        {currentUser.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{currentUser.email}</div>
                    </div>
                    {[
                      { href: "/mypage", icon: <User size={13} />, label: "내 프로필" },
                      { href: "/archive?mine=true", icon: <Archive size={13} />, label: "내 아카이브" },
                      { href: "/mypage?tab=questions", icon: <Settings size={13} />, label: "내 질문" },
                    ].map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setProfileOpen(false)} style={{
                        display: "flex", alignItems: "center", gap: 9,
                        padding: "9px 16px", fontSize: 13.5, color: "var(--ink-soft)",
                        textDecoration: "none", transition: "background .15s",
                        fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(28,31,38,0.04)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <span style={{ color: "var(--muted)" }}>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: "1px solid var(--line-soft)", marginTop: 4 }} />
                    <button onClick={handleLogout} style={{
                      display: "flex", alignItems: "center", gap: 9,
                      padding: "9px 16px", fontSize: 13.5, color: "var(--muted)",
                      background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                      transition: "color .15s",
                      fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                    }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#EF4444"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
                    >
                      <LogOut size={13} /> 로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* 비로그인 — 순환 애니메이션 버튼 */
              <div className="hidden md:flex" style={{ alignItems: "center" }}>
                <div style={{ position: "relative", height: 36, width: 110, overflow: "hidden" }}>
                  {/* 로그인 버튼 */}
                  <Link
                    href="/login"
                    style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13.5, fontWeight: 500, textDecoration: "none",
                      borderRadius: 9999, padding: "0 20px",
                      border: "1.5px solid var(--line)",
                      color: "var(--ink-soft)",
                      fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                      transition: "opacity .3s ease, transform .3s ease",
                      opacity: authBtnIdx === 0 && !authBtnFading ? 1 : 0,
                      transform: authBtnIdx === 0 && !authBtnFading
                        ? "translateY(0)"
                        : authBtnIdx === 0 ? "translateY(-6px)" : "translateY(6px)",
                      pointerEvents: authBtnIdx === 0 ? "auto" : "none",
                    }}
                  >
                    로그인
                  </Link>
                  {/* 함께하기 버튼 */}
                  <Link
                    href="/signup"
                    style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13.5, fontWeight: 600, textDecoration: "none",
                      borderRadius: 9999, padding: "0 16px",
                      background: "var(--ink)", color: "var(--cream-on-dark)",
                      fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                      transition: "opacity .3s ease, transform .3s ease",
                      opacity: authBtnIdx === 1 && !authBtnFading ? 1 : 0,
                      transform: authBtnIdx === 1 && !authBtnFading
                        ? "translateY(0)"
                        : authBtnIdx === 1 ? "translateY(-6px)" : "translateY(6px)",
                      pointerEvents: authBtnIdx === 1 ? "auto" : "none",
                    }}
                  >
                    함께하기
                  </Link>
                </div>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="메뉴"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)", padding: 4, display: "flex", alignItems: "center" }}
              className="md:hidden"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          background: "rgba(244, 239, 229, 0.98)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--line)",
          padding: "12px 0 24px",
          maxHeight: "85vh",
          overflowY: "auto",
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {navItems.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      fontSize: 16,
                      fontWeight: 500,
                      color: isActive(item.href) ? "var(--accent)" : "var(--ink)",
                      textDecoration: "none",
                      fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                      borderBottom: "1px solid var(--line-soft)",
                    }}
                  >
                    {item.label}
                  </Link>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0, paddingLeft: 12 }}>
                    {item.sub.map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        style={{
                          padding: "9px 0",
                          fontSize: 14,
                          color: "var(--ink-soft)",
                          textDecoration: "none",
                        }}
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {/* 모바일 북클럽 참여 버튼 */}
              <Link
                href="/bookclub"
                style={{
                  display: "block", marginTop: 16, padding: "13px 0", textAlign: "center",
                  background: "var(--ink)", color: "var(--cream-on-dark)",
                  borderRadius: 9999, fontSize: 14, fontWeight: 500, textDecoration: "none",
                  fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                }}
              >
                북클럽 참여
              </Link>

              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
                {currentUser ? (
                  <>
                    <Link
                      href="/mypage"
                      style={{
                        flex: 1, textAlign: "center", padding: "10px 16px",
                        border: "1px solid var(--line)", borderRadius: 8,
                        fontSize: 13, color: "var(--ink-soft)", textDecoration: "none",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}
                    >
                      <User size={14} /> {currentUser.name}
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "10px 16px", border: "1px solid var(--line)",
                        borderRadius: 8, fontSize: 13, color: "var(--muted)",
                        background: "none", cursor: "pointer",
                      }}
                    >
                      <LogOut size={14} /> 로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      style={{
                        flex: 1, textAlign: "center", padding: "10px 16px",
                        border: "1px solid var(--line)", borderRadius: 8,
                        fontSize: 13, color: "var(--ink-soft)", textDecoration: "none",
                      }}
                    >
                      로그인
                    </Link>
                    <Link
                      href="/signup"
                      style={{
                        flex: 1, textAlign: "center", padding: "10px 16px",
                        background: "var(--ink)", borderRadius: 8,
                        fontSize: 13, color: "var(--cream-on-dark)", textDecoration: "none",
                      }}
                    >
                      시작하기
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
