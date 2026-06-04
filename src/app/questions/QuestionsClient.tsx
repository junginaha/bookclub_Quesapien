"use client";

import { useState } from "react";
import Link from "next/link";
import { PenLine, MessageSquare, ChevronRight, Search, Pencil, Trash2, Check, X, Star, Calendar } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { isAdminEmail } from "@/lib/admin";
import {
  updateLandingQuestionAction,
  deleteLandingQuestionAction,
  toggleFeaturedLandingQuestion,
  toggleTodayLandingQuestion,
} from "@/lib/actions/landing-questions";
import { toast } from "sonner";

// ── 고정 UUID (DB 시드와 동일) ────────────────────────────────────────────
const IDS = {
  today: "a1000001-0000-0000-0000-000000000001",
  f1:    "a1000001-0000-0000-0000-000000000002",
  f2:    "a1000001-0000-0000-0000-000000000003",
  f3:    "a1000001-0000-0000-0000-000000000004",
  f4:    "a1000001-0000-0000-0000-000000000005",
  f5:    "a1000001-0000-0000-0000-000000000006",
  r1:    "a1000001-0000-0000-0000-000000000011",
  r2:    "a1000001-0000-0000-0000-000000000012",
  r3:    "a1000001-0000-0000-0000-000000000013",
  r4:    "a1000001-0000-0000-0000-000000000014",
  r5:    "a1000001-0000-0000-0000-000000000015",
  r6:    "a1000001-0000-0000-0000-000000000016",
  r7:    "a1000001-0000-0000-0000-000000000017",
  r8:    "a1000001-0000-0000-0000-000000000018",
  r9:    "a1000001-0000-0000-0000-000000000019",
  r10:   "a1000001-0000-0000-0000-000000000020",
  r11:   "a1000001-0000-0000-0000-000000000021",
  r12:   "a1000001-0000-0000-0000-000000000022",
  r13:   "a1000001-0000-0000-0000-000000000023",
  r14:   "a1000001-0000-0000-0000-000000000024",
  r15:   "a1000001-0000-0000-0000-000000000025",
};

// ── 정적 폴백 데이터 ──────────────────────────────────────────────────────
const STATIC_TODAY = {
  id: IDS.today,
  content: "당신은 마지막으로 언제, 진심으로 울었나요?",
  author_name: "편집팀",
  likes: 1284, saves: 397, answers_count: 72,
  is_featured: true, is_today: true,
  created_at: new Date().toISOString(),
};

const STATIC_FEATURED = [
  { id: IDS.f1, content: "인간은 왜 외로운가요?", author_name: "민재", likes: 842, answers_count: 56, saves: 124, tags: ["외로움", "철학"] },
  { id: IDS.f2, content: "AI 시대에도 사랑은 여전히 중요할까요?", author_name: "서연", likes: 1103, answers_count: 91, saves: 210, tags: ["사랑", "AI"] },
  { id: IDS.f3, content: "당신을 살게 만든 한 문장은 무엇인가요?", author_name: "현우", likes: 2071, answers_count: 143, saves: 387, tags: ["문장", "삶"] },
  { id: IDS.f4, content: "실패를 얼마나 오래 기억하시나요?", author_name: "지우", likes: 634, answers_count: 48, saves: 95, tags: ["실패", "성장"] },
  { id: IDS.f5, content: "지금 가장 피하고 싶은 대화는 무엇인가요?", author_name: "도연", likes: 723, answers_count: 62, saves: 108, tags: ["대화", "관계"] },
];

