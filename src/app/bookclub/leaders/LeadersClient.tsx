"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, BookOpen, ChevronRight } from "lucide-react";

interface Leader {
  id: string;
  initial: string;
  name: string;
  role: string;
  philosophy: string;
  signature_question: string;
  sessions_count: number;
  books_read: number;
  rating: number;
  tags: string[];
  color: string;
  bio: string;
  booktalk_slugs: string[];
}

const LEADERS: Leader[] = [
  {
    id: "1",
    initial: "J",
    name: "정해린",
    role: "시즌 04 · 외로움 시즌 리더",
    philosophy: "정답보다 진심을 믿습니다. 우리는 결론을 미루는 연습 중입니다. 누군가의 말이 끝나기 전에 다음 말을 준비하지 않는 것, 그것이 제가 이 자리에서 하는 일입니다.",
    signature_question: "당신이 가장 오래 미뤄둔 감정은 무엇인가요?",
    sessions_count: 12,
    books_read: 28,
    rating: 4.9,
    tags: ["외로움", "관계", "감정"],
    color: "#2D3748",
    bio: "심리학과 철학을 공부했고, 지금은 사람들이 서로에게 솔직해지는 공간을 만드는 일을 합니다. 조용한 사람이 말을 꺼낼 때까지 기다리는 것이 가장 중요한 리더의 역할이라고 생각해요.",
    booktalk_slugs: ["다정함의-발명", "외로움-시즌-위크4"],
  },
  {
    id: "2",
    initial: "S",
    name: "서민준",
    role: "시즌 03 · 관계 회복 시즌 리더",
    philosophy: "조용한 사람의 한 문장은 시끄러운 사람의 한 시간보다 길게 남습니다. 빠른 결론보다 느린 이해가 우리를 더 멀리 데려다 줍니다.",
    signature_question: "당신이 마지막으로 누군가에게 진심으로 사과한 건 언제였나요?",
    sessions_count: 8,
    books_read: 34,
    rating: 4.8,
    tags: ["관계", "사과", "회복"],
    color: "#553C2A",
    bio: "사회학을 전공했고 비폭력 대화(NVC)를 공부했습니다. 이 자리는 잘 말하는 사람이 아니라 잘 듣는 사람이 빛나는 곳이어야 한다고 생각합니다.",
    booktalk_slugs: ["혼자라는-감각"],
  },
  {
    id: "3",
    initial: "Y",
    name: "유은재",
    role: "시즌 02 · AI와 인간 시즌 리더",
    philosophy: "대화는 답을 찾는 일이 아니라, 함께 머무는 일입니다. AI가 빨라질수록 느려지는 것의 가치가 커집니다.",
    signature_question: "기계가 더 잘하는 시대에, 인간으로 남고 싶은 부분이 있나요?",
    sessions_count: 9,
    books_read: 41,
    rating: 4.9,
    tags: ["AI", "인간성", "기술"],
    color: "#1A3A5C",
    bio: "IT 기업에서 UX를 연구하다가 인간을 더 공부하고 싶어 이 자리에 오게 됐습니다. 기술이 빠르게 변할수록 사람이 무엇인지를 묻는 질문이 더 중요해진다고 믿습니다.",
    booktalk_slugs: ["아무도-보지-않는-오후"],
  },
  {
    id: "4",
    initial: "K",
    name: "김하나",
    role: "시즌 01 · 사랑 시즌 리더",
    philosophy: "사랑에 대한 질문을 두려워하지 않는 사람들이 이 자리에 모입니다. 사랑은 감정이 아니라 선택이라는 걸, 함께 이야기하며 알아갑니다.",
    signature_question: "가장 사랑받기 어려운 순간에도 사랑받고 싶은 마음이 있나요?",
    sessions_count: 6,
    books_read: 22,
    rating: 4.7,
    tags: ["사랑", "관계", "감정"],
    color: "#7B4040",
    bio: "시인이자 에세이스트. 사랑에 관한 책을 주로 씁니다. 북토크에서는 쓰는 사람이 아니라 듣는 사람이 되고 싶습니다.",
    booktalk_slugs: ["오늘-저녁-당신께"],
  },
];

