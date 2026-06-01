"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ThumbsUp, BookOpen, MessageSquare, FileText, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import LikeButton from "@/components/reviews/LikeButton";
import AISummaryBlock from "@/components/seo/AISummaryBlock";
import AIReviewSummary from "@/components/archive/AIReviewSummary";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Review = any;

type TabType = "reviews" | "questions" | "discussions" | "talks" | "cases";

const STATIC_QUESTIONS = [
  { id: "aq1", content: "당신은 마지막으로 언제, 진심으로 울었나요?", author_name: "편집팀", likes: 1284, answers_count: 72, created_at: "2026-05-22" },
  { id: "aq2", content: "인간은 왜 외로운가요?", author_name: "민재", likes: 842, answers_count: 56, created_at: "2026-05-19" },
  { id: "aq3", content: "AI 시대에도 사랑은 여전히 중요할까요?", author_name: "서연", likes: 1103, answers_count: 91, created_at: "2026-05-16" },
  { id: "aq4", content: "당신을 살게 만든 한 문장은 무엇인가요?", author_name: "현우", likes: 2071, answers_count: 143, created_at: "2026-05-13" },
  { id: "aq5", content: "실패를 얼마나 오래 기억하시나요?", author_name: "지우", likes: 634, answers_count: 48, created_at: "2026-05-10" },
];

const STATIC_DISCUSSIONS = [
  { id: "d1", title: "다정함의 발명 발제문", book: "다정함의 발명 (허지영)", host: "정해린", date: "2026-05-14", questions: ["다정함이란 무엇인가?", "받은 다정함 중 가장 오래 남은 것은?", "다정함과 의존의 차이는?"] },
  { id: "d2", title: "혼자라는 감각 발제문", book: "혼자라는 감각 (주성원)", host: "서민준", date: "2026-04-28", questions: ["혼자 있을 때 무엇을 느끼나요?", "외로움과 고독의 차이는?", "혼자인 시간이 준 것은?"] },
  { id: "d3", title: "외로움 시즌 Week 3 발제문", book: "Season 04 큐레이션", host: "정해린", date: "2026-05-21", questions: ["함께 있어도 외로운 경험?", "외로움을 치유하는 방법?", "혼자이기에 가능한 것은?"] },
];

const STATIC_TALKS = [
  { id: "t1", title: "관계 회복 시즌 · 종료 보고", season: "Season 03", participants: 38, date: "2026-03-15", summary: "멀어진 사람에게 다시 다가가는 일에 대한 12주간의 기록." },
  { id: "t2", title: "AI와 인간 시즌 · 종료 보고", season: "Season 02", participants: 45, date: "2025-12-20", summary: "기계의 시대에 인간으로 남는 법을 탐구한 가을의 기록." },
  { id: "t3", title: "사랑 시즌 · 종료 보고", season: "Season 01", participants: 29, date: "2025-09-10", summary: "우리가 사랑이라 부른 것의 다른 이름들. 첫 번째 시즌의 기록." },
];

const LEADER_CASES = [
  {
    id: "lc-j",
    initial: "J",
    name: "정해린",
    role: "시즌 04 진행자",
    philosophy: "정답보다 진심을 믿습니다. 우리는 결론을 미루는 연습 중입니다.",
    color: "#5E4632",
    question: "당신이 가장 오래 미뤄둔 감정은 무엇인가요?",
    story: "처음 북클럽을 열었을 때 저는 '잘 진행해야 한다'는 생각으로 가득했어요. 그런데 4시즌이 지나고 나서야 알았어요. 가장 좋은 북클럽은 내가 사라질 때 시작된다는 걸. 참여자들이 제 질문을 잊고 서로의 눈을 보기 시작할 때, 그때가 진짜였어요.",
    season: "Season 04 · 2026년 봄",
    change: "질문하는 사람에서 질문을 내려놓는 사람이 되었습니다.",
  },
  {
    id: "lc-s",
    initial: "S",
    name: "서민준",
    role: "시즌 03 진행자",
    philosophy: "조용한 사람의 한 문장은 시끄러운 사람의 한 시간보다 길게 남습니다.",
    color: "#2C5364",
    question: "당신이 마지막으로 누군가에게 진심으로 사과한 건 언제였나요?",
    story: "외로움 시즌 3주차에 한 참여자가 말했어요. '누군가 내 이야기를 이렇게 끝까지 들어준 건 처음이에요.' 저는 아무 말도 하지 않았는데요. 그 침묵이 제가 줄 수 있는 가장 깊은 경청이었다고 생각해요.",
    season: "Season 03 · 2025년 겨울",
    change: "말하는 것보다 듣는 것이 더 어렵다는 걸 배웠습니다.",
  },
  {
    id: "lc-y",
    initial: "Y",
    name: "유은재",
    role: "시즌 02 진행자",
    philosophy: "대화는 답을 찾는 일이 아니라, 함께 머무는 일입니다.",
    color: "#3D2B1F",
    question: "기계가 더 잘하는 시대에, 인간으로 남고 싶은 부분이 있나요?",
    story: "AI와 인간을 주제로 한 시즌이었어요. 참여자 중 한 분이 '저는 AI보다 덜 논리적이라서 부끄럽다'고 하셨을 때, 다른 분이 조용히 '저도요'라고 했어요. 그 두 글자에 방 전체가 잠시 멈췄어요. 그게 인간이 할 수 있는 것이었어요.",
    season: "Season 02 · 2025년 가을",
    change: "불완전함을 나누는 것이 연결의 시작이라는 걸 알았습니다.",
  },
];