const STATIC_RECENT = [
  { id: IDS.r1, content: "혼자 여행을 떠나본 적 있나요? 그 여행이 당신에게 남긴 것은?", author_name: "재희", likes: 47, answers_count: 12, tags: ["여행", "고독"], created_at: daysAgo(1, 10) },
  { id: IDS.r2, content: "부모님께 아직 하지 못한 말이 있나요?", author_name: "하린", likes: 89, answers_count: 21, tags: ["가족", "관계"], created_at: daysAgo(1, 15) },
  { id: IDS.r3, content: "당신의 20대를 한 단어로 표현한다면?", author_name: "민수", likes: 156, answers_count: 34, tags: ["청춘", "성장"], created_at: daysAgo(1, 9) },
  { id: IDS.r4, content: "오늘 하루 중 가장 솔직했던 순간은 언제인가요?", author_name: "채현", likes: 23, answers_count: 8, tags: ["일상", "진심"], created_at: daysAgo(0, 20) },
  { id: IDS.r5, content: "지금 당신 곁에 있어줬으면 하는 사람은 누구인가요?", author_name: "은지", likes: 312, answers_count: 67, tags: ["관계", "외로움"], created_at: daysAgo(0, 14) },
  { id: IDS.r6, content: "읽다가 멈춘 책이 있나요? 왜 멈췄나요?", author_name: "진호", likes: 78, answers_count: 19, tags: ["독서", "책"], created_at: daysAgo(2, 11) },
  { id: IDS.r7, content: "당신에게 '집'은 어떤 의미인가요?", author_name: "세아", likes: 201, answers_count: 45, tags: ["일상", "공간"], created_at: daysAgo(2, 8) },
  { id: IDS.r8, content: "마지막으로 새로운 사람과 깊은 대화를 한 건 언제인가요?", author_name: "현우", likes: 134, answers_count: 28, tags: ["대화", "연결"], created_at: daysAgo(3, 19) },
  // 외로움 (3개 보장)
  { id: IDS.r9,  content: "혼자 밥을 먹을 때 어떤 생각이 드나요?", author_name: "소희", likes: 94, answers_count: 31, tags: ["외로움", "일상"], created_at: daysAgo(3, 12) },
  { id: IDS.r10, content: "외로움을 스스로 선택한 적이 있나요?", author_name: "정우", likes: 61, answers_count: 24, tags: ["외로움", "선택"], created_at: daysAgo(4, 9) },
  // 관계 (3개 보장)
  { id: IDS.r11, content: "오래된 친구가 떠오를 때, 그 감정은 무엇인가요?", author_name: "유나", likes: 118, answers_count: 38, tags: ["관계", "우정"], created_at: daysAgo(4, 15) },
  // 성장 (3개 보장)
  { id: IDS.r12, content: "실수로부터 배운 가장 중요한 것은 무엇인가요?", author_name: "재원", likes: 173, answers_count: 52, tags: ["성장", "실수"], created_at: daysAgo(5, 8) },
  { id: IDS.r13, content: "당신은 어떤 순간에 가장 크게 성장했나요?", author_name: "하은", likes: 139, answers_count: 44, tags: ["성장", "변화"], created_at: daysAgo(5, 17) },
  // 독서 (3개 보장)
  { id: IDS.r14, content: "책 한 권이 당신의 생각을 바꿔준 적이 있나요?", author_name: "도윤", likes: 87, answers_count: 29, tags: ["독서", "변화"], created_at: daysAgo(6, 10) },
  { id: IDS.r15, content: "당신이 가장 많이 밑줄 친 문장은 무엇인가요?", author_name: "서진", likes: 195, answers_count: 61, tags: ["독서", "문장"], created_at: daysAgo(6, 14) },
];

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  if (hour < 24) return `${hour}시간 전`;
  return `${day}일 전`;
}

