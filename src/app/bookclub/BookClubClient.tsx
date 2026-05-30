"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Calendar, Users, ChevronRight, Filter } from "lucide-react";

// ─── Static fallback data ─────────────────────────────────────
const STATIC_CLUBS = [
  {
    id: "1", slug: "다정함의-발명", title: "다정함의 발명", author: "허지영",
    color: "cream", genre: "에세이 · 산문", tag: "#관계 #사랑",
    host_name: "정해린", host_intro: "질문을 통해 사람의 마음을 읽습니다",
    schedule: "2026년 6월 14일 (토) 오후 3시", location: "서초구 서초동",
    max_participants: 8, current_participants: 5, status: "active",
    description: "사랑은 큰 사건이 아니라 매일 발명되는 작은 다정함이라는 말. 우리가 일상에서 놓치고 있는 다정함의 순간들을 함께 발견합니다.",
    session_dates: [{ date: "2026-06-14", topic: "다정함의 정의" }],
    why_this_book: "사랑을 거창하게 생각해온 우리에게 필요한 책입니다.",
    key_questions: ["당신이 가장 다정했던 순간은?", "받은 다정함 중 가장 오래 남은 것은?"],
    emotion_tags: ["#다정함", "#일상", "#연결"],
  },
  {
    id: "2", slug: "혼자라는-감각", title: "혼자라는 감각", author: "주성원",
    color: "rust", genre: "철학 · 에세이", tag: "#외로움 #인생전환",
    host_name: "서민준", host_intro: "조용한 목소리에 귀를 기울입니다",
    schedule: "2026년 6월 21일 (토) 오후 2시", location: "마포구 상수동",
    max_participants: 6, current_participants: 4, status: "active",
    description: "고독을 결핍이 아니라 깊이로 다루는 책. 혼자 있는 것이 부끄럽지 않아진 첫 책.",
    session_dates: [{ date: "2026-06-21", topic: "고독의 의미" }],
    why_this_book: "혼자이기 때문에 더 깊어지는 것들이 있습니다.",
    key_questions: ["혼자 있을 때 당신은 무엇을 느끼나요?", "외로움과 고독의 차이는?"],
    emotion_tags: ["#고독", "#성장", "#사유"],
  },
  {
    id: "3", slug: "아무도-보지-않는-오후", title: "아무도 보지 않는 오후", author: "김범",
    color: "olive", genre: "회고 · 에세이", tag: "#창업 #번아웃",
    host_name: "유은재", host_intro: "대화는 답을 찾는 일이 아니라 함께 머무는 일",
    schedule: "2026년 6월 28일 (토) 오후 4시", location: "용산구 한남동",
    max_participants: 10, current_participants: 3, status: "active",
    description: "실패한 사람이 아니라, 멈춰본 적 있는 사람의 문장. 무너졌던 시기에 챕터 7이 저를 일으켰습니다.",
    session_dates: [{ date: "2026-06-28", topic: "멈춤의 의미" }],
    why_this_book: "번아웃 이후를 어떻게 살아야 하는지 묻는 책.",
    key_questions: ["당신이 가장 지쳤던 순간은?", "멈추는 것이 용기일 때는 언제인가?"],
    emotion_tags: ["#회복", "#쉼", "#용기"],
  },
  {
    id: "4", slug: "외로움-시즌-위크4", title: "외로움 시즌 · Week 4", author: "큐레이션",
    color: "navy", genre: "시즌 북토크", tag: "#외로움 #연결",
    host_name: "정해린", host_intro: "Season 04 진행 리더",
    schedule: "2026년 7월 5일 (토) 오후 3시", location: "서초구 교대역",
    max_participants: 12, current_participants: 9, status: "active",
    description: "외로움 시즌의 네 번째 모임. 혼자 있어도 외롭지 않은 사람과, 함께 있어도 외로운 사람 사이의 거리.",
    session_dates: [{ date: "2026-07-05", topic: "함께 있는 외로움" }],
    why_this_book: "이번 시즌의 핵심 질문을 탐구합니다.",
    key_questions: ["함께 있어도 외로운 경험이 있나요?", "외로움을 치유하는 방법은?"],
    emotion_tags: ["#외로움", "#연결", "#시즌04"],
  },
  {
    id: "5", slug: "오늘-저녁-당신께", title: "오늘 저녁, 당신께", author: "박상현",
    color: "dusk", genre: "시집", tag: "#사랑 #이별",
    host_name: "서민준", host_intro: "느린 독서를 권합니다",
    schedule: "2026년 7월 12일 (토) 오후 6시", location: "종로구 부암동",
    max_participants: 8, current_participants: 8, status: "closed",
    description: "시집은 빠르게 읽지 않는 것이라고 가르쳐준 책. 한 페이지에서 일주일을 머문 적이 있어요.",
    session_dates: [{ date: "2026-07-12", topic: "시와 이별" }],
    why_this_book: "느리게 읽는 것의 가치를 느끼게 해주는 시집.",
    key_questions: ["당신이 가장 오래 머문 문장은?", "이별을 어떻게 기억하나요?"],
    emotion_tags: ["#느림", "#이별", "#기억"],
  },
  {
    id: "6", slug: "인간이라는-풍경", title: "인간이라는 풍경", author: "한강",
    color: "sage", genre: "논픽션 · 산문", tag: "#인간 #사유",
    host_name: "유은재", host_intro: "대화는 함께 머무는 일입니다",
    schedule: "2026년 7월 19일 (토) 오후 2시", location: "마포구 망원동",
    max_participants: 10, current_participants: 2, status: "upcoming",
    description: "인간을 풍경처럼 멀리서 바라보는 시선. 미워하던 사람을 다시 사람으로 보게 만드는 책.",
    session_dates: [{ date: "2026-07-19", topic: "인간이란 무엇인가" }],
    why_this_book: "타인을 새롭게 보는 눈을 갖게 해주는 책입니다.",
    key_questions: ["당신이 가장 이해하기 힘들었던 사람은?", "미워함이 연민으로 바뀐 경험은?"],
    emotion_tags: ["#관계", "#용서", "#거리"],
  },
];

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
  const clubs = initialClubs.length > 0 ? initialClubs : STATIC_CLUBS;
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
            <em style={{ fontStyle: "italic", color: "var(--accent)", fontFamily: '"EB Garamond", Georgia, serif' }}>만나는</em> 사람들.
          </h1>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75, maxWidth: 480, marginBottom: 40 }}>
            리더와 함께 읽고, 질문하고, 대화합니다.<br />
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
              해당 조건의 북클럽이 없습니다.
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
                            fontFamily: '"EB Garamond", Georgia, serif',
                            fontStyle: "italic",
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
                                ? "마감되었습니다"
                                : isUpcoming
                                ? "곧 오픈 예정"
                                : `잔여 ${remaining}석 / ${club.max_participants}명`}
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