export default function ArchiveClient({ initialReviews }: { initialReviews: Review[] }) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabType | null) ?? "reviews";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [photoFilter, setPhotoFilter] = useState<"all" | "text" | "photo" | "video">("all");

  useEffect(() => {
    const tab = searchParams.get("tab") as TabType | null;
    if (tab) setActiveTab(tab);
  }, [searchParams]);
  const totalLikes = initialReviews.reduce((a: number, r: Review) => a + (r.likes ?? 0), 0);
  const filtered = photoFilter === "all" ? initialReviews : initialReviews.filter((r: Review) => r.type === photoFilter);

  const TABS = [
    { key: "reviews" as const, label: "후기 아카이브", icon: <ThumbsUp size={14} />, count: initialReviews.length },
    { key: "cases" as const, label: "진행자 사례", icon: <MessageSquare size={14} />, count: LEADER_CASES.length },
    { key: "questions" as const, label: "질문 아카이브", icon: <MessageSquare size={14} />, count: STATIC_QUESTIONS.length },
    { key: "discussions" as const, label: "발제문 아카이브", icon: <FileText size={14} />, count: STATIC_DISCUSSIONS.length },
    { key: "talks" as const, label: "북토크 기록", icon: <BookOpen size={14} />, count: STATIC_TALKS.length },
  ];

  return (
    <div style={{ background: "var(--bg)" }}>

      {/* ── Hero ── */}
      <section style={{
        padding: "72px 0 56px",
        borderBottom: "1px solid var(--line-soft)",
        background: "linear-gradient(to bottom, var(--bg-soft), var(--bg))",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
          <div style={{ fontSize: 11.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--muted)", fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "normal", marginBottom: 20 }}>
            Archiving — 아카이빙
          </div>
          <h1 style={{
            fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 400, lineHeight: 1.2, letterSpacing: "-0.02em",
            color: "var(--ink)", marginBottom: 16,
          }}>
            질문과 독서의<br />
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>기록</span>.
          </h1>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75, maxWidth: 480, marginBottom: 40 }}>
            지나간 시즌의 질문들, 후기들, 발제문들, 그리고 북토크의 기록.
            우리가 함께 쌓아온 지적 자산.
          </p>

          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              { value: `${initialReviews.length}+`, label: "후기" },
              { value: `${STATIC_QUESTIONS.length}+`, label: "아카이브 질문" },
              { value: String(totalLikes), label: "공감 수" },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 28, fontWeight: 400, color: "var(--ink)" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tab Navigation ── */}
      <div style={{ borderBottom: "1px solid var(--line-soft)", background: "var(--bg)", overflowX: "auto" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)", display: "flex" }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "14px 18px", fontSize: 14,
                fontWeight: activeTab === tab.key ? 500 : 400,
                color: activeTab === tab.key ? "var(--ink)" : "var(--muted)",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: activeTab === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -1, transition: "color 0.2s", whiteSpace: "nowrap",
              }}
            >
              {tab.icon} {tab.label}
              <span style={{ fontSize: 11, color: "var(--muted-2)", marginLeft: 2 }}>({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px clamp(20px, 4vw, 48px) 120px" }}>

        {/* ─ 후기 아카이브 ─ */}
        {activeTab === "reviews" && (
          <>
            {/* AI Review Summary */}
            <AIReviewSummary
              reviews={filtered.map((r: any) => ({ content: r.content ?? "", quote: r.quote ?? undefined }))}
              context="질문하는 사람들 북클럽 후기"
            />

            <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
              {(["all", "text", "photo", "video"] as const).map((f) => (
                <button key={f} onClick={() => setPhotoFilter(f)} style={{
                  padding: "7px 18px", borderRadius: 9999, fontSize: 13.5,
                  fontWeight: photoFilter === f ? 500 : 400,
                  background: photoFilter === f ? "var(--ink)" : "transparent",
                  color: photoFilter === f ? "var(--cream-on-dark)" : "var(--ink-soft)",
                  border: photoFilter === f ? "1px solid var(--ink)" : "1px solid var(--line)",
                  cursor: "pointer", transition: "all 0.2s",
                }}>
                  {{ all: "전체", text: "텍스트", photo: "사진", video: "영상" }[f as "all" | "text" | "photo" | "video"]}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
                {initialReviews.length === 0
                  ? "아직 후기가 없습니다. 모임에 참여하고 첫 후기를 남겨보세요!"
                  : "해당 유형의 후기가 없습니다."}
              </div>
            ) : (
              <div style={{ columns: "1 auto", columnWidth: 300, gap: 16 }}>
                {filtered.map((review: Review) => (
                  <div key={review.id} style={{
                    breakInside: "avoid", marginBottom: 16,
                    borderRadius: 12, overflow: "hidden",
                    border: "1px solid var(--line-soft)",
                    background: "rgba(255,255,255,0.5)",
                  }}>
                    {review.photo_url && (
                      <div style={{ position: "relative", height: 192, overflow: "hidden" }}>
                        <Image src={review.photo_url} alt="후기 사진" fill style={{ objectFit: "cover" }} sizes="(max-width:640px) 100vw, 33vw" />
                      </div>
                    )}
                    {review.video_url && !review.photo_url && (
                      <div style={{ position: "relative", overflow: "hidden", background: "#000", borderRadius: "12px 12px 0 0" }}>
                        {review.video_url.includes("youtube.com") || review.video_url.includes("youtu.be") ? (
                          <iframe
                            src={review.video_url.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}
                            style={{ width: "100%", height: 192, border: "none" }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video src={review.video_url} controls style={{ width: "100%", maxHeight: 240 }} />
                        )}
                      </div>
                    )}
                    <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "white" }}>
                            {review.author?.name?.[0] ?? "?"}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                            {review.author?.name ?? "익명"}
                          </span>
                        </div>
                        <LikeButton reviewId={review.id} likes={review.likes ?? 0} />
                      </div>
                      {review.quote && (
                        <blockquote style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 14, color: "var(--ink)", borderLeft: "2px solid var(--accent)", paddingLeft: 12, fontStyle: "normal" }}>
                          &ldquo;{review.quote}&rdquo;
                        </blockquote>
                      )}
                      <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.7 }}>{review.content}</p>
                      <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{formatDate(review.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─ 진행자 사례 ─ */}
        {activeTab === "cases" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.75, maxWidth: 560, marginBottom: 8 }}>
              시즌을 진행한 세 분의 이야기입니다. 그들이 북클럽을 통해 무엇을 발견했는지, 직접 남긴 기록이에요.
            </p>
            {LEADER_CASES.map((c) => (
              <article key={c.id} style={{
                borderRadius: 20, overflow: "hidden",
                border: "1px solid var(--line-soft)",
                background: "rgba(255,255,255,0.45)",
              }}>
                {/* Header bar */}
                <div style={{
                  padding: "28px 36px", display: "flex", gap: 20, alignItems: "flex-start",
                  background: `linear-gradient(135deg, ${c.color}18, ${c.color}06)`,
                  borderBottom: "1px solid var(--line-soft)",
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
                    background: c.color, display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                    fontSize: 26, color: "rgba(255,255,255,0.92)", fontWeight: 400,
                    boxShadow: `0 8px 24px -8px ${c.color}66`,
                  }}>
                    {c.initial}
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 20, fontWeight: 400, color: "var(--ink)", marginBottom: 4 }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: "0.04em", marginBottom: 12 }}>
                      {c.role} · {c.season}
                    </div>
                    <p style={{
                      fontFamily: '"EB Garamond", Georgia, serif',
                      fontStyle: "italic", fontSize: 15,
                      color: c.color, lineHeight: 1.6,
                      borderLeft: `2px solid ${c.color}66`, paddingLeft: 12,
                    }}>
                      &ldquo;{c.question}&rdquo;
                    </p>
                  </div>
                </div>
                {/* Story */}
                <div style={{ padding: "28px 36px" }}>
                  <p style={{
                    fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                    fontSize: 16, fontWeight: 300, lineHeight: 1.85,
                    color: "var(--ink-soft)", marginBottom: 24,
                    letterSpacing: "-0.005em",
                  }}>
                    {c.story}
                  </p>
                  <div style={{
                    padding: "16px 20px", borderRadius: 10,
                    background: `${c.color}0A`, border: `1px solid ${c.color}22`,
                  }}>
                    <div style={{ fontSize: 10.5, letterSpacing: "0.2em", textTransform: "uppercase", color: c.color, marginBottom: 6, fontFamily: '"EB Garamond", Georgia, serif' }}>
                      Change
                    </div>
                    <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.65, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
                      {c.change}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ─ 질문 아카이브 ─ */}
        {activeTab === "questions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {STATIC_QUESTIONS.map((q, i) => (
              <div key={q.id} style={{
                padding: "24px 28px", borderRadius: 12,
                border: "1px solid var(--line-soft)",
                background: "rgba(255,255,255,0.4)",
                display: "flex", gap: 20, alignItems: "flex-start",
              }}>
                <span style={{
                  fontFamily: '"EB Garamond", Georgia, serif',
                  fontSize: 36, fontStyle: "normal",
                  color: "var(--accent)", opacity: 0.3,
                  lineHeight: 1, flexShrink: 0,
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 18, color: "var(--ink)", lineHeight: 1.6, marginBottom: 12 }}>
                    {q.content}
                  </p>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--muted)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <ThumbsUp size={11} /> {q.likes.toLocaleString()}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <MessageSquare size={11} /> {q.answers_count}
                    </span>
                    <span>— {q.author_name}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={11} /> {q.created_at}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─ 발제문 아카이브 ─ */}
        {activeTab === "discussions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {STATIC_DISCUSSIONS.map((d) => (
              <div key={d.id} style={{
                borderRadius: 16, overflow: "hidden",
                border: "1px solid var(--line-soft)",
                background: "rgba(255,255,255,0.4)",
              }}>
                <div style={{ padding: "24px 28px 0" }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>
                    발제문 · {d.date}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 20, fontWeight: 400, color: "var(--ink)", marginBottom: 4 }}>
                    {d.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
                    {d.book} · 리더: {d.host}
                  </p>
                </div>
                <div style={{ padding: "0 28px 24px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {d.questions.map((q, i) => (
                      <div key={i} style={{
                        display: "flex", gap: 14, alignItems: "flex-start",
                        padding: "14px 16px", borderRadius: 10,
                        background: "rgba(255,255,255,0.5)",
                        border: "1px solid var(--line-soft)",
                      }}>
                        <span style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: 22, fontStyle: "normal", color: "var(--accent)", opacity: 0.4, lineHeight: 1, flexShrink: 0, minWidth: 20 }}>
                          {String(i + 1)}
                        </span>
                        <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6 }}>{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─ 북토크 기록 ─ */}
        {activeTab === "talks" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {STATIC_TALKS.map((t) => (
              <div key={t.id} style={{
                padding: "28px 32px", borderRadius: 16,
                border: "1px solid var(--line-soft)",
                background: "rgba(255,255,255,0.4)",
                display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap",
              }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>
                    {t.season} · {t.date}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 20, fontWeight: 400, color: "var(--ink)", marginBottom: 8 }}>
                    {t.title}
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.75 }}>{t.summary}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 36, fontWeight: 400, color: "var(--ink)" }}>
                    {t.participants}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>명 참여</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stage 3: AI Summary Block */}
      <AISummaryBlock
        what="아카이빙은 질문하는 사람들의 북토크 후기, 발제문, 질문, 시즌 기록을 보존하는 지식 저장소다."
        why="커뮤니티가 쌓아온 지적 자산을 열람하고, 과거 북토크의 통찰을 현재의 독서에 연결할 수 있다."
        who="독서 기록을 남기고 싶은 독자, 과거 북토크 참여자, 지식 아카이브를 탐색하고 싶은 사람."
        bullets={[
          "후기 아카이브: 텍스트/사진 후기 모음",
          "질문 아카이브: 역대 오늘의 질문과 인기 질문",
          "발제문 아카이브: 각 북토크의 토론 질문지",
          "북토크 기록: 시즌별 참여자 수와 핵심 내용",
        ]}
      />
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
