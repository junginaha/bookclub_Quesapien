"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin, Calendar, Users, Star, ArrowLeft,
  Clock, ChevronRight, CheckCircle, ExternalLink,
} from "lucide-react";
import AISummaryBlock from "@/components/seo/AISummaryBlock";
import RelatedLinks from "@/components/seo/RelatedLinks";
import type { RelatedItem } from "@/components/seo/RelatedLinks";

const COLOR_MAP: Record<string, string> = {
  navy: "#1B2536", cream: "#8B7A5E", rust: "#9B4A2E",
  olive: "#5C6B3A", dusk: "#4A5568", sage: "#7A9E7E",
  terra: "#8B5E3C", smoke: "#6B7280", mauve: "#7E6B8F",
  fog: "#9CA3AF", ochre: "#C68B2B", ink: "#1C1F26",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function BookClubDetailClient({ club }: { club: any }) {
  const [joinStep, setJoinStep] = useState<"idle" | "confirm" | "done">("idle");
  const bgColor = COLOR_MAP[club.color as string] ?? "#1B2536";
  const remaining = (club.max_participants ?? 8) - (club.current_participants ?? 0);
  const isClosed = club.status === "closed";
  const fillPct = Math.round(((club.current_participants ?? 0) / (club.max_participants ?? 8)) * 100);

  const reviews: any[] = club.reviews ?? [];
  const avgRating = reviews.length > 0
    ? reviews.reduce((s: number, r: any) => s + (r.rating ?? 5), 0) / reviews.length
    : 5;

  const handleJoin = () => {
    if (club.join_url) {
      window.open(club.join_url, "_blank");
    } else {
      setJoinStep("confirm");
    }
  };

  return (
    <>
      <div style={{ paddingTop: 64 }}>

        {/* ── Hero ── */}
        <section style={{
          background: bgColor,
          padding: "80px 0 64px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Ambient glow */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 80% 60% at 10% 20%, rgba(255,255,255,0.08), transparent 60%)",
          }} />

          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)", position: "relative" }}>
            <Link href="/bookclub" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, color: "rgba(255,255,255,0.55)",
              textDecoration: "none", marginBottom: 40,
              transition: "color 0.2s",
            }}>
              <ArrowLeft size={14} /> 북클럽 목록
            </Link>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "end" }}>
              <div>
                <div style={{
                  fontSize: 11.5, letterSpacing: "0.28em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)", fontFamily: '"EB Garamond", Georgia, serif',
                  fontStyle: "italic", marginBottom: 16,
                }}>
                  {club.genre ?? "북클럽"} · {club.tag}
                </div>

                <h1 style={{
                  fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                  fontSize: "clamp(28px, 5vw, 56px)",
                  fontWeight: 400,
                  lineHeight: 1.2,
                  color: "rgba(255,255,255,0.95)",
                  marginBottom: 12,
                }}>
                  {club.title}
                </h1>

                {club.author && (
                  <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>
                    — {club.author}
                  </p>
                )}

                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 1.75, maxWidth: 520, marginBottom: 36 }}>
                  {club.description}
                </p>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    onClick={handleJoin}
                    disabled={isClosed}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "14px 28px", borderRadius: 9999,
                      background: isClosed ? "rgba(255,255,255,0.1)" : "white",
                      color: isClosed ? "rgba(255,255,255,0.5)" : bgColor,
                      fontSize: 15, fontWeight: 600,
                      border: "none", cursor: isClosed ? "not-allowed" : "pointer",
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => { if (!isClosed) (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                  >
                    {isClosed ? "마감된 북클럽" : "참가 신청하기"}
                    {!isClosed && <ChevronRight size={16} />}
                  </button>

                  {!isClosed && (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "14px 20px",
                      color: "rgba(255,255,255,0.7)", fontSize: 14,
                    }}>
                      <Users size={14} />
                      잔여 {remaining}석
                      {remaining <= 2 && (
                        <span style={{ color: "#FF8A8A", fontWeight: 500 }}>· 마감 임박</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Stat card */}
              <div style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                borderRadius: 16,
                padding: "24px",
                minWidth: 180,
                border: "1px solid rgba(255,255,255,0.15)",
              }} className="hidden md:block">
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>참여 현황</div>
                  <div style={{ fontSize: 32, fontFamily: "var(--font-noto-serif-kr), Georgia, serif", color: "white", fontWeight: 400 }}>
                    {club.current_participants ?? 0}
                    <span style={{ fontSize: 16, opacity: 0.5 }}>/{club.max_participants ?? 8}</span>
                  </div>
                </div>
                <div style={{ height: 4, borderRadius: 9999, background: "rgba(255,255,255,0.2)", marginBottom: 20 }}>
                  <div style={{ height: "100%", width: `${fillPct}%`, borderRadius: 9999, background: remaining <= 2 ? "#FF8A8A" : "rgba(255,255,255,0.75)", transition: "width 0.3s" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Star size={12} style={{ color: "#FFD700", fill: "#FFD700" }} />
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
                    {avgRating.toFixed(1)} ({reviews.length}개 후기)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Content Grid ── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px clamp(20px, 4vw, 48px) 120px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 48 }} className="grid-responsive">

            {/* ── Left Column ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>

              {/* 리더 프로필 */}
              <section>
                <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>
                  Leader — 리더
                </div>
                <div style={{
                  display: "flex", gap: 24, alignItems: "flex-start",
                  padding: 32, borderRadius: 16,
                  border: "1px solid var(--line-soft)",
                  background: "rgba(255,255,255,0.5)",
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
                    background: bgColor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, color: "white", fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                  }}>
                    {(club.host_name ?? "리")[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                      <h2 style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 20, fontWeight: 500, color: "var(--ink)" }}>
                        {club.host_name ?? "리더"}
                      </h2>
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>리더</span>
                    </div>
                    <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.75, marginBottom: 16 }}>
                      {club.host_philosophy ?? club.host_intro}
                    </p>
                    <div style={{ display: "flex", gap: 20 }}>
                      {[
                        { value: club.host_sessions_count ?? "—", label: "진행한 북토크" },
                        { value: club.host_books_read ?? "—", label: "읽은 책" },
                        { value: `${(club.host_rating ?? 4.9).toFixed(1)}점`, label: "평균 후기" },
                      ].map((s) => (
                        <div key={s.label} style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 22, fontWeight: 400, color: "var(--ink)" }}>
                            {s.value}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* 왜 이 책인가 */}
              <section>
                <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>
                  Why — 왜 이 책인가
                </div>
                <p style={{
                  fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                  fontSize: 18, color: "var(--ink-soft)", lineHeight: 1.85,
                  borderLeft: `3px solid ${bgColor}`, paddingLeft: 24,
                }}>
                  {club.why_this_book ?? club.description}
                </p>
              </section>

              {/* 핵심 질문들 */}
              {(club.key_questions ?? []).length > 0 && (
                <section>
                  <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>
                    Questions — 이번 북토크의 질문들
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {(club.key_questions as string[]).map((q, i) => (
                      <div key={i} style={{
                        display: "flex", gap: 16, alignItems: "flex-start",
                        padding: "20px 24px", borderRadius: 12,
                        background: i % 2 === 0 ? "rgba(255,255,255,0.5)" : "transparent",
                        border: "1px solid var(--line-soft)",
                      }}>
                        <span style={{
                          fontFamily: '"EB Garamond", Georgia, serif',
                          fontSize: 36, fontStyle: "italic",
                          color: bgColor, opacity: 0.4,
                          lineHeight: 1, flexShrink: 0, marginTop: -4,
                        }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 16, color: "var(--ink)", lineHeight: 1.65 }}>
                          {q}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 이런 분께 */}
              {(club.recommended_for ?? []).length > 0 && (
                <section>
                  <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>
                    For — 이런 분께 추천합니다
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(club.recommended_for as string[]).map((rec, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: "var(--ink-soft)" }}>
                        <CheckCircle size={16} style={{ color: bgColor, flexShrink: 0 }} />
                        {rec}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 진행 방식 */}
              {club.session_format && (
                <section>
                  <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>
                    Format — 진행 방식
                  </div>
                  <div style={{
                    padding: "24px", borderRadius: 12,
                    background: "rgba(255,255,255,0.4)", border: "1px solid var(--line-soft)",
                    fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.75,
                  }}>
                    {club.session_format}
                  </div>
                </section>
              )}

              {/* 후기 */}
              {reviews.length > 0 && (
                <section>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)" }}>
                      Reviews — 참여자 후기
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Star size={14} style={{ color: "#FFD700", fill: "#FFD700" }} />
                      <span style={{ fontSize: 14, color: "var(--ink-soft)", fontWeight: 500 }}>{avgRating.toFixed(1)}</span>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>({reviews.length}개)</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {reviews.map((r: any) => (
                      <div key={r.id} style={{
                        padding: "24px", borderRadius: 12,
                        background: "rgba(255,255,255,0.5)",
                        border: "1px solid var(--line-soft)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: bgColor,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, color: "white", fontWeight: 600,
                          }}>
                            {r.author_name?.[0] ?? "?"}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{r.author_name}</div>
                            <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                              {Array.from({ length: r.rating ?? 5 }).map((_, i) => (
                                <Star key={i} size={10} style={{ color: "#FFD700", fill: "#FFD700" }} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.75 }}>
                          &ldquo;{r.content}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ── Right Sidebar ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="sidebar-hide">
              {/* Sticky Info Card */}
              <div style={{
                position: "sticky", top: 88,
                padding: 28, borderRadius: 16,
                border: "1px solid var(--line-soft)",
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(8px)",
                display: "flex", flexDirection: "column", gap: 20,
              }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>
                    일정 & 장소
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--ink-soft)", alignItems: "flex-start" }}>
                      <Calendar size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{club.schedule ?? "일정 협의 중"}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--ink-soft)", alignItems: "flex-start" }}>
                      <Clock size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>약 2시간 30분</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--ink-soft)", alignItems: "flex-start" }}>
                      <MapPin size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <div>{club.location}</div>
                        {club.location_detail && (
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{club.location_detail}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--ink-soft)", alignItems: "center" }}>
                      <Users size={15} style={{ flexShrink: 0 }} />
                      <span>{club.current_participants ?? 0}명 / {club.max_participants ?? 8}명</span>
                    </div>
                  </div>
                </div>

                {/* Participation bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                    <span>참여 현황</span>
                    <span>{fillPct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 9999, background: "var(--line-soft)" }}>
                    <div style={{
                      height: "100%", borderRadius: 9999,
                      width: `${fillPct}%`,
                      background: remaining <= 2 ? "#EF4444" : bgColor,
                      transition: "width 0.3s",
                    }} />
                  </div>
                  {remaining <= 2 && !isClosed && (
                    <div style={{ fontSize: 12, color: "#EF4444", marginTop: 6, fontWeight: 500 }}>
                      잔여 {remaining}석 — 마감 임박
                    </div>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={handleJoin}
                  disabled={isClosed}
                  style={{
                    width: "100%", padding: "15px 0",
                    borderRadius: 12,
                    background: isClosed ? "var(--line-soft)" : bgColor,
                    color: isClosed ? "var(--muted)" : "white",
                    fontSize: 15, fontWeight: 600,
                    border: "none", cursor: isClosed ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => { if (!isClosed) (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >
                  {isClosed ? "마감" : "참가 신청하기"}
                  {!isClosed && <ExternalLink size={15} />}
                </button>

                {!isClosed && (
                  <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", lineHeight: 1.6 }}>
                    신청 후 확정 시 이메일로 안내드립니다.<br />
                    참가비는 확정 후 안내됩니다.
                  </p>
                )}
              </div>

              {/* Emotion tags */}
              {(club.emotion_tags ?? []).length > 0 && (
                <div style={{ padding: "20px 24px", borderRadius: 12, border: "1px solid var(--line-soft)", background: "rgba(255,255,255,0.4)" }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
                    태그
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(club.emotion_tags as string[]).map((tag) => (
                      <span key={tag} style={{
                        fontSize: 12, padding: "4px 10px",
                        borderRadius: 9999, background: "var(--bg-warm)",
                        color: "var(--ink-soft)",
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stage 5: Internal Related Links ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
        <RelatedLinks
          title="관련 콘텐츠"
          items={[
            ...(club.key_questions ?? []).slice(0, 3).map((q: string): RelatedItem => ({
              label: q.length > 35 ? q.slice(0, 35) + "…" : q,
              href: `/questions`,
              type: "question",
            })),
            { label: "질문 아카이브", href: "/questions", type: "question" },
            { label: "모든 북클럽 보기", href: "/bookclub", type: "booktalk" },
            { label: "후기 아카이브", href: "/archive", type: "review" },
          ]}
        />
      </div>

      {/* ── Stage 3: AI Summary Block ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <AISummaryBlock
          what={`${club.title ?? "이 북토크"}는 ${club.author ? `${club.author}의 ` : ""}${club.genre ?? "책"}을 중심으로 ${club.host_name ?? "리더"}가 진행하는 오프라인 북토크이다.`}
          why={club.why_this_book ?? club.description ?? "책과 질문을 통해 사람과 사람이 연결되는 경험을 제공한다."}
          who={(club.recommended_for ?? ["독서를 좋아하는 분", "새로운 사람을 만나고 싶은 분"]).join(", ")}
          bullets={[
            `리더: ${club.host_name ?? "—"}`,
            `장소: ${club.location ?? "서울"}`,
            `인원: 최대 ${club.max_participants ?? 8}명 소규모`,
            `방식: ${club.session_format ?? "원형 대화 방식"}`,
          ]}
        />
      </div>

      {/* ── Floating CTA (Mobile) ── */}
      {!isClosed && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "16px clamp(20px, 4vw, 48px)",
          background: "rgba(244,239,229,0.95)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid var(--line)",
          zIndex: 50,
          display: "flex", alignItems: "center", gap: 12,
        }} className="md:hidden">
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{club.title}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>잔여 {remaining}석</div>
          </div>
          <button
            onClick={handleJoin}
            style={{
              padding: "12px 24px", borderRadius: 9999,
              background: bgColor, color: "white",
              fontSize: 14, fontWeight: 600,
              border: "none", cursor: "pointer",
              flexShrink: 0,
            }}
          >
            참가 신청
          </button>
        </div>
      )}

      {/* ── Join Confirm Modal ── */}
      {joinStep === "confirm" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(28,31,38,0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }} onClick={() => setJoinStep("idle")}>
          <div style={{
            background: "var(--bg)", borderRadius: 20, padding: 40,
            maxWidth: 440, width: "100%",
            boxShadow: "0 40px 80px -20px rgba(28,31,38,0.4)",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>
              참가 신청
            </div>
            <h3 style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 22, fontWeight: 400, color: "var(--ink)", marginBottom: 12 }}>
              {club.title}
            </h3>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.75, marginBottom: 24 }}>
              {club.schedule}<br />
              {club.location}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => { setJoinStep("done"); }}
                style={{
                  padding: "14px 0", borderRadius: 10,
                  background: bgColor, color: "white",
                  fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer",
                  width: "100%",
                }}
              >
                신청 완료하기
              </button>
              <button
                onClick={() => setJoinStep("idle")}
                style={{
                  padding: "12px 0", borderRadius: 10,
                  background: "transparent", color: "var(--muted)",
                  fontSize: 14, border: "1px solid var(--line)", cursor: "pointer",
                  width: "100%",
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {joinStep === "done" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(28,31,38,0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }} onClick={() => setJoinStep("idle")}>
          <div style={{
            background: "var(--bg)", borderRadius: 20, padding: 48,
            maxWidth: 400, width: "100%", textAlign: "center",
          }}>
            <CheckCircle size={48} style={{ color: bgColor, margin: "0 auto 20px" }} />
            <h3 style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 22, fontWeight: 400, color: "var(--ink)", marginBottom: 12 }}>
              신청이 완료되었습니다
            </h3>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.75, marginBottom: 28 }}>
              확인 후 이메일로 안내드립니다.<br />
              마이페이지에서 신청 내역을 확인할 수 있습니다.
            </p>
            <Link href="/mypage" style={{
              display: "block", padding: "12px 0", borderRadius: 10,
              background: bgColor, color: "white", textDecoration: "none",
              fontSize: 14, fontWeight: 500,
            }}>
              마이페이지 확인
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .grid-responsive { grid-template-columns: 1fr !important; }
          .sidebar-hide { display: none !important; }
        }
      `}</style>
    </>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
