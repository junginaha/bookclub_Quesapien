"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Calendar, Users, ChevronRight } from "lucide-react";

import { ALL_CLUBS, toBookClubCard } from "@/lib/clubsData";

// ─── Static fallback data ─────────────────────────────────────
const STATIC_CLUBS = ALL_CLUBS.map(toBookClubCard);

const COLOR_MAP: Record<string, string> = {
  navy: "#1B2536",
  cream: "#D4C9A8",
  rust: "#9B4A2E",
  olive: "#5C6B3A",
  dusk: "#4A5568",
  sage: "#7A9E7E",
  terra: "#8B5E3C",
  smoke: "#6B7280",
  mauve: "#7E6B8F",
  fog: "#9CA3AF",
  ochre: "#C68B2B",
  ink: "#1C1F26",
};

const STATUS_LABELS: Record<string, string> = {
  active: "모집 중",
  closed: "마감",
  upcoming: "오픈 예정",
};

const FILTERS = ["전체", "모집 중", "오픈 예정", "마감"] as const;
type FilterType = typeof FILTERS[number];

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function BookClubClient({ initialClubs }: { initialClubs: any[] }) {
  const clubs = STATIC_CLUBS;
  const [activeFilter, setActiveFilter] = useState<FilterType>("전체");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = clubs.filter((c: any) => {
    if (activeFilter === "전체") return true;
    const statusLabel = STATUS_LABELS[c.status as string] ?? "";
    return statusLabel === activeFilter;
  });

  const activeCount = clubs.filter((c: any) => c.status === "active").length;
  const upcomingCount = clubs.filter((c: any) => c.status === "upcoming").length;

  return (
    <div style={{ background: "var(--bg)" }}>
      {/* Hero */}
      <section style={{
        padding: "72px 0 56px",
        borderBottom: "1px solid var(--line-soft)",
        background: "linear-gradient(to bottom, rgba(244,239,229,0) 0%, var(--bg-soft) 100%)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
          <div style={{ fontSize: 11.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--muted)", fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "italic", marginBottom: 20 }}>
            Book Club — 북클럽
          </div>
          <h1 style={{
            fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
            fontSize: "clamp(32px, 6vw, 64px)",
            fontWeight: 400,
            lineHeight: 1.18,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            marginBottom: 20,
          }}>
            책과 질문으로<br />
            <em style={{ fontStyle: "normal", fontWeight: 600, color: "var(--accent)", fontFamily: "var(--font-noto-serif-kr), Georgia, serif", background: "linear-gradient(90deg, var(--accent), #B08A4A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>만나는</em> 사람들.
          </h1>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75, maxWidth: 480, marginBottom: 40 }}>
            리더와 함께 읽고, 질문하고, 대화해요.<br />
            오프라인에서만 가능한 깊이의 연결.
          </p>

          <div style={{ display: "flex", gap: 32, marginBottom: 40 }}>
            {[
              { value: `${activeCount}개`, label: "진행 중인 북토크" },
              { value: `${upcomingCount}개`, label: "오픈 예정" },
              { value: "142명", label: "이번 시즌 참여자" },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 28, fontWeight: 400, color: "var(--ink)", lineHeight: 1.2 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, letterSpacing: "0.02em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 9999,
                  fontSize: 13.5,
                  fontWeight: activeFilter === f ? 500 : 400,
                  background: activeFilter === f ? "var(--ink)" : "transparent",
                  color: activeFilter === f ? "var(--cream-on-dark)" : "var(--ink-soft)",
                  border: activeFilter === f ? "1px solid var(--ink)" : "1px solid var(--line)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Book Club Grid */}
      <section style={{ padding: "64px 0 120px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
              지금은 이 조건의 북클럽이 없어요.
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 24,
            }}>
              {filtered.map((club: any) => {
                const bgColor = COLOR_MAP[club.color as string] ?? "#1B2536";
                const remaining = (club.max_participants ?? 8) - (club.current_participants ?? 0);
                const isClosed = club.status === "closed";
                const isUpcoming = club.status === "upcoming";
                const isHovered = hoveredId === club.id;

                return (
                  <Link
                    key={club.id}
                    href={`/bookclub/${club.slug}`}
                    style={{ textDecoration: "none" }}
                    onMouseEnter={() => setHoveredId(club.id)}
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
                      opacity: isClosed ? 0.7 : 1,
                    }}>
                      {/* Cover */}
                      <div style={{
                        height: 200,
                        background: bgColor,
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "20px 24px",
                      }}>
                        {/* Status badge */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{
                            fontSize: 11,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.7)",
                            fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                            fontStyle: "normal",
                          }}>
                            {club.genre ?? "북클럽"}
                          </span>
                          <span style={{
                            fontSize: 11,
                            padding: "4px 10px",
                            borderRadius: 9999,
                            background: isClosed ? "rgba(255,255,255,0.15)" : isUpcoming ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.25)",
                            color: "rgba(255,255,255,0.9)",
                            fontWeight: 500,
                            letterSpacing: "0.04em",
                          }}>
                            {STATUS_LABELS[club.status as string] ?? ""}
                          </span>
                        </div>

                        {/* Title */}
                        <div>
                          <h3 style={{
                            fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                            fontSize: 22,
                            fontWeight: 400,
                            color: "rgba(255,255,255,0.95)",
                            lineHeight: 1.3,
                            marginBottom: 4,
                          }}>
                            {club.title}
                          </h3>
                          {club.author && (
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>— {club.author}</p>
                          )}
                        </div>

                        {/* Seat bar */}
                        {!isClosed && !isUpcoming && (
                          <div style={{
                            position: "absolute",
                            bottom: 0, left: 0, right: 0,
                            height: 3,
                            background: "rgba(255,255,255,0.2)",
                          }}>
                            <div style={{
                              height: "100%",
                              width: `${Math.round((club.current_participants / club.max_participants) * 100)}%`,
                              background: remaining <= 2 ? "#FF6B6B" : "rgba(255,255,255,0.7)",
                              transition: "width 0.3s ease",
                            }} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ padding: "20px 24px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)" }}>
                            <Calendar size={13} />
                            <span>{club.schedule ?? "일정 조율 중"}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)" }}>
                            <MapPin size={13} />
                            <span>{club.location ?? "장소 미정"}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)" }}>
                            <Users size={13} />
                            <span>
                              {isClosed
                                ? "마감됐어요"
                                : isUpcoming
                                ? "곧 열려요"
                                : `${remaining}자리 남았어요 / ${club.max_participants}명`}
                            </span>
                            {!isClosed && !isUpcoming && remaining <= 2 && (
                              <span style={{ fontSize: 11, color: "#EF4444", fontWeight: 500 }}>마감 임박</span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: "50%",
                              background: bgColor,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12, color: "white", fontWeight: 600,
                            }}>
                              {(club.host_name ?? "리")[0]}
                            </div>
                            <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{club.host_name ?? "리더"}</span>
                          </div>
                          <ChevronRight size={16} style={{ color: "var(--muted)" }} />
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
/* eslint-enable @typescript-eslint/no-explicit-any */
