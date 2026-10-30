"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { DoodleSearch, DoodleClose, DoodleBook } from "@/components/common/Doodle";
import { search, type SearchHit, type SearchKind } from "@/lib/search";

/**
 * 헤더 검색.
 *
 * 여기 있던 검색은 **고정 링크 5개**만 들고 있었다 — "체호프"도 "카너먼"도
 * "민주주의"도 하나도 찾지 못했다. ⌘K 팔레트라 기술적으로 보였을 뿐
 * 뒤에 아무것도 없었다. 이제 `lib/search`가 실제 북클럽·책·안내를 뒤진다.
 *
 * 표면은 반대로 간다 — 돋보기도 닫기도 손으로 그린 선이고, 묻는 말도
 * 기계가 아니라 사람의 말투다. 레퍼런스(chosecommune.com)가 가장 기능적인
 * 컨트롤 위에만 떨리는 손을 올려둔 것과 같은 자리다.
 */

/** 분류 꼬리표 — 결과가 무엇인지 한눈에. 색은 쓰지 않는다(먹색 하나). */
const KIND_LABELS: Record<SearchKind, string> = {
  club: "북클럽",
  book: "읽고 싶은 책",
  guide: "안내",
  page: "페이지",
};

/** 아무것도 치지 않았을 때 보여주는 길 — 가장 자주 가는 곳. */
const STARTERS: SearchHit[] = [
  { kind: "page", title: "북클럽 찾기", sub: "목록 · 지도 · 달력", href: "/bookclub", strong: "", body: "", score: 0 },
  { kind: "page", title: "우리 다시 만나요", sub: "5명이 모이면 다시 여는 책", href: "/#encore", strong: "", body: "", score: 0 },
  { kind: "page", title: "처음 오시는 분께", sub: "참여 안내", href: "/guide", strong: "", body: "", score: 0 },
  { kind: "page", title: "내 북클럽", sub: "예약 · 대기 · 함께 읽은 책", href: "/mypage", strong: "", body: "", score: 0 },
];

/**
 * `variant`
 *  - "header": 공통 머리글의 기본 모양(테두리 있는 단추 + ⌘K 뱃지, 모바일은 아이콘)
 *  - "icon":   돋보기 하나만. 홈·v3 머리글처럼 각자 모양이 다른 곳에서 쓴다.
 *              색은 `currentColor`를 따르므로 그 화면의 머리글 색을 그대로 입는다.
 */
export default function SearchPalette({
  variant = "header",
  triggerClassName,
  size = 20,
}: {
  variant?: "header" | "icon";
  triggerClassName?: string;
  size?: number;
} = {}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const typed = query.trim().length > 0;
  const results: SearchHit[] = typed ? search(query, 8) : STARTERS;

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

  const triggers = (
    <>
      {/* 공통 머리글의 검색 단추 (데스크톱) */}
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
        <span style={{ width: 15, height: 15, display: "inline-flex", flexShrink: 0 }}><DoodleSearch /></span>
        <span>검색</span>
        <kbd style={{ fontSize: 10, padding: "1px 5px", borderRadius: 4, background: "var(--bg-warm)", border: "1px solid var(--line)", color: "var(--muted-2)" }}>⌘K</kbd>
      </button>

      {/* 손가락 기기 */}
      <button
        onClick={openPalette}
        aria-label="검색"
        className="flex md:hidden"
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)", padding: 4, display: "flex", alignItems: "center" }}
      >
        <span style={{ width: 20, height: 20, display: "inline-flex" }}><DoodleSearch /></span>
      </button>
    </>
  );

  return (
    <>
      {variant === "icon" ? (
        /* 홈·v3 머리글 — 그 화면의 단추 모양(triggerClassName)을 그대로 입는다 */
        <button
          type="button"
          onClick={openPalette}
          aria-label="검색"
          className={triggerClassName}
          style={triggerClassName ? undefined : { background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 4, display: "inline-flex", alignItems: "center" }}
        >
          <span style={{ width: size, height: size, display: "inline-flex" }}><DoodleSearch /></span>
        </button>
      ) : (
        triggers
      )}

      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(28,31,38,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "10vh 16px 0" }}
          onClick={closePalette}
        >
          <div
            style={{ width: "100%", maxWidth: 560, background: "var(--bg)", borderRadius: 16, overflow: "hidden", boxShadow: "0 40px 80px -20px rgba(28,31,38,0.4)", border: "1px solid var(--line-soft)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--line-soft)" }}>
              <span style={{ width: 18, height: 18, display: "inline-flex", flexShrink: 0, color: "var(--muted)" }}><DoodleSearch /></span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                /* 기계의 말("검색어를 입력하세요")이 아니라 사람의 말 */
                placeholder="어떤 책을 찾으세요?"
                style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 15, color: "var(--ink)", fontFamily: "var(--font-noto-sans-kr),sans-serif", minWidth: 0 }}
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="지우기" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 2, width: 20, height: 20, display: "inline-flex", flexShrink: 0 }}>
                  <DoodleClose />
                </button>
              )}
              <kbd className="hidden md:inline" style={{ fontSize: 10.5, padding: "2px 6px", borderRadius: 4, background: "var(--bg-warm)", border: "1px solid var(--line)", color: "var(--muted-2)", flexShrink: 0 }}>ESC</kbd>
            </div>

            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {!typed && (
                <div style={{ padding: "12px 20px 4px", fontSize: 11.5, letterSpacing: "0.14em", color: "var(--muted-2)" }}>자주 가는 곳</div>
              )}
              {results.length === 0 ? (
                /* 빈 화면도 사람이 말하듯 — 그리고 다음 수를 같이 준다 */
                <div style={{ padding: "28px 20px 32px", textAlign: "center", color: "var(--muted)" }}>
                  <span style={{ display: "inline-flex", width: 76, color: "var(--line-2, #c9bba3)" }}><DoodleBook /></span>
                  <p style={{ margin: "10px 0 4px", fontSize: 14, color: "var(--ink)" }}>그 이름으로는 아직 못 찾았어요.</p>
                  <p style={{ margin: 0, fontSize: 13 }}>
                    책 제목이나 지은이로도 찾을 수 있어요.{" "}
                    <button onClick={() => navigate("/#recommend")} style={{ background: "none", border: "none", padding: 0, color: "var(--ink)", textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer", font: "inherit" }}>
                      읽고 싶은 책 추천하기
                    </button>
                  </p>
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</div>
                      {r.sub && <div style={{ fontSize: 12.5, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.sub}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: "var(--muted-2)" }}>{KIND_LABELS[r.kind]}</span>
                      {i === selectedIdx && <ArrowRight size={13} style={{ color: "var(--muted)" }} />}
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="hidden md:flex" style={{ padding: "10px 20px", borderTop: "1px solid var(--line-soft)", gap: 16, fontSize: 11.5, color: "var(--muted-2)" }}>
              <span>↑↓ 고르기</span>
              <span>↵ 열기</span>
              <span>ESC 닫기</span>
              <span style={{ marginLeft: "auto" }}>초성으로도 찾혀요 — ㅊㅎㅍ</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
