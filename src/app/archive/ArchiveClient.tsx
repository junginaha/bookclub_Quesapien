"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThumbsUp, BookOpen, MessageSquare, FileText, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import LikeButton from "@/components/reviews/LikeButton";
import AISummaryBlock from "@/components/seo/AISummaryBlock";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Review = any;

type TabType = "reviews" | "questions" | "discussions" | "talks";

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

export default function ArchiveClient({ initialReviews }: { initialReviews: Review[] }) {
  const [activeTab, setActiveTab] = useState<TabType>("reviews");
  const [photoFilter, setPhotoFilter] = useState<"all" | "text" | "photo">("all");
  const totalLikes = initialReviews.reduce((a: number, r: Review) => a + (r.likes ?? 0), 0);
  const filtered = photoFilter === "all" ? initialReviews : initialReviews.filter((r: Review) => r.type === photoFilter);

  const TABS = [
    { key: "reviews" as const, label: "후기 아카이브", icon: <ThumbsUp size={14} />, count: initialReviews.length },
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
          <div style={{ fontSize: 11.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--muted)", fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "italic", marginBottom: 20 }}>
            Archiving — 아카이빙
          </div>
          <h1 style={{
            fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 400, lineHeight: 1.2, letterSpacing: "-0.02em",
            color: "var(--ink)", marginBottom: 16,
          }}>
            질문과 독서의<br />
            <em style={{ fontStyle: "italic", color: "var(--accent)", fontFamily: '"EB Garamond", Georgia, serif' }}>기록</em>.
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
            <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
              {(["all", "text", "photo"] as const).map((f) => (
                <button key={f} onClick={() => setPhotoFilter(f)} style={{
                  padding: "7px 18px", borderRadius: 9999, fontSize: 13.5,
                  fontWeight: photoFilter === f ? 500 : 400,
                  background: photoFilter === f ? "var(--ink)" : "transparent",
                  color: photoFilter === f ? "var(--cream-on-dark)" : "var(--ink-soft)",
                  border: photoFilter === f ? "1px solid var(--ink)" : "1px solid var(--line)",
                  cursor: "pointer", transition: "all 0.2s",
                }}>
                  {{ all: "전체", text: "텍스트", photo: "사진" }[f]}
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
                        <blockquote style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 14, color: "var(--ink)", borderLeft: "2px solid var(--accent)", paddingLeft: 12, fontStyle: "italic" }}>
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
                  fontSize: 36, fontStyle: "italic",
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
                        <span style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: 22, fontStyle: "italic", color: "var(--accent)", opacity: 0.4, lineHeight: 1, flexShrink: 0, minWidth: 20 }}>
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
