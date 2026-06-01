"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, BookOpen, MessageSquare, Calendar, ChevronRight, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import type { ProfileRow, ReviewRow, SessionRow } from "@/lib/supabase/types";
import { computeDNA, DEFAULT_DNA } from "@/lib/question-dna";

/* eslint-disable @typescript-eslint/no-explicit-any */
type SessionWithQ = SessionRow & { question?: any };

const DNA_TYPES = [
  { key: "existential", label: "실존", color: "#5E4632", defaultPct: 40 },
  { key: "relational", label: "관계", color: "#2C5364", defaultPct: 25 },
  { key: "creative", label: "창작", color: "#4A5568", defaultPct: 20 },
  { key: "practical", label: "실용", color: "#5C6B3A", defaultPct: 15 },
];

const MEMBERSHIP_TIERS = [
  {
    id: "qreader",
    name: "QReader",
    subtitle: "독자를 위한 멤버십",
    price: "월 9,900원",
    color: "#1B2536",
    benefits: ["독서 기록 무제한", "질문 저장 및 컬렉션", "전체 아카이브 열람", "AI 요약 기능", "북토크 후기 열람"],
  },
  {
    id: "qleader",
    name: "QLeader",
    subtitle: "리더를 위한 멤버십",
    price: "월 29,900원",
    color: "#553C2A",
    benefits: ["QReader 모든 혜택", "북토크 개설 권한", "참가자 관리 대시보드", "AI 발제문 자동 생성", "운영 통계 리포트", "전담 지원"],
    isPopular: true,
  },
];

interface Props {
  profile: ProfileRow;
  myReviews: ReviewRow[];
  mySessions: SessionWithQ[];
  onboardingAnswers?: Record<string, string | string[]>;
}

type TabType = "overview" | "questions" | "reviews" | "bookclubs" | "membership";