export default function LeadersClient() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div style={{ background: "var(--bg)" }}>
      {/* Hero */}
      <section style={{ padding: "72px 0 56px", borderBottom: "1px solid var(--line-soft)", background: "linear-gradient(to bottom, var(--bg-soft), var(--bg))" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>
          <div style={{ fontSize: 11.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--muted)", fontFamily: '"EB Garamond",Georgia,serif', fontStyle: "normal", marginBottom: 20 }}>
            Leaders — 리더 소개
          </div>
          <h1 style={{ fontFamily: "var(--font-noto-serif-kr),Georgia,serif", fontSize: "clamp(28px,5vw,52px)", fontWeight: 400, lineHeight: 1.2, letterSpacing: "-0.02em", color: "var(--ink)", marginBottom: 16 }}>
            질문을 던지는<br /><span style={{ color: "var(--accent)", fontWeight: 600 }}>사람들</span>.
          </h1>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75, maxWidth: 480 }}>
            리더는 정답을 주지 않습니다. 더 깊은 질문을 던지고, 침묵을 편안하게 만들고, 모두가 말할 수 있는 공간을 만듭니다.
          </p>
        </div>
      </section>

      {/* Leaders Grid */}
      <section style={{ padding: "64px 0 120px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {LEADERS.map((leader, idx) => {
              const isHovered = hoveredId === leader.id;
              const isReverse = idx % 2 === 1;
              return (
                <article
                  key={leader.id}
                  onMouseEnter={() => setHoveredId(leader.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: isReverse ? "1fr 280px" : "280px 1fr",
                    gap: 40,
                    padding: 40,
                    borderRadius: 20,
                    border: "1px solid var(--line-soft)",
                    background: isHovered ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)",
                    transition: "background 0.25s, box-shadow 0.25s, transform 0.25s",
                    boxShadow: isHovered ? "0 12px 40px -8px rgba(28,31,38,0.12)" : "none",
                    transform: isHovered ? "translateY(-2px)" : "none",
                  }}
                  className="leader-grid"
                >
                  {/* Portrait column */}
                  <div style={{ order: isReverse ? 1 : 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                    <div style={{
                      width: 120, height: 120, borderRadius: "50%",
                      background: leader.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 48, color: "white",
                      fontFamily: "var(--font-noto-serif-kr),Georgia,serif",
                    }}>
                      {leader.initial}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <h2 style={{ fontFamily: "var(--font-noto-serif-kr),Georgia,serif", fontSize: 22, fontWeight: 400, color: "var(--ink)", marginBottom: 4 }}>
                        {leader.name}
                      </h2>
                      <p style={{ fontSize: 12.5, color: "var(--muted)" }}>{leader.role}</p>
                    </div>
                    <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                      {[
                        { value: `${leader.sessions_count}회`, label: "북토크" },
                        { value: `${leader.books_read}권`, label: "읽은 책" },
                        { value: `${leader.rating}점`, label: "평점" },
                      ].map((s) => (
                        <div key={s.label} style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "var(--font-noto-serif-kr),Georgia,serif", fontSize: 18, fontWeight: 400, color: "var(--ink)" }}>{s.value}</div>
                          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} style={{ color: "#FFD700", fill: i < Math.floor(leader.rating) ? "#FFD700" : "transparent" }} />
                      ))}
                    </div>
                  </div>

                  {/* Content column */}
                  <div style={{ order: isReverse ? 0 : 1, display: "flex", flexDirection: "column", gap: 24 }}>
                    <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.85, fontStyle: "normal", borderLeft: `3px solid ${leader.color}`, paddingLeft: 20 }}>
                      &ldquo;{leader.philosophy}&rdquo;
                    </p>
                    <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.8 }}>
                      {leader.bio}
                    </p>
                    <div style={{ padding: "16px 20px", borderRadius: 10, background: `${leader.color}12`, border: `1px solid ${leader.color}30` }}>
                      <div style={{ fontSize: 10.5, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>대표 질문</div>
                      <p style={{ fontFamily: "var(--font-noto-serif-kr),Georgia,serif", fontSize: 15, color: "var(--ink)", lineHeight: 1.65 }}>
                        &ldquo;{leader.signature_question}&rdquo;
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {leader.tags.map((tag) => (
                        <span key={tag} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 9999, background: "var(--bg-warm)", color: "var(--muted)" }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                    {leader.booktalk_slugs.length > 0 && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {leader.booktalk_slugs.map((slug) => (
                          <Link key={slug} href={`/bookclub/${slug}`} style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            fontSize: 13, color: leader.color, textDecoration: "none",
                            padding: "6px 12px", border: `1px solid ${leader.color}40`,
                            borderRadius: 8, transition: "background 0.15s",
                          }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${leader.color}15`; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                          >
                            <BookOpen size={12} /> {slug.replace(/-/g, " ")}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Become a leader CTA */}
          <div style={{
            marginTop: 64, padding: "48px", borderRadius: 20,
            background: "var(--ink)", color: "var(--cream-on-dark)",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap",
          }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
                QLeader Membership
              </div>
              <h3 style={{ fontFamily: "var(--font-noto-serif-kr),Georgia,serif", fontSize: 24, fontWeight: 400, color: "white", marginBottom: 8 }}>
                당신도 리더가 될 수 있습니다.
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>
                QLeader 멤버십으로 북토크를 직접 개설하고 운영하세요.<br />
                AI 발제문 생성, 참가자 관리, 운영 통계 대시보드를 지원합니다.
              </p>
            </div>
            <Link href="/mypage" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 28px", borderRadius: 9999,
              background: "rgba(255,255,255,0.12)", color: "white",
              border: "1px solid rgba(255,255,255,0.25)", textDecoration: "none",
              fontSize: 14, fontWeight: 500, whiteSpace: "nowrap",
              transition: "background 0.2s",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
            >
              멤버십 알아보기 <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .leader-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
