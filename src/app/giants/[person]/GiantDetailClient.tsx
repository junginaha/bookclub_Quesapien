"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, BookOpen, MessageSquare, Sparkles } from "lucide-react";
import type { Giant } from "@/data/giants";
import AISummaryBlock from "@/components/seo/AISummaryBlock";
import RelatedLinks from "@/components/seo/RelatedLinks";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_QUESTIONS: Record<string, string[]> = {
  "friedrich-nietzsche": [
    "신이 없는 세계에서 도덕은 어디서 오는가?",
    "내가 원하는 삶을 살 용기가 없을 때 어떻게 해야 하는가?",
    "고통은 피해야 하는가, 받아들여야 하는가?",
  ],
  "immanuel-kant": [
    "모든 사람이 해도 괜찮다면 나도 해도 되는가?",
    "거짓말이 정당화될 수 있는 상황이 있는가?",
    "자유의지는 존재하는가?",
  ],
  "han-kang": [
    "폭력 앞에서 인간은 무엇을 지킬 수 있는가?",
    "고통의 기억을 어떻게 대면해야 하는가?",
    "아름다움이 고통 옆에 있을 수 있는가?",
  ],
  default: [
    "이 질문에 어떻게 답하시겠습니까?",
    "삶의 의미란 무엇인가요?",
    "두려움을 어떻게 극복하셨나요?",
  ],
};

