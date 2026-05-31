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

  const filtered = GIANTS.filter((g) => {
    const matchCat = category === "all" || g.category === category;
    const matchSearch = !search || g.name.includes(search) || g.name_en.toLowerCase().includes(search.toLowerCase()) || g.tagline.includes(search);
    return matchCat && matchSearch;
  });

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
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}>
              {filtered.map((giant) => {
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
          )}
        </div>
      </section>
    </div>
  );
}
