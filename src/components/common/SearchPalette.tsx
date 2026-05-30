"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, BookOpen, MessageSquare, Users } from "lucide-react";
import { GIANTS } from "@/data/giants";

interface SearchResult {
  type: "question" | "booktalk" | "giant" | "archive" | "page";
  label: string;
  sub?: string;
  href: string;
  icon: React.ReactNode;
}

const STATIC_RESULTS: SearchResult[] = [
  { type: "page", label: "질문 탐색", sub: "오늘의 질문 · 인기 질문", href: "/questions", icon: <MessageSquare size={14} /> },
  { type: "page", label: "북클럽 일정", sub: "진행 중인 북토크", href: "/bookclub", icon: <BookOpen size={14} /> },
  { type: "page", label: "리더 소개", sub: "북토크 리더들", href: "/bookclub/leaders", icon: <Users size={14} /> },
  { type: "page", label: "거인의 어깨", sub: "위대한 사유자들과 대화", href: "/giants", icon: <Search size={14} /> },
  { type: "page", label: "아카이빙", sub: "후기 · 질문 · 발제문 기록", href: "/archive", icon: <BookOpen size={14} /> },
  { type: "page", label: "질문 작성", sub: "당신의 질문을 남겨보세요", href: "/questions/create", icon: <MessageSquare size={14} /> },
  ...GIANTS.map((g): SearchResult => ({
    type: "giant",
    label: g.name,
    sub: `${g.name_en} · ${g.tagline.slice(0, 40)}`,
    href: `/giants/${g.slug}`,
    icon: <Users size={14} />,
  })),
];

const TYPE_COLORS: Record<string, string> = {
  question: "var(--accent)",
  booktalk: "#2C5364",
  giant: "#553C2A",
  archive: "#5C6B3A",
  page: "var(--muted)",
};

const TYPE_LABELS: Record<string, string> = {
  question: "질문",
  booktalk: "북클럽",
  giant: "거인",
  archive: "아카이브",
  page: "페이지",
};

export default function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = query.trim().length < 1
    ? STATIC_RESULTS.slice(0, 8)
    : STATIC_RESULTS.filter((r) =>
        r.label.toLowerCase().includes(query.toLowerCase()) ||
        r.sub?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);

  const openPalette = useCallback(() => { setOpen(true); setQuery(""); setSelectedIdx(0); }, []);
  const closePalette = useCallback(() => { setOpen(false); setQuery(""); }, []);

  const navigate = useCallback((href: string) => {
    router.push(href);
    closePalette();
  }, [router, closePalette]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); open ? closePalette() : openPalette(); }
      if (!open) return;
      if (e.key === "Escape") closePalette();
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, results.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && results[selectedIdx]) navigate(results[selectedIdx].href);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, results, selectedIdx, openPalette, closePalette, navigate]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);
  useEffect(() => { setSelectedIdx(0); }, [query]);

  return (
    <>
      {/* Trigger button — shown in header */}
      <button
        onClick={openPalette}
        aria-label="검색 (Cmd+K)"
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 12px", borderRadius: 8,
          border: "1px solid var(--line)", background: "rgba(255,255,255,0.4)",
          fontSize: 13, color: "var(--muted)", cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.8)"; el.style.borderColor = "var(--accent)"; }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.4)"; el.style.borderColor = "var(--line)"; }}
        className="hidden md:flex"
      >
        <Search size={13} />
        <span>검색</span>
        <kbd style={{ fontSize: 10, padding: "1px 5px", borderRadius: 4, background: "var(--bg-warm)", border: "1px solid var(--line)", color: "var(--muted-2)" }}>⌘K</kbd>
      </button>

      {/* Mobile search icon */}
      <button
        onClick={openPalette}
        aria-label="검색"
        className="flex md:hidden"
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)", padding: 4, display: "flex", alignItems: "center" }}
      >
        <Search size={18} />
      </button>

      {/* Palette overlay */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(28,31,38,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10vh", padding: "10vh 16px 0" }}
          onClick={closePalette}
        >
          <div
            style={{ width: "100%", maxWidth: 560, background: "var(--bg)", borderRadius: 16, overflow: "hidden", boxShadow: "0 40px 80px -20px rgba(28,31,38,0.4)", border: "1px solid var(--line-soft)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--line-soft)" }}>
              <Search size={16} style={{ color: "var(--muted)", flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="질문, 북클럽, 거인 검색…"
                style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 15, color: "var(--ink)", fontFamily: "var(--font-noto-sans-kr),sans-serif" }}
              />
              {query && (
                <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 2 }}>
                  <X size={14} />
                </button>
              )}
              <kbd style={{ fontSize: 10.5, padding: "2px 6px", borderRadius: 4, background: "var(--bg-warm)", border: "1px solid var(--line)", color: "var(--muted-2)", flexShrink: 0 }}>ESC</kbd>
            </div>

            {/* Results */}
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {results.length === 0 ? (
                <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
                  검색 결과가 없습니다.
                </div>
              ) : (
                results.map((r, i) => (
                  <button
                    key={r.href + i}
                    onClick={() => navigate(r.href)}
                    onMouseEnter={() => setSelectedIdx(i)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 20px", background: i === selectedIdx ? "rgba(94,70,50,0.06)" : "none",
                      border: "none", borderBottom: "1px solid var(--line-soft)", cursor: "pointer",
                      textAlign: "left", transition: "background 0.1s",
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: `${TYPE_COLORS[r.type]}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: TYPE_COLORS[r.type],
                    }}>
                      {r.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</div>
                      {r.sub && <div style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.sub}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 9999, background: `${TYPE_COLORS[r.type]}15`, color: TYPE_COLORS[r.type] }}>
                        {TYPE_LABELS[r.type]}
                      </span>
                      {i === selectedIdx && <ArrowRight size={13} style={{ color: "var(--muted)" }} />}
                    </div>
                  </button>
                ))
              )}
            </div>

            <div style={{ padding: "10px 20px", borderTop: "1px solid var(--line-soft)", display: "flex", gap: 16, fontSize: 11.5, color: "var(--muted-2)" }}>
              <span>↑↓ 이동</span>
              <span>↵ 이동</span>
              <span>ESC 닫기</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