export default function GiantDetailClient({ giant }: { giant: Giant }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "chat" | "discuss">("about");
  const [discussKeyword, setDiscussKeyword] = useState("");
  const [discussResult, setDiscussResult] = useState<{
    statement: string;
    discussion_questions: string[];
    icebreaker_questions: string[];
    recommended_books: { title: string; author: string; description: string }[];
  } | null>(null);
  const [discussStatus, setDiscussStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const starters = STARTER_QUESTIONS[giant.slug] ?? STARTER_QUESTIONS.default;
  const [liveQuotes, setLiveQuotes] = useState<{ content: string; author: string; source: string }[]>([]);
  const [quotesLoaded, setQuotesLoaded] = useState(false);
  const [wikiSummary, setWikiSummary] = useState("");

  useEffect(() => {
    fetch(`/api/giants/quotes/${giant.slug}`)
      .then((r) => r.json())
      .then((d) => { setLiveQuotes(d.quotes ?? []); setQuotesLoaded(true); })
      .catch(() => setQuotesLoaded(true));
    fetch(`/api/giants/wiki/${giant.slug}`)
      .then((r) => r.json())
      .then((d) => { if (d.summary) setWikiSummary(d.summary); })
      .catch(() => {});
  }, [giant.slug]);

  const [discResult, setDiscResult] = useState<{
    statement: string;
    discussion_questions: string[];
    icebreaker_questions: string[];
    recommended_books: { title: string; author: string; description: string }[];
  } | null>(null);
  const [discStatus, setDiscStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const generateDiscussion = async () => {
    if (messages.length === 0) return;
    setDiscStatus("loading");
    setDiscResult(null);
    try {
      const context = messages.map((m) => `${m.role === "user" ? "Q" : giant.name}: ${m.content}`).join("\n");
      const keyword = giant.name + " " + (messages[0]?.content?.slice(0, 30) ?? "");
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, context }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDiscResult(data);
      setDiscStatus("done");
    } catch {
      setDiscStatus("error");
    }
  };

  const generateFromKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussKeyword.trim()) return;
    setDiscussStatus("loading");
    setDiscussResult(null);
    try {
      const keyword = `${giant.name} ${discussKeyword.trim()}`;
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDiscussResult(data);
      setDiscussStatus("done");
    } catch {
      setDiscussStatus("error");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/giants/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giantSlug: giant.slug,
          giantName: giant.name,
          giantData: {
            tagline: giant.tagline,
            core_idea: giant.core_idea,
            key_works: giant.key_works,
            signature_quote: giant.signature_quote,
          },
          messages: [...messages, userMessage],
          wikiSummary: wikiSummary || undefined,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `${giant.name}이(가) 잠시 자리를 비웠어요. 조금 후에 다시 이야기 나눠요.`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      <div style={{ paddingTop: 64 }}>

        {/* ── Hero ── */}
        <section style={{
          background: giant.color,
          padding: "72px 0 56px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 60% 80% at 80% 0%, rgba(255,255,255,0.1), transparent 60%)",
          }} />
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)", position: "relative" }}>
            <Link href="/giants" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: 40,
            }}>
              <ArrowLeft size={14} /> 거인의 어깨
            </Link>

            <div style={{ maxWidth: 720 }}>
              <div style={{ fontSize: 11.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "normal", marginBottom: 16 }}>
                {giant.nationality} · {giant.birth_year}–{giant.death_year ?? "현재"}
              </div>
              <h1 style={{
                fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                fontSize: "clamp(32px, 5vw, 60px)",
                fontWeight: 400, lineHeight: 1.15,
                color: "rgba(255,255,255,0.95)",
                marginBottom: 12,
              }}>
                {giant.name}
              </h1>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", fontStyle: "normal", marginBottom: 24 }}>
                {giant.name_en}
              </p>
              <p style={{
                fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                fontSize: 20, color: "rgba(255,255,255,0.8)",
                lineHeight: 1.65, maxWidth: 580,
                borderLeft: "2px solid rgba(255,255,255,0.3)", paddingLeft: 20,
                fontStyle: "normal",
              }}>
                &ldquo;{giant.signature_quote}&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* ── Tab Navigation ── */}
        <div style={{ borderBottom: "1px solid var(--line-soft)", background: "var(--bg)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
            <div style={{ display: "flex", gap: 0 }}>
              {[
                { key: "about", label: "사상 & 저서", icon: <BookOpen size={15} /> },
                { key: "chat", label: "지성과의 대화", icon: <MessageSquare size={15} /> },
                { key: "discuss", label: "발제 생성", icon: <Sparkles size={15} /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as "about" | "chat" | "discuss")}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "16px 20px", fontSize: 14, fontWeight: 500,
                    color: activeTab === tab.key ? "var(--ink)" : "var(--muted)",
                    background: "none", border: "none", cursor: "pointer",
                    borderBottom: activeTab === tab.key ? `2px solid ${giant.color}` : "2px solid transparent",
                    marginBottom: -1, transition: "color 0.2s",
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px clamp(20px, 4vw, 48px) 120px" }}>

          {activeTab === "about" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 48 }} className="grid-responsive">

              {/* Left */}
              <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>

                {/* 핵심 사상 */}
                <section>
                  <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>
                    Core Idea — 핵심 사상
                  </div>
                  <p style={{ fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.85 }}>
                    {giant.core_idea}
                  </p>
                </section>

                {/* 대표 저서 */}
                <section>
                  <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>
                    Key Works — 대표 저서
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                    {giant.key_works.map((work, i) => (
                      <div key={work} style={{
                        padding: "16px 20px",
                        borderRadius: 10,
                        border: "1px solid var(--line-soft)",
                        background: "rgba(255,255,255,0.5)",
                        display: "flex", alignItems: "flex-start", gap: 12,
                      }}>
                        <span style={{
                          fontFamily: '"EB Garamond", Georgia, serif',
                          fontSize: 28, fontStyle: "normal",
                          color: giant.color, opacity: 0.4,
                          lineHeight: 1, flexShrink: 0,
                        }}>
                          {String(i + 1)}
                        </span>
                        <span style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.5, marginTop: 4 }}>
                          {work}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 명언 — 외부 API */}
                <section>
                  <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                    Quotes — 명언
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 9999, background: `${giant.color}18`, color: giant.color, letterSpacing: "0.08em" }}>
                      Live
                    </span>
                  </div>
                  {!quotesLoaded ? (
                    <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--muted)", fontSize: 13 }}>
                      <span style={{ width: 14, height: 14, border: "2px solid var(--line-soft)", borderTopColor: giant.color, borderRadius: "50%", animation: "spin 0.75s linear infinite", display: "inline-block", flexShrink: 0 }} />
                      명언을 불러오는 중...
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {liveQuotes.slice(0, 5).map((q, i) => (
                        <blockquote key={i} style={{
                          margin: 0, padding: "20px 24px",
                          borderRadius: 12,
                          border: "1px solid var(--line-soft)",
                          background: i === 0 ? `${giant.color}0A` : "rgba(255,255,255,0.4)",
                          borderLeft: `3px solid ${giant.color}${i === 0 ? "99" : "44"}`,
                          position: "relative",
                        }}>
                          <p style={{
                            fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                            fontSize: 16, fontWeight: 300,
                            color: "var(--ink)", lineHeight: 1.75,
                            fontStyle: "normal", marginBottom: q.source ? 10 : 0,
                          }}>
                            &ldquo;{q.content}&rdquo;
                          </p>
                          {q.source && q.source !== "Quotable.io" && (
                            <cite style={{ fontSize: 12, color: "var(--muted)", fontStyle: "normal", letterSpacing: "0.04em" }}>
                              — {q.source}
                            </cite>
                          )}
                        </blockquote>
                      ))}
                    </div>
                  )}
                </section>

                {/* 연결된 질문들 */}
                <section>
                  <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>
                    Questions — 이 사상이 던지는 질문들
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {giant.related_questions.map((q, i) => (
                      <div key={i} style={{
                        padding: "18px 24px",
                        borderRadius: 12,
                        border: "1px solid var(--line-soft)",
                        background: "rgba(255,255,255,0.4)",
                        display: "flex", alignItems: "center", gap: 16,
                        cursor: "pointer", transition: "background 0.2s",
                      }}
                        onClick={() => { setActiveTab("chat"); sendMessage(q); }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.8)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.4)"; }}
                      >
                        <span style={{
                          fontFamily: '"EB Garamond", Georgia, serif',
                          fontSize: 32, fontStyle: "normal",
                          color: giant.color, opacity: 0.35, flexShrink: 0, lineHeight: 1,
                        }}>
                          Q
                        </span>
                        <p style={{ fontSize: 15, color: "var(--ink)", lineHeight: 1.6 }}>{q}</p>
                        <MessageSquare size={14} style={{ color: "var(--muted)", flexShrink: 0, marginLeft: "auto" }} />
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 12 }}>
                    ↑ 클릭하면 바로 대화가 시작돼요
                  </p>
                </section>
              </div>

              {/* Right Sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="sidebar-hide">
                {/* 역량 카드 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { icon: "💬", label: "대화 가능", desc: "어떤 질문도 환영해요", action: () => setActiveTab("chat") },
                    { icon: "📋", label: "발제 생성 가능", desc: "북클럽 토론 질문지를 만들어요", action: () => setActiveTab("discuss") },
                    { icon: "🔍", label: "질문 가능", desc: "그의 관점으로 깊이 탐구해요", action: () => { setActiveTab("chat"); } },
                  ].map((cap) => (
                    <button
                      key={cap.label}
                      onClick={cap.action}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 16px", borderRadius: 10,
                        background: "rgba(255,255,255,0.5)",
                        border: "1px solid var(--line-soft)",
                        cursor: "pointer", textAlign: "left",
                        transition: "background 0.15s, transform 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = "rgba(255,255,255,0.85)";
                        el.style.transform = "translateX(2px)";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = "rgba(255,255,255,0.5)";
                        el.style.transform = "translateX(0)";
                      }}
                    >
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{cap.icon}</span>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", marginBottom: 1 }}>
                          {cap.label}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{cap.desc}</div>
                      </div>
                      <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: 12 }}>→</span>
                    </button>
                  ))}
                </div>

                {/* 바로 시작하기 */}
                <div style={{ padding: "24px", borderRadius: 16, background: giant.color, color: "white" }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
                    바로 시작하기
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {starters.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => { setActiveTab("chat"); sendMessage(q); }}
                        style={{
                          textAlign: "left", padding: "10px 12px",
                          borderRadius: 8, fontSize: 13, color: "rgba(255,255,255,0.85)",
                          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                          cursor: "pointer", transition: "background 0.15s",
                          lineHeight: 1.5,
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.2)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
                      >
                        &ldquo;{q}&rdquo;
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveTab("chat")}
                    style={{
                      marginTop: 14, width: "100%", padding: "11px 0",
                      borderRadius: 10, background: "rgba(255,255,255,0.2)",
                      color: "white", fontSize: 14, fontWeight: 500,
                      border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.3)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.2)"; }}
                  >
                    대화 시작하기 →
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "discuss" && (
            <div style={{ maxWidth: 760, margin: "0 auto" }}>
              <p style={{ fontSize: 15, color: "var(--ink-soft)", marginBottom: 28, lineHeight: 1.7 }}>
                {giant.name}의 관점으로 발제를 만들어요.
              </p>
              <form onSubmit={generateFromKeyword} style={{ marginBottom: 32 }}>
                <div style={{
                  display: "flex", gap: 10, alignItems: "stretch",
                  border: "1px solid var(--line-soft)", borderRadius: 12, padding: "12px 16px",
                  background: "rgba(255,255,255,0.6)",
                }}>
                  <input
                    value={discussKeyword}
                    onChange={(e) => setDiscussKeyword(e.target.value)}
                    placeholder="예: 고독, 도덕, 의미, 자유"
                    style={{
                      flex: 1, background: "none", border: "none", outline: "none",
                      fontSize: 15, color: "var(--ink)",
                      fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!discussKeyword.trim() || discussStatus === "loading"}
                    style={{
                      padding: "10px 22px", borderRadius: 9, flexShrink: 0,
                      background: discussKeyword.trim() ? giant.color : "var(--line-soft)",
                      color: discussKeyword.trim() ? "white" : "var(--muted)",
                      fontSize: 14, fontWeight: 500, border: "none",
                      cursor: discussKeyword.trim() ? "pointer" : "not-allowed",
                      whiteSpace: "nowrap", transition: "all 0.2s",
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    {discussStatus === "loading" ? (
                      <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> 생성 중…</>
                    ) : "발제 생성"}
                  </button>
                </div>
              </form>

              {discussStatus === "error" && (
                <p style={{ fontSize: 13.5, color: "#EF4444", marginBottom: 20 }}>잠시 후 다시 시도해 주세요.</p>
              )}

              {discussStatus === "done" && discussResult && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {/* 발제문 */}
                  <div style={{ padding: "22px 26px", borderRadius: 14, background: `${giant.color}12`, border: `1px solid ${giant.color}30` }}>
                    <div style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>발제문</div>
                    <p style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.85 }}>{discussResult.statement}</p>
                  </div>
                  {/* 토론 질문 */}
                  <div>
                    <div style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>토론 질문</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {discussResult.discussion_questions.map((q, i) => (
                        <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,0.6)", border: "1px solid var(--line-soft)" }}>
                          <span style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: 24, color: giant.color, opacity: 0.5, lineHeight: 1, flexShrink: 0 }}>{i + 1}</span>
                          <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.7 }}>{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 아이스브레이킹 */}
                  {discussResult.icebreaker_questions?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>아이스브레이킹</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {discussResult.icebreaker_questions.map((q, i) => (
                          <p key={i} style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.65, paddingLeft: 14, borderLeft: `2px solid ${giant.color}50` }}>{q}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* 추천 도서 */}
                  {discussResult.recommended_books?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>추천 도서</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {discussResult.recommended_books.map((b, i) => (
                          <div key={i} style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,0.5)", border: "1px solid var(--line-soft)" }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{b.title} <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 12 }}>— {b.author}</span></div>
                            <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>{b.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* 대화로 이동 버튼 */}
                  <button
                    onClick={() => {
                      setActiveTab("chat");
                      if (discussResult.statement) {
                        sendMessage(discussResult.statement);
                      }
                    }}
                    style={{
                      alignSelf: "flex-start", padding: "12px 24px", borderRadius: 9999,
                      background: giant.color, color: "white",
                      border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500,
                      display: "flex", alignItems: "center", gap: 8, transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                  >
                    <MessageSquare size={15} />
                    이 발제로 {giant.name}와 대화하기
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "chat" && (
            <div style={{ maxWidth: 760, margin: "0 auto" }}>

              {/* Chat intro */}
              {messages.length === 0 && (
                <div style={{ marginBottom: 32 }}>
                  <div style={{
                    padding: "28px 32px",
                    borderRadius: 16,
                    background: `${giant.color}15`,
                    border: `1px solid ${giant.color}30`,
                    marginBottom: 24,
                  }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: "50%",
                        background: giant.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, color: "white", fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                        flexShrink: 0,
                      }}>
                        {giant.name[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", marginBottom: 8 }}>
                          {giant.name}
                        </div>
                        <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.75, fontStyle: "normal" }}>
                          &ldquo;{giant.signature_quote}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 16 }}>
                    — {giant.name}에게 묻고 싶은 것을 적어보세요
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {starters.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        style={{
                          textAlign: "left", padding: "14px 20px",
                          borderRadius: 10, fontSize: 14, color: "var(--ink-soft)",
                          background: "rgba(255,255,255,0.5)", border: "1px solid var(--line-soft)",
                          cursor: "pointer", transition: "all 0.2s", lineHeight: 1.5,
                          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "white";
                          el.style.borderColor = `${giant.color}50`;
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "rgba(255,255,255,0.5)";
                          el.style.borderColor = "var(--line-soft)";
                        }}
                      >
                        <span>{q}</span>
                        <Send size={13} style={{ color: "var(--muted)", flexShrink: 0 }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{
                    display: "flex",
                    flexDirection: msg.role === "user" ? "row-reverse" : "row",
                    gap: 12, alignItems: "flex-start",
                  }}>
                    {msg.role === "assistant" && (
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: giant.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 15, color: "white", flexShrink: 0, marginTop: 2,
                      }}>
                        {giant.name[0]}
                      </div>
                    )}
                    <div style={{
                      maxWidth: "78%",
                      padding: "14px 18px",
                      borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: msg.role === "user" ? "var(--ink)" : "rgba(255,255,255,0.7)",
                      color: msg.role === "user" ? "var(--cream-on-dark)" : "var(--ink-soft)",
                      fontSize: 14, lineHeight: 1.75,
                      border: msg.role === "assistant" ? "1px solid var(--line-soft)" : "none",
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: giant.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 15, color: "white", flexShrink: 0,
                    }}>
                      {giant.name[0]}
                    </div>
                    <div style={{
                      padding: "14px 18px", borderRadius: "16px 16px 16px 4px",
                      background: "rgba(255,255,255,0.7)", border: "1px solid var(--line-soft)",
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <Loader2 size={15} style={{ color: "var(--muted)", animation: "spin 1s linear infinite" }} />
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>생각하는 중...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} style={{
                position: "sticky", bottom: 24,
                background: "rgba(244,239,229,0.95)",
                backdropFilter: "blur(12px)",
                borderRadius: 16,
                border: "1px solid var(--line-soft)",
                padding: "12px 16px",
                boxShadow: "0 8px 32px -8px rgba(28,31,38,0.12)",
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={`${giant.name}에게 묻고 싶은 것을 적어보세요.`}
                    rows={1}
                    style={{
                      flex: 1, background: "none", border: "none", outline: "none",
                      fontSize: 14, color: "var(--ink)",
                      fontFamily: "var(--font-noto-sans-kr), sans-serif",
                      lineHeight: 1.6, resize: "none", minHeight: 24,
                      padding: "4px 0",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    style={{
                      width: 36, height: 36, borderRadius: 9999, flexShrink: 0,
                      background: input.trim() && !isLoading ? giant.color : "var(--line-soft)",
                      color: "white", border: "none", cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.2s",
                    }}
                  >
                    {isLoading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={15} />}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
                  {giant.name}의 저서와 사상을 바탕으로 그의 관점에서 답합니다.
                </p>
              </form>

              {/* ── 발제 생성하기 ── */}
              {messages.length > 0 && (
                <div style={{ marginTop: 32, padding: "24px 28px", borderRadius: 16, background: "rgba(255,255,255,0.5)", border: "1px solid var(--line-soft)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>Discussion Generator</div>
                      <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>이 대화를 바탕으로 북클럽 발제문을 생성합니다.</p>
                    </div>
                    <button
                      onClick={generateDiscussion}
                      disabled={discStatus === "loading"}
                      style={{
                        padding: "10px 20px", borderRadius: 9999,
                        background: discStatus === "loading" ? "var(--line-soft)" : giant.color,
                        color: "white", border: "none", cursor: discStatus === "loading" ? "not-allowed" : "pointer",
                        fontSize: 13.5, fontWeight: 500, transition: "opacity 0.2s",
                        display: "flex", alignItems: "center", gap: 8,
                      }}
                    >
                      {discStatus === "loading" ? (
                        <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> 생성 중…</>
                      ) : "이 대화로 발제 생성하기"}
                    </button>
                  </div>
                  {discStatus === "error" && (
                    <p style={{ fontSize: 13, color: "#EF4444", marginTop: 8 }}>잠시 후 다시 시도해 주세요.</p>
                  )}
                  {discStatus === "done" && discResult && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>
                      <div style={{ padding: "16px 20px", borderRadius: 12, background: "rgba(255,255,255,0.6)", border: "1px solid var(--line-soft)" }}>
                        <div style={{ fontSize: 10.5, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>발제문</div>
                        <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.8 }}>{discResult.statement}</p>
                      </div>
                      {discResult.discussion_questions.length > 0 && (
                        <div>
                          <div style={{ fontSize: 10.5, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>토론 질문</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {discResult.discussion_questions.map((q, i) => (
                              <div key={i} style={{ display: "flex", gap: 12, padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.5)", border: "1px solid var(--line-soft)" }}>
                                <span style={{ fontFamily: '"EB Garamond", Georgia, serif', fontSize: 20, color: giant.color, opacity: 0.5, flexShrink: 0, lineHeight: 1 }}>{i + 1}</span>
                                <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.65 }}>{q}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {discResult.recommended_books?.length > 0 && (
                        <div>
                          <div style={{ fontSize: 10.5, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>추천 도서</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {discResult.recommended_books.map((b, i) => (
                              <div key={i} style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.4)", border: "1px solid var(--line-soft)" }}>
                                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", marginBottom: 2 }}>{b.title} <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 12 }}>— {b.author}</span></div>
                                <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>{b.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Stage 5: Internal Related Links ── */}
      {activeTab === "about" && (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
          <RelatedLinks
            title="관련 콘텐츠"
            items={[
              ...giant.related_questions.map((q) => ({
                label: q.length > 40 ? q.slice(0, 40) + "…" : q,
                href: "/questions",
                type: "question" as const,
              })),
              { label: "모든 사유자 탐색", href: "/giants", type: "giant" as const },
              { label: "북클럽 참여하기", href: "/bookclub", type: "booktalk" as const },
            ]}
          />
        </div>
      )}

      {/* ── Stage 3: AI Summary Block ── */}
      {activeTab === "about" && (
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <AISummaryBlock
            what={`${giant.name}(${giant.name_en}, ${giant.birth_year}–${giant.death_year ?? "현재"})은 ${giant.nationality} 출신 ${giant.category}로, ${giant.tagline}`}
            why={giant.core_idea}
            who={`${giant.name}의 사상에 관심 있는 독자, 철학적 대화를 원하는 사람, ${giant.key_works[0]} 등의 저서 독자`}
            bullets={giant.key_works.map((w) => `대표 저서: ${w}`)}
          />
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .grid-responsive { grid-template-columns: 1fr !important; }
          .sidebar-hide { display: none !important; }
        }
      `}</style>
    </>
  );
}