// 오늘 기준 상대 날짜 생성 헬퍼
function daysAgo(d: number, h = 10): string {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  dt.setHours(h, 0, 0, 0);
  return dt.toISOString();
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
  const [localQuestions, setLocalQuestions] = useState<any[]>([]);

  // 관리자 상태
  const currentUser = useAppStore((s) => s.currentUser);
  const isAdmin = isAdminEmail(currentUser?.email);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // 로컬 질문 목록 (DB 삭제·수정 즉시 반영용)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [editedContents, setEditedContents] = useState<Record<string, string>>({});

  // ── 관리자 핸들러 ──────────────────────────────────────────────
  const startEdit = (q: any) => {
    setEditingId(q.id);
    setEditContent(editedContents[q.id] ?? q.content ?? "");
  };
  const cancelEdit = () => { setEditingId(null); setEditContent(""); };

  const handleSaveEdit = async (id: string) => {
    if (!editContent.trim() || editContent.trim().length < 5) { toast.error("5자 이상 입력해주세요."); return; }
    const result = await updateLandingQuestionAction(id, editContent.trim());
    if (result.error) { toast.error(result.error as string); return; }
    setEditedContents((prev) => ({ ...prev, [id]: editContent.trim() }));
    setEditingId(null);
    toast.success("수정됐어요.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 질문을 삭제할까요? 모든 답변도 함께 삭제됩니다.")) return;
    setDeletingId(id);
    const result = await deleteLandingQuestionAction(id);
    setDeletingId(null);
    if (result.error) { toast.error(result.error as string); return; }
    setHiddenIds((prev) => new Set([...prev, id]));
    toast.success("삭제됐어요.");
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    const result = await toggleFeaturedLandingQuestion(id, current);
    if (result.error) toast.error(result.error as string);
    else toast.success(current ? "인기 질문에서 제거했어요." : "인기 질문으로 설정했어요.");
  };

  const handleToggleToday = async (id: string, current: boolean) => {
    const result = await toggleTodayLandingQuestion(id, current);
    if (result.error) toast.error(result.error as string);
    else toast.success(current ? "오늘의 질문 해제했어요." : "오늘의 질문으로 설정했어요.");
  };

  const today = todayQuestion ?? STATIC_TODAY;
  const featured = featuredQuestions.length > 0 ? featuredQuestions : STATIC_FEATURED;
  const baseRecent = recentQuestions.length > 0 ? recentQuestions : STATIC_RECENT;
  // 로컬 질문을 맨 앞에 추가해서 즉시 반영
  const recent = [...localQuestions, ...baseRecent];

  const filtered = (search
    ? recent.filter((q: any) =>
        q.content?.includes(search) ||
        (q.tags ?? []).some((t: string) => t.includes(search))
      )
    : recent
  ).filter((q: any) => !hiddenIds.has(q.id));

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askContent.trim() || askContent.trim().length < 5) return;
    setAskStatus("sending");
    // 낙관적 업데이트: 제출 즉시 목록에 추가
    const optimisticQ = {
      id: `local-${Date.now()}`,
      content: askContent.trim(),
      author_name: askAuthor.trim() || "익명",
      likes: 0,
      answers_count: 0,
      tags: [],
      created_at: new Date().toISOString(),
    };
    setLocalQuestions((prev) => [optimisticQ, ...prev]);
    setAskContent(""); setAskAuthor("");
    try {
      const res = await fetch("/api/landing-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: optimisticQ.content, author_name: optimisticQ.author_name }),
      });
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      // 서버 응답 ID로 업데이트 (링크 연결용)
      if (data.question?.id) {
        setLocalQuestions((prev) =>
          prev.map((q) => q.id === optimisticQ.id ? { ...q, id: data.question.id } : q)
        );
      }
      setAskStatus("sent");
    } catch {
      setAskStatus("error");
      // 실패 시 낙관적 항목 제거
      setLocalQuestions((prev) => prev.filter((q) => q.id !== optimisticQ.id));
    }
    setTimeout(() => setAskStatus("idle"), 3000);
  };

  return (
    <div style={{ background: "var(--bg)", overflowX: "hidden" }}>

      {/* ── Page Header ── */}
      <section style={{
        padding: "clamp(72px, 10vw, 80px) 0 clamp(16px, 2.5vw, 32px)",
        borderBottom: "1px solid var(--line-soft)",
        background: "linear-gradient(to bottom, var(--bg-soft) 0%, var(--bg) 100%)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
          <div style={{ fontSize: 11.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--muted)", fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "italic", marginBottom: 18 }}>
            Questions — 질문
          </div>
          <h1 style={{
            fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
            fontSize: "clamp(22px, 4vw, 44px)",
            fontWeight: 400, lineHeight: 1.25, letterSpacing: "-0.02em", color: "var(--ink)",
            marginBottom: "clamp(14px, 2.5vw, 28px)",
          }}>
            좋은 질문은{" "}
            <em style={{ fontStyle: "normal", fontWeight: 600, color: "var(--accent)", background: "linear-gradient(90deg, var(--accent), #B08A4A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>좋은 사람</em>을 데려옵니다.
          </h1>

          {/* 검색 + 질문 작성 버튼 통합 */}
          <div className="q-search-row" style={{ display: "flex", gap: 10, alignItems: "center", maxWidth: 640 }}>
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.7)", border: "1px solid var(--line)",
              borderRadius: 12, padding: "12px 18px",
            }}>
              <Search size={15} style={{ color: "var(--muted)", flexShrink: 0 }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="질문 검색 — 외로움, 독서, 관계..."
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  fontSize: 14, color: "var(--ink)", fontFamily: "var(--font-noto-sans-kr), sans-serif",
                }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 0, display: "flex" }}>
                  ✕
                </button>
              )}
            </div>
            <Link
              href="/questions/create"
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "12px 20px", borderRadius: 12, flexShrink: 0,
                background: "var(--ink)", color: "var(--cream-on-dark)",
                fontSize: 13.5, fontWeight: 500, textDecoration: "none",
                letterSpacing: "0.01em", whiteSpace: "nowrap",
              }}
            >
              <PenLine size={13} /> 질문 작성
            </Link>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(20px, 3.5vw, 48px) clamp(16px, 4vw, 48px) clamp(48px, 8vw, 100px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 48 }} className="grid-responsive">

          {/* ── Left Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(28px, 4vw, 52px)" }}>

            {/* 오늘의 질문 */}
            {!search && !hiddenIds.has(today.id) && (
              <section>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", animation: "pulse 2s ease-in-out infinite" }} />
                    <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)" }}>
                      Today&apos;s Question — 오늘의 질문
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={async () => {
                        if (!confirm("오늘의 질문을 삭제할까요?")) return;
                        const result = await deleteLandingQuestionAction(today.id);
                        if (result.error) toast.error(result.error as string);
                        else { setHiddenIds((s) => new Set([...s, today.id])); toast.success("삭제됐어요."); }
                      }}
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:8, fontSize:12, background:"none", border:"1px solid rgba(239,68,68,0.3)", color:"#EF4444", cursor:"pointer" }}
                    >
                      <Trash2 size={11} /> 삭제
                    </button>
                  )}
                </div>
                <Link href={`/questions/${today.id}`} style={{ textDecoration: "none", display: "block" }}>
                  <div style={{
                    padding: "clamp(18px, 3.5vw, 36px) clamp(16px, 3.5vw, 40px)", borderRadius: 16,
                    background: "var(--ink)", color: "var(--cream-on-dark)",
                    position: "relative", overflow: "hidden",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(28,31,38,0.25)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                  >
                    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 60% at 90% 10%, rgba(176,138,74,0.18), transparent 60%)" }} />
                    <p style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: "clamp(16px, 2.5vw, 24px)", fontWeight: 400, lineHeight: 1.6, color: "var(--cream-on-dark)", marginBottom: "clamp(12px, 2vw, 24px)", position: "relative" }}>
                      {today.content}
                    </p>
                    <div className="q-today-meta" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                          <MessageSquare size={12} />
                          <strong style={{ color: "rgba(255,255,255,0.85)" }}>{today.answers_count?.toLocaleString()}</strong>
                          <span>개의 답변</span>
                        </div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>— {today.author_name}</div>
                      </div>
                      <div className="q-today-answer-btn" style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                        답변 보기 <ChevronRight size={13} />
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* 인기 질문 */}
            {!search && (
              <section>
                <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>
                  Popular — 인기 질문
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {featured.filter((q: any) => !hiddenIds.has(q.id)).map((q: any, i: number) => (
                    <div key={q.id} style={{ position: "relative" }}>
                      <Link href={`/questions/${q.id}`} style={{ textDecoration: "none", display: "block" }}>
                        <div style={{
                          display: "flex", gap: 16, alignItems: "center",
                          padding: "16px 20px", paddingRight: isAdmin ? "52px" : "20px", borderRadius: 12,
                          border: "1px solid var(--line-soft)",
                          background: i === 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)",
                          transition: "all 0.18s ease", cursor: "pointer",
                        }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.95)"; (e.currentTarget as HTMLElement).style.transform = "translateX(3px)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = i === 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLElement).style.transform = "translateX(0)"; }}
                        >
                          <span className="q-pop-num" style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: 28, fontStyle: "italic", color: "var(--accent)", opacity: i === 0 ? 0.9 : 0.3, lineHeight: 1, flexShrink: 0, minWidth: 28, textAlign: "center" }}>
                            {i + 1}
                          </span>
                          <div className="q-pop-content" style={{ flex: 1, minWidth: 0 }}>
                            <p className="q-pop-text" style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 15.5, color: "var(--ink)", lineHeight: 1.55, marginBottom: 7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {q.content}
                            </p>
                            <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--muted)" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: 3 }}><MessageSquare size={11} /> {q.answers_count?.toLocaleString()} 답변</span>
                              <span>— {q.author_name}</span>
                            </div>
                          </div>
                          <ChevronRight size={14} style={{ color: "var(--muted)", flexShrink: 0 }} />
                        </div>
                      </Link>
                      {/* 관리자 삭제 버튼 */}
                      {isAdmin && (
                        <button
                          onClick={async (e) => { e.stopPropagation(); if (!confirm("삭제할까요?")) return; const r = await deleteLandingQuestionAction(q.id); if (r.error) toast.error(r.error as string); else { setHiddenIds((s) => new Set([...s, q.id])); toast.success("삭제됐어요."); } }}
                          style={{ position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 7, padding: "5px 8px", cursor: "pointer", color: "#EF4444", display: "flex", alignItems: "center" }}
                          title="삭제"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 최근 질문 / 검색 결과 */}
            <section>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)" }}>
                  {search ? `"${search}" 검색 결과` : "Recent — 최근 질문"}
                </div>
                {search && filtered.length > 0 && (
                  <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{filtered.length}개</span>
                )}
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "var(--muted)" }}>
                  <p style={{ marginBottom: 12, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>검색된 질문이 없어요.</p>
                  <button onClick={() => setSearch("")} style={{ fontSize: 13, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
                    전체 보기
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {filtered.map((q: any) => {
                    const displayContent = editedContents[q.id] ?? q.content;
                    const isEditing = editingId === q.id;
                    const isDeleting = deletingId === q.id;
                    return (
                      <article
                        key={q.id}
                        style={{
                          padding: "20px 24px", borderRadius: 12,
                          border: `1px solid ${isEditing ? "var(--accent)" : "var(--line-soft)"}`,
                          background: isEditing ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)",
                          transition: "all 0.18s ease",
                          opacity: isDeleting ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!isEditing) {
                            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.85)";
                            (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isEditing) {
                            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.4)";
                            (e.currentTarget as HTMLElement).style.borderColor = "var(--line-soft)";
                          }
                        }}
                      >
                        {/* 관리자 편집 모드 */}
                        {isAdmin && isEditing ? (
                          <div>
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={3}
                              style={{
                                width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 15,
                                border: "1px solid var(--line)", background: "rgba(255,255,255,0.8)",
                                color: "var(--ink)", outline: "none", resize: "vertical",
                                fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                                lineHeight: 1.65, boxSizing: "border-box", marginBottom: 10,
                              }}
                              autoFocus
                            />
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => handleSaveEdit(q.id)}
                                style={{
                                  display: "inline-flex", alignItems: "center", gap: 5,
                                  padding: "7px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 500,
                                  background: "var(--ink)", color: "var(--cream-on-dark)",
                                  border: "none", cursor: "pointer",
                                }}
                              >
                                <Check size={12} /> 저장
                              </button>
                              <button
                                onClick={cancelEdit}
                                style={{
                                  display: "inline-flex", alignItems: "center", gap: 5,
                                  padding: "7px 14px", borderRadius: 8, fontSize: 12.5,
                                  background: "none", color: "var(--muted)",
                                  border: "1px solid var(--line)", cursor: "pointer",
                                }}
                              >
                                <X size={12} /> 취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          <Link href={`/questions/${q.id}`} style={{ textDecoration: "none", display: "block" }}>
                            <p style={{
                              fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                              fontSize: 15.5, color: "var(--ink)", lineHeight: 1.65, marginBottom: 10,
                            }}>
                              {displayContent}
                            </p>
                          </Link>
                        )}

                        <div className="q-recent-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                          <div className="q-recent-tags" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {(q.tags ?? []).slice(0, 3).map((tag: string) => (
                              <button
                                key={tag}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSearch(search === tag ? "" : tag); }}
                                style={{
                                  fontSize: 11.5, padding: "3px 9px", borderRadius: 9999,
                                  background: search === tag ? "var(--accent)" : "var(--bg-warm)",
                                  color: search === tag ? "white" : "var(--muted)",
                                  border: "none", cursor: "pointer",
                                  transition: "all 0.15s",
                                }}
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                          <div className="q-recent-meta" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", gap: 10, fontSize: 12, color: "var(--muted)", alignItems: "center", flexWrap: "wrap" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                <MessageSquare size={11} /> {q.answers_count} 답변
                              </span>
                              <span>— {q.author_name}</span>
                              {q.created_at && <span>{formatTimeAgo(q.created_at)}</span>}
                            </div>
                            {/* 관리자 버튼 */}
                            {isAdmin && !isEditing && (
                              <div className="q-admin-btns" style={{ display: "flex", gap: 4 }}>
                                <button
                                  title="수정"
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); startEdit(q); }}
                                  style={{ background: "none", border: "1px solid var(--line-soft)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center" }}
                                >
                                  <Pencil size={11} />
                                </button>
                                <button
                                  title="삭제"
                                  disabled={isDeleting}
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(q.id); }}
                                  style={{ background: "none", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#EF4444", display: "flex", alignItems: "center" }}
                                >
                                  <Trash2 size={11} />
                                </button>
                                {q.is_featured !== undefined && (
                                  <button
                                    title={q.is_featured ? "인기 해제" : "인기 설정"}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleFeatured(q.id, !!q.is_featured); }}
                                    style={{ background: "none", border: "1px solid var(--line-soft)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: q.is_featured ? "var(--gold)" : "var(--muted)", display: "flex", alignItems: "center" }}
                                  >
                                    <Star size={11} />
                                  </button>
                                )}
                                {q.is_today !== undefined && (
                                  <button
                                    title={q.is_today ? "Today 해제" : "Today 설정"}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleToday(q.id, !!q.is_today); }}
                                    style={{ background: "none", border: "1px solid var(--line-soft)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: q.is_today ? "var(--accent)" : "var(--muted)", display: "flex", alignItems: "center" }}
                                  >
                                    <Calendar size={11} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* ── Right Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="sidebar-hide">

            {/* 질문 남기기 */}
            <div style={{
              padding: 28, borderRadius: 16,
              background: "rgba(255,255,255,0.55)",
              border: "1px solid var(--line-soft)",
            }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>
                질문 남기기
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 16, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
                마음속에 오래 남아 있던 질문을 커뮤니티에 남겨보세요.
              </p>

              {askStatus === "sent" ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: 36, color: "var(--accent)", marginBottom: 10 }}>?</div>
                  <p style={{ fontSize: 14, color: "var(--ink-soft)", fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>질문이 잘 전달됐어요.</p>
                  <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>누군가의 마음에 닿을 거예요.</p>
                </div>
              ) : (
                <form onSubmit={handleAskSubmit}>
                  <textarea
                    value={askContent}
                    onChange={(e) => setAskContent(e.target.value)}
                    placeholder="당신의 질문을 적어주세요."
                    rows={4}
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.6)",
                      border: "1px solid var(--line)", borderRadius: 10,
                      padding: "12px 14px", fontSize: 13.5, color: "var(--ink)",
                      lineHeight: 1.65, resize: "none", outline: "none",
                      fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                      marginBottom: 8, boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--line)"; }}
                  />
                  <input
                    value={askAuthor}
                    onChange={(e) => setAskAuthor(e.target.value)}
                    placeholder="닉네임 (익명도 괜찮아요)"
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.6)",
                      border: "1px solid var(--line)", borderRadius: 10,
                      padding: "9px 14px", fontSize: 13, color: "var(--ink)",
                      outline: "none", fontFamily: "var(--font-noto-sans-kr), sans-serif",
                      marginBottom: 10, boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={askContent.trim().length < 5 || askStatus === "sending"}
                    style={{
                      width: "100%", padding: "11px 0",
                      borderRadius: 10, fontSize: 13.5, fontWeight: 500,
                      background: askContent.trim().length >= 5 ? "var(--ink)" : "var(--line-soft)",
                      color: askContent.trim().length >= 5 ? "var(--cream-on-dark)" : "var(--muted)",
                      border: "none", cursor: askContent.trim().length >= 5 ? "pointer" : "not-allowed",
                      transition: "all 0.2s",
                    }}
                  >
                    {askStatus === "sending" ? "전송 중…" : "질문 남기기"}
                  </button>
                  {askStatus === "error" && (
                    <p style={{ fontSize: 12, color: "#EF4444", marginTop: 8, textAlign: "center" }}>잠시 후 다시 눌러주세요.</p>
                  )}
                </form>
              )}
            </div>

            {/* 태그 탐색 */}
            <div style={{
              padding: "22px 24px", borderRadius: 16,
              background: "rgba(255,255,255,0.4)",
              border: "1px solid var(--line-soft)",
            }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>
                태그로 탐색
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["외로움", "관계", "성장", "일", "사랑", "가족", "독서", "죽음", "의미", "자유", "두려움", "창작"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearch(search === tag ? "" : tag)}
                    style={{
                      fontSize: 12.5, padding: "5px 12px", borderRadius: 9999,
                      background: search === tag ? "var(--ink)" : "var(--bg-soft)",
                      color: search === tag ? "var(--cream-on-dark)" : "var(--ink-soft)",
                      border: "1px solid", borderColor: search === tag ? "var(--ink)" : "var(--line-soft)",
                      cursor: "pointer", transition: "all 0.18s",
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 질문 현황 */}
            <div style={{
              padding: "22px 24px", borderRadius: 16,
              background: "var(--ink)", color: "var(--cream-on-dark)",
            }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 18 }}>
                질문 현황
              </div>
              {[
                { value: "2,847", label: "누적 질문 수" },
                { value: "14,203", label: "누적 답변 수" },
                { value: "973", label: "이번 달 참여자" },
              ].map((s) => (
                <div key={s.label} style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 26, fontWeight: 400, color: "white", letterSpacing: "-0.02em" }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, marginTop: 4 }}>
                <Link
                  href="/questions/create"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "10px 0", borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontSize: 13, color: "rgba(255,255,255,0.7)",
                    textDecoration: "none", transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}
                >
                  <PenLine size={12} /> 질문 작성하기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.5); }
        }

        /* ── 태블릿/중간 화면 (769~1024px) ── */
        @media (max-width: 1024px) {
          .grid-responsive { grid-template-columns: 1fr 300px !important; gap: 28px !important; }
        }

        /* ── 모바일 (≤768px): 사이드바 숨김, 단일 컬럼 ── */
        @media (max-width: 768px) {
          .grid-responsive { grid-template-columns: 1fr !important; gap: 0 !important; }
          .sidebar-hide { display: none !important; }
        }

        /* ── 소형 모바일 (≤540px) ── */
        @media (max-width: 540px) {
          /* 검색바 */
          .q-search-row { flex-direction: column !important; gap: 8px !important; }
          .q-search-row a { width: 100% !important; justify-content: center; }

          /* 오늘의 질문 — 답변 보기 항상 표시 */
          .q-today-meta { flex-direction: row !important; flex-wrap: wrap !important; gap: 6px 12px !important; }
          .q-today-answer-btn { font-size: 12px !important; }

          /* 인기 질문 — 번호 작게, 텍스트 2줄 허용 */
          .q-pop-num { font-size: 20px !important; min-width: 20px !important; }
          .q-pop-text { white-space: normal !important; overflow: hidden !important;
            display: -webkit-box !important; -webkit-box-orient: vertical !important;
            -webkit-line-clamp: 2 !important; }
          .q-pop-content { min-width: 0 !important; }

          /* 최근 질문 카드 */
          .q-recent-footer { flex-direction: column !important; align-items: flex-start !important; gap: 6px !important; }
          .q-recent-meta { flex-wrap: wrap !important; gap: 4px 10px !important; }
          .q-admin-btns { flex-wrap: wrap !important; gap: 4px !important; }
        }

        /* ── 극소형 (≤380px) ── */
        @media (max-width: 380px) {
          .q-pop-num { display: none !important; }
          .q-pop-text { font-size: 14px !important; }
        }
      `}</style>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
