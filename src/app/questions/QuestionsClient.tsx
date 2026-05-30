"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, PenLine, ThumbsUp, MessageSquare, Bookmark, ChevronRight } from "lucide-react";

// ─── Static fallback data ────────────────────────────────────
const STATIC_TODAY = {
  id: "today-1",
  content: "당신은 마지막으로 언제, 진심으로 울었나요?",
  author_name: "편집팀",
  likes: 1284, saves: 397, answers_count: 72,
  is_featured: true, is_today: true,
  created_at: new Date().toISOString(),
};

const STATIC_FEATURED = [
  { id: "f1", content: "인간은 왜 외로운가요?", author_name: "민재", likes: 842, answers_count: 56, saves: 124 },
  { id: "f2", content: "AI 시대에도 사랑은 여전히 중요할까요?", author_name: "서연", likes: 1103, answers_count: 91, saves: 210 },
  { id: "f3", content: "당신을 살게 만든 한 문장은 무엇인가요?", author_name: "현우", likes: 2071, answers_count: 143, saves: 387 },
  { id: "f4", content: "실패를 얼마나 오래 기억하시나요?", author_name: "지우", likes: 634, answers_count: 48, saves: 95 },
  { id: "f5", content: "지금 가장 피하고 싶은 대화는 무엇인가요?", author_name: "도연", likes: 723, answers_count: 62, saves: 108 },
];

const STATIC_RECENT = [
  { id: "r1", content: "혼자 여행을 떠나본 적 있나요? 그 여행이 당신에게 남긴 것은?", author_name: "재희", likes: 47, answers_count: 12, tags: ["여행", "고독"], created_at: "2026-05-30T10:00:00" },
  { id: "r2", content: "부모님께 아직 하지 못한 말이 있나요?", author_name: "하린", likes: 89, answers_count: 21, tags: ["가족", "관계"], created_at: "2026-05-29T15:30:00" },
  { id: "r3", content: "당신의 20대를 한 단어로 표현한다면?", author_name: "민수", likes: 156, answers_count: 34, tags: ["청춘", "성장"], created_at: "2026-05-29T09:00:00" },
  { id: "r4", content: "오늘 하루 중 가장 솔직했던 순간은 언제인가요?", author_name: "채현", likes: 23, answers_count: 8, tags: ["일상", "진심"], created_at: "2026-05-28T20:00:00" },
  { id: "r5", content: "지금 당신 곁에 있어줬으면 하는 사람은 누구인가요?", author_name: "은지", likes: 312, answers_count: 67, tags: ["관계", "외로움"], created_at: "2026-05-28T14:00:00" },
  { id: "r6", content: "읽다가 멈춘 책이 있나요? 왜 멈췄나요?", author_name: "진호", likes: 78, answers_count: 19, tags: ["독서", "책"], created_at: "2026-05-27T11:00:00" },
  { id: "r7", content: "당신에게 '집'은 어떤 의미인가요?", author_name: "세아", likes: 201, answers_count: 45, tags: ["일상", "공간"], created_at: "2026-05-27T08:00:00" },
  { id: "r8", content: "마지막으로 새로운 사람과 깊은 대화를 한 건 언제인가요?", author_name: "현우", likes: 134, answers_count: 28, tags: ["대화", "연결"], created_at: "2026-05-26T19:00:00" },
];

function formatTimeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${diffDay}일 전`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function QuestionsClient({
  todayQuestion,
  featuredQuestions,
  recentQuestions,
}: {
  todayQuestion: any;
  featuredQuestions: any[];
  recentQuestions: any[];
}) {
  const [search, setSearch] = useState("");
  const [askContent, setAskContent] = useState("");
  const [askAuthor, setAskAuthor] = useState("");
  const [askStatus, setAskStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const today = todayQuestion ?? STATIC_TODAY;
  const featured = featuredQuestions.length > 0 ? featuredQuestions : STATIC_FEATURED;
  const recent = recentQuestions.length > 0 ? recentQuestions : STATIC_RECENT;

  const filtered = search
    ? recent.filter((q: any) => q.content?.includes(search) || (q.tags ?? []).some((t: string) => t.includes(search)))
    : recent;

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askContent.trim() || askContent.trim().length < 5) return;
    setAskStatus("sending");
    try {
      const res = await fetch("/api/landing-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: askContent.trim(), author_name: askAuthor.trim() || "익명" }),
      });
      if (!res.ok) throw new Error("fail");
      setAskStatus("sent");
      setAskContent(""); setAskAuthor("");
    } catch {
      setAskStatus("error");
    }
    setTimeout(() => setAskStatus("idle"), 3000);
  };

  return (
    <div style={{ background: "var(--bg)" }}>

      {/* ── Page Header ── */}
      <section style={{
        padding: "72px 0 56px",
        borderBottom: "1px solid var(--line-soft)",
        background: "linear-gradient(to bottom, var(--bg-soft) 0%, var(--bg) 100%)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
          <div style={{ fontSize: 11.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--muted)", fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "italic", marginBottom: 20 }}>
            Questions — 질문
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 36 }}>
            <h1 style={{
              fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
              fontSize: "clamp(28px, 5vw, 52px)",
              fontWeight: 400, lineHeight: 1.2, letterSpacing: "-0.02em", color: "var(--ink)",
            }}>
              좋은 질문은<br />
              <em style={{ fontStyle: "italic", color: "var(--accent)", fontFamily: '"EB Garamond", Georgia, serif' }}>좋은 사람</em>을 데려옵니다.
            </h1>
            <Link href="/questions/create" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 9999,
              background: "var(--ink)", color: "var(--cream-on-dark)",
              fontSize: 14, fontWeight: 500, textDecoration: "none",
              letterSpacing: "0.02em", flexShrink: 0,
            }}>
              <PenLine size={14} /> 질문 작성
            </Link>
          </div>

          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(255,255,255,0.6)", border: "1px solid var(--line)",
            borderRadius: 12, padding: "12px 20px", maxWidth: 520,
          }}>
            <Search size={16} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="질문 검색..."
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontSize: 14, color: "var(--ink)", fontFamily: "var(--font-noto-sans-kr), sans-serif",
              }}
            />
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px clamp(20px, 4vw, 48px) 120px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 48 }} className="grid-responsive">

          {/* ── Left Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>

            {/* 오늘의 질문 */}
            {!search && (
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: "pulse 2s ease-in-out infinite" }} />
                  <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)" }}>
                    Today&apos;s Question — 오늘의 질문
                  </div>
                </div>
                <div style={{
                  padding: "40px", borderRadius: 20,
                  background: "var(--ink)", color: "var(--cream-on-dark)",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    background: "radial-gradient(ellipse 70% 60% at 90% 10%, rgba(176,138,74,0.15), transparent 60%)",
                  }} />
                  <p style={{
                    fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                    fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 400,
                    lineHeight: 1.55, color: "var(--cream-on-dark)",
                    marginBottom: 28, position: "relative",
                  }}>
                    {today.content}
                  </p>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", position: "relative" }}>
                    {[
                      { icon: <ThumbsUp size={13} />, value: today.likes?.toLocaleString(), label: "공감" },
                      { icon: <Bookmark size={13} />, value: today.saves?.toLocaleString(), label: "저장" },
                      { icon: <MessageSquare size={13} />, value: today.answers_count?.toLocaleString(), label: "답변" },
                    ].map((s) => (
                      <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                        {s.icon}
                        <strong style={{ color: "rgba(255,255,255,0.85)" }}>{s.value}</strong> {s.label}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 인기 질문 */}
            {!search && (
              <section>
                <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>
                  Popular — 인기 질문
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {featured.map((q: any, i: number) => (
                    <div key={q.id} style={{
                      display: "flex", gap: 16, alignItems: "flex-start",
                      padding: "18px 20px", borderRadius: 12,
                      border: "1px solid var(--line-soft)",
                      background: i === 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)",
                      transition: "background 0.2s", cursor: "pointer",
                    }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.9)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = i === 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)"; }}
                    >
                      <span style={{
                        fontFamily: '"EB Garamond", Georgia, serif',
                        fontSize: 32, fontStyle: "italic",
                        color: "var(--accent)", opacity: i === 0 ? 0.8 : 0.3,
                        lineHeight: 1, flexShrink: 0, minWidth: 32,
                      }}>
                        {String(i + 1)}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 16, color: "var(--ink)", lineHeight: 1.6, marginBottom: 10 }}>
                          {q.content}
                        </p>
                        <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--muted)" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <ThumbsUp size={11} /> {q.likes?.toLocaleString()}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <MessageSquare size={11} /> {q.answers_count}
                          </span>
                          <span>— {q.author_name}</span>
                        </div>
                      </div>
                      <ChevronRight size={15} style={{ color: "var(--muted)", flexShrink: 0, marginTop: 4 }} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 최근 질문 / 검색 결과 */}
            <section>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)" }}>
                  {search ? `검색 결과 — "${search}"` : "Recent — 최근 질문"}
                </div>
                {search && filtered.length > 0 && (
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{filtered.length}개</span>
                )}
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "var(--muted)" }}>
                  <p style={{ marginBottom: 12 }}>검색 결과가 없습니다.</p>
                  <button onClick={() => setSearch("")} style={{ fontSize: 13, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
                    전체 보기
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {filtered.map((q: any) => (
                    <article key={q.id} style={{
                      padding: "20px 24px", borderRadius: 12,
                      border: "1px solid var(--line-soft)",
                      background: "rgba(255,255,255,0.4)",
                      transition: "background 0.2s", cursor: "pointer",
                    }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.8)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.4)"; }}
                    >
                      <p style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 16, color: "var(--ink)", lineHeight: 1.65, marginBottom: 12 }}>
                        {q.content}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {(q.tags ?? []).map((tag: string) => (
                            <span key={tag} style={{
                              fontSize: 11.5, padding: "3px 9px", borderRadius: 9999,
                              background: "var(--bg-warm)", color: "var(--muted)",
                            }}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--muted)", alignItems: "center" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <ThumbsUp size={11} /> {q.likes}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <MessageSquare size={11} /> {q.answers_count}
                          </span>
                          <span>— {q.author_name}</span>
                          {q.created_at && <span>{formatTimeAgo(q.created_at)}</span>}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── Right Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="sidebar-hide">

            {/* 질문 남기기 */}
            <div style={{
              padding: 28, borderRadius: 16,
              background: "rgba(255,255,255,0.5)",
              border: "1px solid var(--line-soft)",
            }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>
                질문 남기기
              </div>

              {askStatus === "sent" ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: 36, color: "var(--accent)", marginBottom: 12 }}>?</div>
                  <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>질문이 전달되었습니다.</p>
                  <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>누군가의 마음에 닿을 거예요.</p>
                </div>
              ) : (
                <form onSubmit={handleAskSubmit}>
                  <textarea
                    value={askContent}
                    onChange={(e) => setAskContent(e.target.value)}
                    placeholder="마음 속에 오래 남아 있던 질문을 적어주세요."
                    rows={4}
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.5)",
                      border: "1px solid var(--line)", borderRadius: 10,
                      padding: "12px 16px", fontSize: 14, color: "var(--ink)",
                      lineHeight: 1.65, resize: "none", outline: "none",
                      fontFamily: "var(--font-noto-sans-kr), sans-serif",
                      marginBottom: 10, boxSizing: "border-box",
                    }}
                  />
                  <input
                    value={askAuthor}
                    onChange={(e) => setAskAuthor(e.target.value)}
                    placeholder="이름 (선택 · 익명 가능)"
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.5)",
                      border: "1px solid var(--line)", borderRadius: 10,
                      padding: "10px 16px", fontSize: 13, color: "var(--ink)",
                      outline: "none", fontFamily: "var(--font-noto-sans-kr), sans-serif",
                      marginBottom: 12, boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={askContent.trim().length < 5 || askStatus === "sending"}
                    style={{
                      width: "100%", padding: "12px 0",
                      borderRadius: 10, fontSize: 14, fontWeight: 500,
                      background: askContent.trim().length >= 5 ? "var(--ink)" : "var(--line-soft)",
                      color: askContent.trim().length >= 5 ? "var(--cream-on-dark)" : "var(--muted)",
                      border: "none", cursor: askContent.trim().length >= 5 ? "pointer" : "not-allowed",
                    }}
                  >
                    {askStatus === "sending" ? "전송 중…" : "질문 남기기"}
                  </button>
                  {askStatus === "error" && (
                    <p style={{ fontSize: 12, color: "#EF4444", marginTop: 8, textAlign: "center" }}>
                      잠시 후 다시 시도해주세요.
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* 질문 카테고리 */}
            <div style={{
              padding: "24px", borderRadius: 16,
              background: "rgba(255,255,255,0.4)",
              border: "1px solid var(--line-soft)",
            }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>
                태그로 탐색
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["외로움", "관계", "성장", "일", "사랑", "가족", "독서", "죽음", "의미", "자유", "두려움", "창작"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearch(tag)}
                    style={{
                      fontSize: 12.5, padding: "5px 12px", borderRadius: 9999,
                      background: search === tag ? "var(--ink)" : "var(--bg-soft)",
                      color: search === tag ? "var(--cream-on-dark)" : "var(--ink-soft)",
                      border: "none", cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 통계 */}
            <div style={{
              padding: "24px", borderRadius: 16,
              background: "var(--ink)", color: "var(--cream-on-dark)",
            }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
                질문 현황
              </div>
              {[
                { value: "2,847", label: "누적 질문 수" },
                { value: "18,392", label: "총 공감 수" },
                { value: "4,203", label: "답변 수" },
              ].map((s) => (
                <div key={s.label} style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 28, fontWeight: 400, color: "white" }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        @media (max-width: 768px) {
          .grid-responsive { grid-template-columns: 1fr !important; }
          .sidebar-hide { display: none !important; }
        }
      `}</style>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
