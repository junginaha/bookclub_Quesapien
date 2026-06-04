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
import { useAppStore } from "@/lib/store";
import { isAdminEmail } from "@/lib/admin";

const COLOR_MAP: Record<string, string> = {
  navy: "#1B2536", cream: "#8B7A5E", rust: "#9B4A2E",
  olive: "#5C6B3A", dusk: "#4A5568", sage: "#7A9E7E",
  terra: "#8B5E3C", smoke: "#6B7280", mauve: "#7E6B8F",
  fog: "#9CA3AF", ochre: "#C68B2B", ink: "#1C1F26",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function BookClubDetailClient({ club: initialClub }: { club: any; isAdmin?: boolean }) {
  // 클라이언트 측에서 admin 여부 확인 (로그인 상태 즉시 반영)
  const currentUser = useAppStore((s) => s.currentUser);
  const isAdmin = isAdminEmail(currentUser?.email);
  const [club, setClub] = useState<any>(initialClub);
  const [joinStep, setJoinStep] = useState<"idle" | "done" | "no-link">("idle");
  const [joining, setJoining] = useState(false);

  // ── 어드민 편집 상태 ──────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title:       initialClub.title ?? "",
    schedule:    initialClub.schedule ?? "",
    description: initialClub.description ?? "",
    location:    initialClub.location ?? "",
    host_name:   initialClub.host_name ?? "",
    join_url:    initialClub.join_url ?? "",
  });
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const bgColor = COLOR_MAP[club.color as string] ?? "#1B2536";
  const remaining = (club.max_participants ?? 8) - (club.current_participants ?? 0);
  const isClosed = club.status === "closed" || remaining <= 0;
  const hasJoinLink = !!(club.join_url?.startsWith("http")) || !!club.has_join_url;
  const fillPct = Math.round(((club.current_participants ?? 0) / (club.max_participants ?? 8)) * 100);
  const reviews: any[] = club.reviews ?? [];
  const avgRating = reviews.length > 0
    ? reviews.reduce((s: number, r: any) => s + (r.rating ?? 5), 0) / reviews.length
    : 5;

  // ── 참여 신청 — 서버 리다이렉트 (URL 비노출) ──────────────────
  const handleJoin = async () => {
    if (isClosed || joining) return;
    if (!hasJoinLink) { setJoinStep("no-link"); return; }
    setJoining(true);
    // /api/book-clubs/[slug]/join 으로 탭 열기 → 서버가 잼잼링크로 302 리다이렉트
    window.open(`/api/book-clubs/${club.slug}/join`, "_blank", "noopener,noreferrer");
    setJoining(false);
    setJoinStep("done");
    setTimeout(() => setJoinStep("idle"), 3000);
  };

  // ── 어드민 저장 ──────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setSaveMsg("");
    try {
      const res = await fetch(`/api/book-clubs/${club.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:       editForm.title,
          schedule:    editForm.schedule,
          description: editForm.description,
          location:    editForm.location,
          host_name:   editForm.host_name,
          join_url:    editForm.join_url,
          color:       club.color,
        }),
      });
      const json = await res.json() as { club?: any; error?: string };
      if (res.ok && json.club) {
        setClub((prev: any) => ({ ...prev, ...json.club, join_url: editForm.join_url }));
        setSaveMsg("✓ 저장됐어요!");
        setTimeout(() => { setSaveMsg(""); setEditOpen(false); }, 1500);
      } else {
        setSaveMsg(`⚠ ${json.error ?? "저장 실패"}`);
      }
    } catch { setSaveMsg("⚠ 네트워크 오류"); }
    setSaving(false);
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
                  fontStyle: "normal", marginBottom: 16,
                }}>
                  {club.genre ?? "북클럽"} · {club.tag}
                </div>

                {/* 어드민 편집 버튼 */}
                {isAdmin && (
                  <button
                    onClick={() => setEditOpen(true)}
                    style={{ display:"inline-flex", alignItems:"center", gap:6, marginBottom:16, padding:"6px 14px", borderRadius:8, background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)", color:"rgba(255,255,255,0.8)", fontSize:12.5, cursor:"pointer", transition:"background .2s" }}
                    onMouseEnter={(e)=>(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.2)"}
                    onMouseLeave={(e)=>(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.12)"}
                  >
                    ✏️ 북토크 정보 편집
                  </button>
                )}

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

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    onClick={handleJoin}
                    disabled={isClosed || joining}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "14px 28px", borderRadius: 9999,
                      background: isClosed ? "rgba(255,255,255,0.1)" : joinStep==="done" ? "#10B981" : "white",
                      color: isClosed ? "rgba(255,255,255,0.5)" : joinStep==="done" ? "white" : bgColor,
                      fontSize: 15, fontWeight: 600,
                      border: "none", cursor: isClosed ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { if (!isClosed && joinStep!=="done") (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                  >
                    {isClosed ? "마감됐어요" : joinStep==="done" ? "신청 완료 ✓" : joining ? "연결 중…" : "참여 신청하기"}
                    {!isClosed && joinStep==="idle" && <ChevronRight size={16} />}
                  </button>

                  {joinStep==="no-link" && (
                    <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)" }}>참여 링크가 준비 중입니다.</span>
                  )}

                  {!isClosed && (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "14px 20px",
                      color: "rgba(255,255,255,0.7)", fontSize: 14,
                    }}>
                      <Users size={14} />
                      {remaining}자리 남음
                      {remaining <= 2 && (
                        <span style={{ color: "#FF8A8A", fontWeight: 500 }}>· 마감 임박</span>
                      )}
                    </div>
                  )}

                  {/* 리더 관리 버튼 (리더만 표시 — 클라이언트에서 auth 체크 안 함, 링크 자체가 서버에서 보호됨) */}
                  <a
                    href={`/bookclub/manage/${club.slug}`}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "12px 18px", borderRadius: 9999,
                      background: "rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.6)", fontSize: 13,
                      border: "1px solid rgba(255,255,255,0.2)", textDecoration: "none",
                      transition: "background .2s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.22)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
                    title="리더·관리자만 접근 가능"
                  >
                    리더 관리
                  </a>
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
                          fontSize: 36, fontStyle: "normal",
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
                    이런 분께 드려요
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
                    확정 후 이메일로 알려드릴게요.<br />
                    참가비는 확정 후 알려드릴게요.
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


      {/* 잼잼링크 미설정 안내 */}
      {joinStep === "no-link" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(28,31,38,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }} onClick={() => setJoinStep("idle")}>
          <div
            style={{ background: "var(--bg)", borderRadius: 20, padding: 40, maxWidth: 380, width: "100%", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 28, marginBottom: 16, fontFamily: '"EB Garamond", Georgia, serif', color: "var(--muted)", letterSpacing: "0.1em" }}>— —</div>
            <h3 style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 20, fontWeight: 400, color: "var(--ink)", marginBottom: 12 }}>
              신청 링크를 준비 중이에요.
            </h3>
            <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.75, marginBottom: 24 }}>
              리더가 곧 신청 링크를 등록할 거예요.<br />
              조금만 기다려 주세요.
            </p>
            <button
              onClick={() => setJoinStep("idle")}
              style={{ width: "100%", padding: "12px 0", borderRadius: 10, background: bgColor, color: "white", fontSize: 14, border: "none", cursor: "pointer" }}
            >
              닫기
            </button>
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
              확인 후 이메일로 알려드릴게요.<br />
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

      {/* ── 어드민 편집 패널 ── */}
      {isAdmin && editOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(20,24,31,0.7)", backdropFilter:"blur(6px)", display:"flex", alignItems:"flex-start", justifyContent:"flex-end" }}
          onClick={() => setEditOpen(false)}>
          <div style={{ width:"min(460px,100vw)", height:"100vh", background:"var(--bg)", overflowY:"auto", padding:"24px 28px", boxShadow:"-16px 0 40px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
              <h2 style={{ fontFamily:"var(--font-noto-serif-kr), Georgia, serif", fontSize:18, fontWeight:500, color:"var(--ink)", margin:0 }}>
                북토크 정보 편집
              </h2>
              <button onClick={() => setEditOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"var(--muted)" }}>✕</button>
            </div>

            {[
              { label:"제목", key:"title", placeholder:"예: 다정함의 발명 북토크", type:"text" },
              { label:"일시", key:"schedule", placeholder:"예: 2026년 7월 5일 (토) 오후 3시 – 5시 30분", type:"text" },
              { label:"장소", key:"location", placeholder:"예: 서울 서초구 교대역 인근", type:"text" },
              { label:"진행자", key:"host_name", placeholder:"예: 정해린", type:"text" },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key} style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--muted)", marginBottom:6 }}>{label}</label>
                <input
                  type={type}
                  value={(editForm as any)[key]}
                  onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{ width:"100%", padding:"10px 14px", borderRadius:10, fontSize:14, border:"1px solid var(--line-soft)", background:"rgba(255,255,255,0.7)", color:"var(--ink)", outline:"none", boxSizing:"border-box" }}
                />
              </div>
            ))}

            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--muted)", marginBottom:6 }}>세부내용</label>
              <textarea
                rows={4}
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="이 북클럽에 대해 소개해주세요."
                style={{ width:"100%", padding:"10px 14px", borderRadius:10, fontSize:14, border:"1px solid var(--line-soft)", background:"rgba(255,255,255,0.7)", color:"var(--ink)", outline:"none", resize:"vertical", boxSizing:"border-box", fontFamily:"var(--font-noto-serif-kr), Georgia, serif" }}
              />
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={{ display:"block", fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--muted)", marginBottom:6 }}>
                참여 신청 링크 (잼잼)
                {editForm.join_url && <span style={{ color:"var(--accent)", marginLeft:8, fontWeight:600 }}>✓ 연결됨</span>}
              </label>
              <input
                type="url"
                value={editForm.join_url}
                onChange={(e) => setEditForm((f) => ({ ...f, join_url: e.target.value }))}
                placeholder="잼잼 링크 붙여넣기 — 사용자에게 URL 비공개"
                style={{ width:"100%", padding:"10px 14px", borderRadius:10, fontSize:14, border:"1px solid var(--line-soft)", background:"rgba(255,255,255,0.7)", color:"var(--ink)", outline:"none", boxSizing:"border-box" }}
                onPaste={async (e) => {
                  const pasted = e.clipboardData.getData("text").trim();
                  if (!pasted.startsWith("http")) return;
                  setEditForm((f) => ({ ...f, join_url: pasted }));
                  // 붙여넣기 즉시 저장
                  try {
                    await fetch(`/api/book-clubs/${club.slug}`, {
                      method:"PATCH", headers:{"Content-Type":"application/json"},
                      body: JSON.stringify({ join_url: pasted, title: club.title, color: club.color }),
                    });
                    setSaveMsg("✓ 링크 저장됐어요!");
                    setTimeout(() => setSaveMsg(""), 2500);
                  } catch { /* local */ }
                }}
              />
              {editForm.join_url && (
                <div style={{ marginTop:4, fontSize:11, color:"var(--muted)" }}>
                  → "참여 신청하기" 버튼 클릭 시 이 링크로 연결됩니다. URL은 사용자에게 노출되지 않습니다.
                </div>
              )}
            </div>

            {saveMsg && (
              <div style={{ marginBottom:12, padding:"9px 14px", borderRadius:8, background: saveMsg.startsWith("✓") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border:`1px solid ${saveMsg.startsWith("✓") ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, fontSize:13, color: saveMsg.startsWith("✓") ? "#10B981" : "#EF4444" }}>
                {saveMsg}
              </div>
            )}

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setEditOpen(false)} style={{ flex:1, padding:"11px 0", borderRadius:10, fontSize:14, background:"none", border:"1px solid var(--line)", color:"var(--muted)", cursor:"pointer" }}>
                취소
              </button>
              <button onClick={handleSave} disabled={saving} style={{ flex:2, padding:"11px 0", borderRadius:10, fontSize:14, fontWeight:600, background:"var(--ink)", color:"var(--cream-on-dark)", border:"none", cursor:"pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "저장 중…" : "저장 · 업데이트"}
              </button>
            </div>
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
