"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { GIANTS, type Giant, type GiantCategory } from "@/data/giants";

export type { Giant, GiantCategory };
export { GIANTS };


const CATEGORIES: { value: GiantCategory; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "philosopher", label: "철학자" },
  { value: "author", label: "작가" },
  { value: "thinker", label: "사상가" },
  { value: "entrepreneur", label: "기업가" },
  { value: "scientist", label: "과학자" },
];

export default function GiantsClient() {
  const [category, setCategory] = useState<GiantCategory>("all");
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [moreExpanded, setMoreExpanded] = useState(false);

  const INITIAL_SHOW = 8;

  const filtered = GIANTS.filter((g) => {
    const matchCat = category === "all" || g.category === category;
    const matchSearch = !search || g.name.includes(search) || g.name_en.toLowerCase().includes(search.toLowerCase()) || g.tagline.includes(search);
    return matchCat && matchSearch;
  });

  // 검색/필터 중이면 전체 표시, 아니면 초기 8명만
  const isFiltering = !!search || category !== "all";
  const visible  = isFiltering ? filtered : filtered.slice(0, INITIAL_SHOW);
  const hidden   = isFiltering ? [] : filtered.slice(INITIAL_SHOW);

  return (
    <div style={{ background: "var(--bg)" }}>

      {/* ── Hero ── */}
      <section style={{
        padding: "80px 0 60px",
        borderBottom: "1px solid var(--line-soft)",
        background: `linear-gradient(135deg, var(--bg-ink) 0%, #2D3748 100%)`,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 70% 50% at 90% 50%, rgba(176,138,74,0.12), transparent 60%)",
        }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)", position: "relative" }}>
          <div style={{ fontSize: 11.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "normal", marginBottom: 24 }}>
            On the Shoulders of Giants — 거인의 어깨
          </div>
          <h1 style={{
            fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
            fontSize: "clamp(28px, 5vw, 56px)",
            fontWeight: 400,
            lineHeight: 1.2,
            color: "rgba(255,255,255,0.95)",
            marginBottom: 16,
          }}>
            위대한 사유자들의<br />
            <span style={{ color: "var(--gold)", fontWeight: 600 }}>생각</span>과 대화하다.
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, maxWidth: 520, marginBottom: 48 }}>
            니체는 내 질문에 어떻게 답할까? 한강이라면 이 상황을 어떻게 바라볼까?<br />
            그들의 저서와 사상을 바탕으로, 그들의 언어로 당신의 질문에 답합니다.
          </p>

          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 12, padding: "12px 20px",
            maxWidth: 480,
          }}>
            <Search size={16} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="인물 이름이나 주제어 검색..."
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontSize: 14, color: "rgba(255,255,255,0.8)",
                fontFamily: "var(--font-noto-sans-kr), sans-serif",
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section style={{ padding: "48px 0 120px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>

          {/* Category Filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 48 }}>
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                style={{
                  padding: "7px 18px", borderRadius: 9999,
                  fontSize: 13.5, fontWeight: category === c.value ? 500 : 400,
                  background: category === c.value ? "var(--ink)" : "transparent",
                  color: category === c.value ? "var(--cream-on-dark)" : "var(--ink-soft)",
                  border: category === c.value ? "1px solid var(--ink)" : "1px solid var(--line)",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
              검색 결과가 없습니다.
            </div>
          ) : (
            <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}>
              {visible.map((giant) => {
                const isHovered = hoveredId === giant.id;
                return (
                  <Link
                    key={giant.id}
                    href={`/giants/${giant.slug}`}
                    style={{ textDecoration: "none" }}
                    onMouseEnter={() => setHoveredId(giant.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <article style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      border: "1px solid var(--line-soft)",
                      background: "white",
                      transition: "transform 0.25s ease, box-shadow 0.25s ease",
                      transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                      boxShadow: isHovered ? "0 20px 60px -12px rgba(28,31,38,0.15)" : "0 2px 8px rgba(28,31,38,0.04)",
                    }}>
                      {/* Color bar + portrait */}
                      <div style={{
                        height: 140,
                        background: giant.color,
                        display: "flex", flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "20px 24px",
                        position: "relative",
                        overflow: "hidden",
                      }}>
                        {/* Pattern overlay */}
                        <div style={{
                          position: "absolute", inset: 0, pointerEvents: "none",
                          background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.08), transparent 50%)",
                        }} />
                        <div style={{
                          fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
                          color: "rgba(255,255,255,0.5)", fontFamily: '"EB Garamond", Georgia, serif',
                          fontStyle: "normal",
                        }}>
                          {CATEGORIES.find((c) => c.value === giant.category)?.label} · {giant.nationality}
                        </div>
                        <div>
                          <div style={{
                            fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                            fontSize: 22, color: "rgba(255,255,255,0.95)",
                            fontWeight: 400, marginBottom: 2,
                          }}>
                            {giant.name}
                          </div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontStyle: "normal" }}>
                            {giant.name_en} · {giant.birth_year}–{giant.death_year ?? "현재"}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{ padding: "20px 24px" }}>
                        <p style={{
                          fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.65,
                          fontStyle: "normal",
                          borderLeft: `2px solid ${giant.color}`,
                          paddingLeft: 12, marginBottom: 16,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          &ldquo;{giant.signature_quote}&rdquo;
                        </p>

                        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {giant.tagline}
                        </p>

                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                          {giant.key_works.slice(0, 2).map((w) => (
                            <span key={w} style={{
                              fontSize: 11.5, padding: "3px 9px", borderRadius: 9999,
                              background: "var(--bg-soft)", color: "var(--muted)",
                            }}>
                              {w}
                            </span>
                          ))}
                        </div>

                        <div style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          paddingTop: 12, borderTop: "1px solid var(--line-soft)",
                        }}>
                          <span style={{ fontSize: 12.5, color: giant.color, fontWeight: 500 }}>
                            {giant.name}의 관점 탐구
                          </span>
                          <ChevronRight size={15} style={{ color: "var(--muted)" }} />
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>

            {/* 더 많은 지성 만나보기 — lp-books-more 스타일 */}
            {!isFiltering && hidden.length > 0 && (
              <div style={{ marginTop: 64 }}>
                {/* 토글 버튼 행 */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 24, marginBottom: 16 }}>
                  <div style={{ height: 1, background: "var(--line-soft)" }} />
                  <button
                    onClick={() => setMoreExpanded((v) => !v)}
                    aria-expanded={moreExpanded}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 12, whiteSpace: "nowrap",
                      padding: "14px 26px",
                      background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 9999,
                      fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontWeight: 500, fontSize: 14.5,
                      letterSpacing: "-0.005em", color: "var(--ink)", cursor: "pointer",
                      transition: "background .3s ease, border-color .3s ease, transform .3s ease",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-soft)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                  >
                    더 많은 지성 만나보기
                    <span style={{ fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "normal", color: "var(--accent)", fontSize: 14 }}>
                      {hidden.length}명
                    </span>
                    {/* chevron */}
                    <span style={{
                      width: 12, height: 12, position: "relative", flexShrink: 0,
                      transition: "transform .4s cubic-bezier(.2,.8,.2,1)",
                      transform: moreExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      display: "inline-block",
                    }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </button>
                  <div style={{ height: 1, background: "var(--line-soft)" }} />
                </div>

                <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", fontFamily: "var(--font-noto-serif-kr), Georgia, serif", marginBottom: moreExpanded ? 40 : 0, transition: "margin .4s ease" }}>
                  {moreExpanded ? "— 지금 바로 만날 수 있는 지성들이에요." : "— 더 많은 사유자들이 기다리고 있어요."}
                </p>

                {/* 숨겨진 그리드 */}
                <div style={{
                  overflow: "hidden",
                  maxHeight: moreExpanded ? "4000px" : "0",
                  opacity: moreExpanded ? 1 : 0,
                  transition: "max-height .7s cubic-bezier(.2,.8,.2,1), opacity .5s ease",
                }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 20,
                  }}>
                    {hidden.map((giant) => {
                      const isHovered = hoveredId === giant.id;
                      return (
                        <Link
                          key={giant.id}
                          href={`/giants/${giant.slug}`}
                          style={{ textDecoration: "none", display: "block" }}
                          onMouseEnter={() => setHoveredId(giant.id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          <article style={{
                            border: "1px solid var(--line-soft)", borderRadius: 12,
                            overflow: "hidden", background: "var(--bg)",
                            transition: "transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s ease",
                            transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                            boxShadow: isHovered ? "0 20px 50px -16px rgba(28,31,38,.22)" : "none",
                          }}>
                            <div style={{ padding: "28px 24px 20px", minHeight: 120, background: `linear-gradient(135deg, ${giant.color}22 0%, ${giant.color}0a 100%)` }}>
                              <div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>{giant.category}</div>
                              <div style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 20, fontWeight: 400, color: "var(--ink)", marginBottom: 2 }}>{giant.name}</div>
                              <div style={{ fontSize: 12, color: "var(--muted)" }}>{giant.name_en} · {giant.birth_year}–{giant.death_year ?? "현재"}</div>
                            </div>
                            <div style={{ padding: "20px 24px" }}>
                              <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.65, borderLeft: `2px solid ${giant.color}`, paddingLeft: 12, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                &ldquo;{giant.signature_quote}&rdquo;
                              </p>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--line-soft)" }}>
                                <span style={{ fontSize: 12.5, color: giant.color, fontWeight: 500 }}>{giant.name}의 관점 탐구</span>
                                <ChevronRight size={15} style={{ color: "var(--muted)" }} />
                              </div>
                            </div>
                          </article>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