export default function MyPageClient({ profile, myReviews, mySessions, onboardingAnswers }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const handleLogout = async () => {
    await logoutAction();
  };

  const upcomingSessions = mySessions.filter((s) => s.status === "upcoming");

  // Compute DNA from onboarding answers, fall back to default
  const dna = onboardingAnswers && Object.keys(onboardingAnswers).length > 0
    ? computeDNA(onboardingAnswers)
    : DEFAULT_DNA;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingTop: 64 }}>

      {/* ── Profile Hero ── */}
      <section style={{
        padding: "56px 0 48px",
        borderBottom: "1px solid var(--line-soft)",
        background: "linear-gradient(to bottom, var(--bg-soft), var(--bg))",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>

            {/* Avatar + Info */}
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "var(--accent)", color: "var(--cream-on-dark)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                flexShrink: 0,
              }}>
                {profile.name[0]}
              </div>
              <div>
                <h1 style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 26, fontWeight: 400, color: "var(--ink)", marginBottom: 6 }}>
                  {profile.name}
                </h1>
                <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12, lineHeight: 1.6 }}>
                  {profile.bio ?? "아직 소개가 없어요."}
                </p>
                <div style={{ display: "flex", gap: 20 }}>
                  {[
                    { value: profile.session_count, label: "참여 북토크" },
                    { value: myReviews.length, label: "작성 후기" },
                    { value: upcomingSessions.length, label: "예정 모임" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 24, fontWeight: 400, color: "var(--ink)" }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <form action={handleLogout}>
              <button type="submit" style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 18px", borderRadius: 8,
                border: "1px solid var(--line)", background: "none",
                fontSize: 13, color: "var(--muted)", cursor: "pointer",
                transition: "all 0.2s",
              }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = "#EF4444"; el.style.borderColor = "#FECACA"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--muted)"; el.style.borderColor = "var(--line)"; }}
              >
                <LogOut size={14} /> 로그아웃
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Tab Navigation ── */}
      <div style={{ borderBottom: "1px solid var(--line-soft)", background: "var(--bg)", overflow: "auto" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)", display: "flex" }}>
          {([
            { key: "overview", label: "Overview" },
            { key: "questions", label: "질문" },
            { key: "reviews", label: "후기" },
            { key: "bookclubs", label: "북클럽" },
            { key: "membership", label: "멤버십" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "14px 18px",
                fontSize: 14, fontWeight: activeTab === tab.key ? 500 : 400,
                color: activeTab === tab.key ? "var(--ink)" : "var(--muted)",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: activeTab === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -1, transition: "color 0.2s", whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px clamp(20px, 4vw, 48px) 120px" }}>

        {/* Overview */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 40 }} className="grid-responsive">
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

              {/* Question DNA */}
              <div style={{
                padding: 32, borderRadius: 20,
                background: "var(--ink)", color: "var(--cream-on-dark)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: "radial-gradient(ellipse 60% 80% at 90% 10%, rgba(176,138,74,0.18), transparent)",
                }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, position: "relative" }}>
                  <Sparkles size={16} style={{ color: "var(--gold)" }} />
                  <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
                    Question DNA
                  </div>
                </div>
                <h3 style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 18, fontWeight: 400, color: "var(--cream-on-dark)", marginBottom: 24, position: "relative" }}>
                  {profile.name}님의 질문 유형 분석
                </h3>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, marginBottom: 16, position: "relative" }}>
                  주요 유형: <strong style={{ color: "var(--gold)" }}>{dna.label}</strong> — {dna.description}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
                  {DNA_TYPES.map((d) => {
                    const pct = dna.scores[d.key as keyof typeof dna.scores] ?? d.defaultPct;
                    return (
                      <div key={d.key}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{d.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>{pct}%</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 9999, background: "rgba(255,255,255,0.1)" }}>
                          <div style={{
                            height: "100%", borderRadius: 9999,
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${d.color}, ${d.color}99)`,
                            transition: "width 0.8s ease",
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 20, position: "relative" }}>
                  {onboardingAnswers ? "온보딩 답변 기반 분석" : "더 많은 질문을 남기면 분석이 정확해집니다"}
                </p>
              </div>

              {/* Quick Actions */}
              <div>
                <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>
                  빠른 실행
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { href: "/questions/create", icon: <MessageSquare size={16} />, label: "질문 작성하기", color: "var(--ink)" },
                    { href: "/bookclub", icon: <BookOpen size={16} />, label: "북클럽 참여하기", color: "var(--accent)" },
                    { href: "/giants", icon: "?", label: "거인과 대화하기", color: "var(--bg-navy)" },
                    { href: "/onboarding", icon: <Sparkles size={16} />, label: "프로필 업데이트", color: "#5C6B3A" },
                  ].map((action) => (
                    <Link key={action.href} href={action.href} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: "20px", borderRadius: 12,
                        border: "1px solid var(--line-soft)",
                        background: "rgba(255,255,255,0.4)",
                        display: "flex", alignItems: "center", gap: 12,
                        transition: "all 0.2s", cursor: "pointer",
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.8)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.4)"; }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: action.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: typeof action.icon === "string" ? 18 : 14, flexShrink: 0 }}>
                          {action.icon}
                        </div>
                        <span style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>{action.label}</span>
                        <ChevronRight size={14} style={{ color: "var(--muted)", marginLeft: "auto" }} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Upcoming Sessions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="sidebar-hide">
              <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>
                예정된 모임
              </div>
              {upcomingSessions.length === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center" }}>
                  <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12 }}>예정된 모임이 없어요.</p>
                  <Link href="/bookclub" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none" }}>
                    북클럽 탐색하기 →
                  </Link>
                </div>
              ) : (
                upcomingSessions.slice(0, 3).map((s) => (
                  <div key={s.id} style={{ padding: "20px", borderRadius: 12, border: "1px solid var(--line-soft)", background: "rgba(255,255,255,0.4)" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", marginBottom: 8 }}>
                      {s.question?.title ?? "북토크"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
                      <Calendar size={12} /> {formatDate(s.date)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>
              작성한 후기 ({myReviews.length}개)
            </div>
            {myReviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0", color: "var(--muted)" }}>
                <p style={{ marginBottom: 12 }}>아직 작성한 후기가 없어요.</p>
                <Link href="/bookclub" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none" }}>
                  북클럽 참여하기 →
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {myReviews.map((review) => (
                  <div key={review.id} style={{ padding: "24px", borderRadius: 12, border: "1px solid var(--line-soft)", background: "rgba(255,255,255,0.4)" }}>
                    {review.quote && (
                      <blockquote style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 16, color: "var(--ink)", borderLeft: "2px solid var(--accent)", paddingLeft: 16, marginBottom: 12, fontStyle: "normal" }}>
                        &ldquo;{review.quote}&rdquo;
                      </blockquote>
                    )}
                    <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.75 }}>{review.content}</p>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 12 }}>
                      {formatDate(review.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Book Clubs Tab */}
        {activeTab === "bookclubs" && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>
              참여한 북클럽 ({mySessions.length}개)
            </div>
            {mySessions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0", color: "var(--muted)" }}>
                <p style={{ marginBottom: 12 }}>아직 참여한 북클럽이 없어요.</p>
                <Link href="/bookclub" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none" }}>
                  북클럽 탐색하기 →
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {mySessions.map((s) => (
                  <div key={s.id} style={{ padding: "20px 24px", borderRadius: 12, border: "1px solid var(--line-soft)", background: "rgba(255,255,255,0.4)" }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", marginBottom: 8 }}>
                      {s.question?.title ?? "북토크"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <Calendar size={12} /> {formatDate(s.date)}
                    </div>
                    <div style={{ fontSize: 11, padding: "3px 8px", borderRadius: 9999, display: "inline-block", background: s.status === "upcoming" ? "rgba(94,70,50,0.1)" : "var(--bg-warm)", color: s.status === "upcoming" ? "var(--accent)" : "var(--muted)" }}>
                      {s.status === "upcoming" ? "예정" : s.status === "live" ? "진행 중" : "종료"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Membership Tab */}
        {activeTab === "membership" && (
          <div>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
                멤버십
              </div>
              <h2 style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 28, fontWeight: 400, color: "var(--ink)", marginBottom: 8 }}>
                질문하는 사람들과 함께<br />
                <em style={{ fontStyle: "normal", fontWeight: 600, color: "var(--accent)", fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>더 깊이</em> 탐구하세요.
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              {MEMBERSHIP_TIERS.map((tier) => (
                <div key={tier.id} style={{
                  borderRadius: 20, overflow: "hidden",
                  border: tier.isPopular ? `2px solid ${tier.color}` : "1px solid var(--line-soft)",
                  background: tier.isPopular ? tier.color : "rgba(255,255,255,0.5)",
                  position: "relative",
                }}>
                  {tier.isPopular && (
                    <div style={{
                      position: "absolute", top: 16, right: 16,
                      padding: "4px 10px", borderRadius: 9999,
                      background: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)",
                      fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>
                      추천
                    </div>
                  )}
                  <div style={{ padding: 32 }}>
                    <div style={{ marginBottom: 24 }}>
                      <h3 style={{
                        fontFamily: '"EB Garamond", Georgia, serif',
                        fontSize: 28, fontStyle: "italic",
                        color: tier.isPopular ? "white" : "var(--ink)",
                        marginBottom: 4,
                      }}>
                        {tier.name}
                      </h3>
                      <p style={{ fontSize: 13, color: tier.isPopular ? "rgba(255,255,255,0.6)" : "var(--muted)" }}>
                        {tier.subtitle}
                      </p>
                      <div style={{ marginTop: 16, fontSize: 24, fontWeight: 600, color: tier.isPopular ? "white" : "var(--ink)" }}>
                        {tier.price}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                      {tier.benefits.map((b) => (
                        <div key={b} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: tier.isPopular ? "rgba(255,255,255,0.8)" : "var(--ink-soft)" }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: tier.isPopular ? "rgba(255,255,255,0.5)" : "var(--accent)", flexShrink: 0 }} />
                          {b}
                        </div>
                      ))}
                    </div>

                    <button style={{
                      width: "100%", padding: "13px 0", borderRadius: 10,
                      fontSize: 14, fontWeight: 500,
                      background: tier.isPopular ? "rgba(255,255,255,0.2)" : tier.color,
                      color: tier.isPopular ? "white" : "white",
                      border: tier.isPopular ? "1px solid rgba(255,255,255,0.3)" : "none",
                      cursor: "pointer", transition: "opacity 0.2s",
                    }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                    >
                      시작하기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === "questions" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>
                작성한 질문
              </div>
              <Link href="/questions/create" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none" }}>
                질문 작성하기 →
              </Link>
            </div>
            <div style={{ textAlign: "center", padding: "64px 0", color: "var(--muted)" }}>
              <p>아직 작성한 질문이 없어요.</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>당신의 첫 질문을 남겨보세요.</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .grid-responsive { grid-template-columns: 1fr !important; }
          .sidebar-hide { display: none !important; }
        }
      `}</style>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
