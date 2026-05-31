"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import BookDetailModal, { type BookClub } from "./BookDetailModal";
import { josa } from "@/lib/utils";
import "./landing.css";

// ─── Static data ──────────────────────────────────────────────
const books: BookClub[] = [
  {
    color: "navy", genre: "NEW", slug: "최신간-북토크",
    title: "최신간 북토크, 핫한 문장들", author: "Quesapience",
    tag: "#신간 #트렌드", recommender: "Q5",
    reason: "새벽 세 시에 깨어 있는 사람만 아는 문장이 여기 있습니다. 잠들지 못한 누군가에게 이 책이 곁에 있다고 말해주고 싶었어요.",
    emotionTags: ["#불면", "#회복", "#고요"],
    hostName: "정해린", hostIntro: "정답보다 진심을 믿습니다. 우리는 결론을 미루는 연습 중입니다.",
    schedule: "2026년 6월 28일 (토) 오후 3시", location: "서울 서초구 교대역 인근",
    joinUrl: "https://jemjem.site", maxParticipants: 8, currentParticipants: 3,
    description: "새로 출간된 책들 중 가장 뜨거운 문장들을 함께 읽습니다. 매 회 다른 책, 같은 깊이의 질문.",
    sessionDates: [{ date: "2026-06-28", topic: "왜 지금 이 문장인가" }],
  },
  {
    color: "cream", genre: "ESSAY · 산문", slug: "다정함의-발명",
    title: "다정함의 발명", author: "허지영",
    tag: "#관계 · #사랑", recommender: "지영",
    reason: "사랑은 큰 사건이 아니라 매일 발명되는 작은 다정함이라는 말. 헤어진 친구에게 부치지 못한 편지처럼 읽었습니다.",
    emotionTags: ["#다정함", "#일상", "#연결"],
    hostName: "정해린", hostIntro: "대화는 답을 찾는 과정이 아니라 함께 머무는 과정입니다.",
    schedule: "2026년 6월 14일 (토) 오후 3시 – 5시 30분", location: "서울 서초구 서초동",
    joinUrl: "https://jemjem.site", maxParticipants: 8, currentParticipants: 5,
    description: "사랑은 큰 사건이 아니라 매일 발명되는 작은 다정함이라는 말. 우리가 일상에서 놓치고 있는 다정함의 순간들을 함께 발견합니다.",
    sessionDates: [
      { date: "2026-06-14", topic: "다정함의 정의" },
      { date: "2026-06-28", topic: "다정함을 주고받는 방법" },
    ],
  },
  {
    color: "rust", genre: "PHILOSOPHY", slug: "혼자라는-감각",
    title: "혼자라는 감각", author: "주성원",
    tag: "#외로움 · #인생전환", recommender: "성원",
    reason: "고독을 결핍이 아니라 깊이로 다루는 책. 혼자 있는 것이 부끄럽지 않아진 첫 책이었어요.",
    emotionTags: ["#고독", "#성장", "#사유"],
    hostName: "서민준", hostIntro: "조용한 사람의 한 문장은 시끄러운 사람의 한 시간보다 길게 남습니다.",
    schedule: "2026년 6월 21일 (토) 오후 2시 – 4시 30분", location: "서울 마포구 합정동",
    joinUrl: "https://jemjem.site", maxParticipants: 6, currentParticipants: 4,
    description: "고독을 결핍이 아니라 깊이로 다루는 책. 혼자라는 감각이 두려움이 아닌 능력이 되는 공간을 함께 만들어봅니다.",
    sessionDates: [
      { date: "2026-06-21", topic: "고독의 의미" },
    ],
  },
  {
    color: "olive", genre: "MEMOIR · 회고", slug: "아무도-보지-않는-오후",
    title: "아무도 보지 않는 오후", author: "김범",
    tag: "#창업 · #번아웃", recommender: "범",
    reason: "실패한 사람이 아니라, 멈춰본 적 있는 사람의 문장. 무너졌던 시기에 이 책의 챕터 7이 저를 일으켰습니다.",
    emotionTags: ["#회복", "#쉼", "#용기"],
    hostName: "유은재", hostIntro: "대화는 답을 찾는 일이 아니라, 함께 머무는 일입니다.",
    schedule: "2026년 6월 28일 (토) 오후 4시 – 6시 30분", location: "서울 용산구 한남동",
    joinUrl: "https://jemjem.site", maxParticipants: 10, currentParticipants: 3,
    description: "실패한 사람이 아니라 멈춰본 적 있는 사람의 문장. 번아웃 이후를 살아가는 법을 함께 이야기합니다.",
    sessionDates: [
      { date: "2026-06-28", topic: "멈춤의 의미" },
      { date: "2026-07-12", topic: "다시 시작하는 법" },
    ],
  },
  {
    color: "dusk", genre: "POETRY · 시", slug: "오늘-저녁-당신께",
    title: "오늘 저녁, 당신께", author: "박상현",
    tag: "#사랑 · #이별", recommender: "상현",
    reason: "시집은 빠르게 읽지 않는 것이라고 가르쳐준 책. 한 페이지에서 일주일을 머문 적이 있어요.",
    emotionTags: ["#느림", "#이별", "#기억"],
    hostName: "서민준", hostIntro: "느리게 읽는 것의 가치를 믿습니다.",
    schedule: "2026년 7월 12일 (토) 오후 6시 – 8시", location: "서울 종로구 부암동",
    joinUrl: "https://jemjem.site", maxParticipants: 8, currentParticipants: 8,
    description: "시집은 빠르게 읽지 않는 것이라고 가르쳐준 책. 한 줄의 시로 한 시간을 이야기하는 모임입니다.",
    sessionDates: [
      { date: "2026-07-12", topic: "이별을 기억하는 방법", closed: true },
    ],
  },
  {
    color: "sage", genre: "NON-FICTION", slug: "인간이라는-풍경",
    title: "인간이라는 풍경", author: "한강",
    tag: "#인간 · #사유", recommender: "한강",
    reason: "인간을 풍경처럼 멀리서 바라보는 시선. 미워하던 사람을 다시 사람으로 보게 만드는 책입니다.",
    emotionTags: ["#관계", "#용서", "#거리"],
    hostName: "유은재", hostIntro: "모든 사람은 이해받아야 할 이유가 있습니다.",
    schedule: "2026년 7월 19일 (토) 오후 2시 – 4시 30분", location: "서울 마포구 망원동",
    joinUrl: "https://jemjem.site", maxParticipants: 10, currentParticipants: 2,
    description: "인간을 풍경처럼 멀리서 바라보는 시선. 미워하던 사람을 다시 사람으로 보게 만드는 책을 함께 읽습니다.",
    sessionDates: [
      { date: "2026-07-19", topic: "인간이란 무엇인가" },
      { date: "2026-08-02", topic: "용서와 거리" },
    ],
  },
];

const miniBooks: BookClub[] = [
  { color: "terra", slug: "제자리로-돌아오는-밤에", title: "제자리로 돌아오는 밤에", recommender: "서연", tag: "#귀환", currentParticipants: 8, isMini: true },
  { color: "smoke", slug: "느리게-읽는-일", title: "느리게 읽는 일", recommender: "진호", tag: "#느림", currentParticipants: 11, isMini: true },
  { color: "mauve", slug: "어머니의-문장들", title: "어머니의 문장들", recommender: "지우", tag: "#가족", currentParticipants: 9, isMini: true },
  { color: "fog", slug: "흐린-날의-사유", title: "흐린 날의 사유", recommender: "민재", tag: "#우울", currentParticipants: 14, isMini: true },
  { color: "ochre", slug: "아무것도-하지-않는-연습", title: "아무것도 하지 않는 연습", recommender: "은지", tag: "#쉬이", currentParticipants: 16, isMini: true },
  { color: "navy", slug: "일을-사랑하면서", title: "일을 사랑하면서 일에 지지 않는 법", recommender: "태우", tag: "#번아웃", currentParticipants: 22, isMini: true },
  { color: "cream", slug: "이름-없는-감정들에게", title: "이름 없는 감정들에게", recommender: "은재", tag: "#감정", currentParticipants: 10, isMini: true },
  { color: "olive", slug: "수요일-저녁-낭독회", title: "수요일 저녁 낭독회", recommender: "현우", tag: "#시", currentParticipants: 7, isMini: true },
  { color: "rust", slug: "아버지라는-낯선-사람", title: "아버지라는 낯선 사람", recommender: "도현", tag: "#가족", currentParticipants: 13, isMini: true },
  { color: "sage", slug: "쓰이지-않는-시간이-있다", title: "쓰이지 않는 시간이 있다", recommender: "하은", tag: "#시간", currentParticipants: 9, isMini: true },
  { color: "dusk", slug: "어둠-속의-밝은-한-줄", title: "어둠 속의 밝은 한 줄", recommender: "제이", tag: "#시", currentParticipants: 6, isMini: true },
  { color: "terra", slug: "온전하지-않은-시절", title: "온전하지 않은 시절", recommender: "안녕", tag: "#청춘", currentParticipants: 12, isMini: true },
  { color: "mauve", slug: "헤어진-이들의-재회", title: "헤어진 이들의 재회", recommender: "다연", tag: "#관계", currentParticipants: 8, isMini: true },
  { color: "smoke", slug: "도시의-올랜-해", title: "도시의 올랜 해", recommender: "우재", tag: "#도시", currentParticipants: 11, isMini: true },
  { color: "ink", slug: "죽음을-읽는-일곱-가지", title: "죽음을 읽는 일곱 가지 시선", recommender: "혁", tag: "#생경", currentParticipants: 15, isMini: true },
  { color: "cream", slug: "난-당신을-잘-모릅니다", title: "난 당신을 잘 모릅니다", recommender: "재희", tag: "#대화", currentParticipants: 10, isMini: true },
  { color: "olive", slug: "돈이-말해주지-않는", title: "돈이 말해주지 않는 것들", recommender: "지훈", tag: "#삶", currentParticipants: 17, isMini: true },
  { color: "fog", slug: "높은-곳의-창가에서", title: "높은 곳의 창가에서", recommender: "세아", tag: "#고독", currentParticipants: 9, isMini: true },
  { color: "rust", slug: "다시-걸을-수-있는-사람들", title: "다시 걸을 수 있는 사람들", recommender: "혜원", tag: "#회복", currentParticipants: 13, isMini: true },
  { color: "ochre", slug: "외국어로-읽는-한국-소설", title: "외국어로 읽는 한국 소설", recommender: "명희", tag: "#언어", currentParticipants: 6, isMini: true },
  { color: "mauve", slug: "넘어진-자리에서", title: "넘어진 자리에서 주워 든 것들", recommender: "연우", tag: "#실패", currentParticipants: 11, isMini: true },
  { color: "dusk", slug: "밤에만-편지를-씁니다", title: "밤에만 편지를 씁니다", recommender: "레이", tag: "#서신", currentParticipants: 8, isMini: true },
  { color: "sage", slug: "자연을-읽는-일요일", title: "자연을 읽는 일요일", recommender: "소희", tag: "#생태", currentParticipants: 14, isMini: true },
  { color: "navy", slug: "철학이-필요한-저녁", title: "철학이 필요한 저녁", recommender: "윤", tag: "#사유", currentParticipants: 18, isMini: true },
];

const testimonials = [
  { who: "채현", sub: "UX 디자이너 · 30", said: "처음으로 모르는 사람 앞에서 솔직한 대화를 했어요. 그 밤이 한 달 동안 저를 흔들고 있었습니다.", when: "외로움 시즌 · Week 04" },
  { who: "진우", sub: "개발자 · 34", said: "'사람은 아직 믿을 만하다'는 감각을 4년 만에 다시 느꼈습니다. 그게 가장 큰 회복이었어요.", when: "관계 시즌 · 종료 후" },
  { who: "윤서", sub: "에디터 · 28", said: "질문 하나가 삶을 흔들었습니다. 그 후로 일을 그만두고 6개월을 쉬었어요. 후회하지 않습니다.", when: "사랑 시즌 · Week 02" },
  { who: "도연", sub: "대학원생 · 26", said: "대답을 잘 하려 애쓰지 않게 된 첫 번째 자리였어요. 정답 없이 머무는 법을 배웠습니다.", when: "인간 시즌" },
  { who: "하린", sub: "교사 · 39", said: "우리 반 아이들에게도 이런 자리를 만들어주고 싶다고 생각했습니다. 그게 변화의 시작이었어요.", when: "AI와 인간 시즌" },
];

const leaders = [
  { initial: "J", name: "정해린", role: "시즌 04 진행", philosophy: "정답보다 진심을 믿습니다. 우리는 결론을 미루는 연습 중입니다.", q: "\"당신이 가장 오래 미뤄둔 감정은 무엇인가요?\"" },
  { initial: "S", name: "서민준", role: "시즌 03 진행", philosophy: "조용한 사람의 한 문장은 시끄러운 사람의 한 시간보다 길게 남습니다.", q: "\"당신이 마지막으로 누군가에게 진심으로 사과한 건 언제였나요?\"" },
  { initial: "Y", name: "유은재", role: "시즌 02 진행", philosophy: "대화는 답을 찾는 일이 아니라, 함께 머무는 일입니다.", q: "\"기계가 더 잘하는 시대에, 인간으로 남고 싶은 부분이 있나요?\"" },
];

// Random float popup content pool
const floatPopupPool = [
  ...books.map((b) => ({ type: "book" as const, title: b.title, sub: b.genre ?? "", color: b.color, slug: b.slug })),
  ...leaders.map((l) => ({ type: "leader" as const, title: l.name, sub: l.role, color: "ink", slug: "" })),
];

// ─── Float popup component ─────────────────────────────────────
function FloatPopup({ color, title, sub, type, onOpen }: {
  color: string; title: string; sub: string; type: "book" | "leader"; onOpen: () => void;
}) {
  return (
    <div className="fp-popup">
      <div className={`fp-visual ${color}`}>
        {type === "book" ? "📖" : "💬"}
      </div>
      <div className="fp-body">
        <div className="fp-title">{title}</div>
        <div className="fp-sub">{sub}</div>
        <button className="fp-link" onClick={onOpen}>
          {type === "book" ? "자세히 보기" : "만나보기"} →
        </button>
      </div>
    </div>
  );
}

// ─── Archive Review Form 컴포넌트 ─────────────────────────────
function ArchiveReviewForm() {
  const [tab, setTab] = useState<"text" | "photo" | "video">("text");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 20) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/archive/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: tab,
          content: content.trim(),
          author_name: authorName.trim() || "익명",
          photo_url: tab === "photo" ? photoUrl.trim() || null : null,
          video_url: tab === "video" ? videoUrl.trim() || null : null,
        }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("sent");
      setContent("");
      setAuthorName("");
      setPhotoUrl("");
      setVideoUrl("");
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <div style={{ marginTop: 56, padding: "36px 40px", borderRadius: 16, background: "rgba(255,255,255,0.4)", border: "1px solid var(--lp-line-soft)" }}>
      <div style={{ fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--lp-muted)", marginBottom: 10 }}>후기 남기기</div>
      <p style={{ fontSize: 15, color: "var(--lp-ink-soft)", marginBottom: 24, lineHeight: 1.6 }}>당신의 변화를 기록해주세요.</p>

      {/* 탭 */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "1px solid var(--lp-line-soft)" }}>
        {(["text", "photo", "video"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: "8px 18px", fontSize: 13.5, background: "none", border: "none",
              cursor: "pointer", color: tab === t ? "var(--lp-ink)" : "var(--lp-muted)",
              borderBottom: tab === t ? "2px solid var(--lp-ink)" : "2px solid transparent",
              marginBottom: -1, transition: "color 0.2s",
              fontFamily: "var(--lp-serif-ko)",
            }}
          >
            {t === "text" ? "글" : t === "photo" ? "사진" : "영상"}
          </button>
        ))}
      </div>

      {status === "sent" ? (
        <div style={{ padding: "24px 0", textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>✦</div>
          <p style={{ fontSize: 15, color: "var(--lp-ink)", marginBottom: 4 }}>후기가 전달되었습니다.</p>
          <span style={{ fontSize: 13, color: "var(--lp-muted)" }}>소중한 기록 감사합니다.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {tab === "photo" && (
            <div style={{ marginBottom: 12 }}>
              <input
                type="url"
                placeholder="사진 URL"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 14,
                  border: "1px solid var(--lp-line-soft)", background: "rgba(255,255,255,0.6)",
                  color: "var(--lp-ink)", outline: "none", boxSizing: "border-box",
                  fontFamily: "var(--lp-sans)",
                }}
              />
            </div>
          )}
          {tab === "video" && (
            <div style={{ marginBottom: 12 }}>
              <input
                type="url"
                placeholder="YouTube 링크 (예: https://youtu.be/...)"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 14,
                  border: "1px solid var(--lp-line-soft)", background: "rgba(255,255,255,0.6)",
                  color: "var(--lp-ink)", outline: "none", boxSizing: "border-box",
                  fontFamily: "var(--lp-sans)",
                }}
              />
            </div>
          )}
          <textarea
            placeholder="후기를 남겨주세요 (최소 20자)"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            minLength={20}
            required
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 10, fontSize: 14,
              border: "1px solid var(--lp-line-soft)", background: "rgba(255,255,255,0.6)",
              color: "var(--lp-ink)", outline: "none", resize: "vertical", boxSizing: "border-box",
              lineHeight: 1.7, fontFamily: "var(--lp-serif-ko)",
            }}
          />
          <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="이름 (선택 · 익명 가능)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              maxLength={20}
              style={{
                flex: 1, minWidth: 160, padding: "10px 14px", borderRadius: 9, fontSize: 13.5,
                border: "1px solid var(--lp-line-soft)", background: "rgba(255,255,255,0.6)",
                color: "var(--lp-ink)", outline: "none", fontFamily: "var(--lp-sans)",
              }}
            />
            <button
              type="submit"
              disabled={content.trim().length < 20 || status === "sending"}
              style={{
                padding: "10px 24px", borderRadius: 9999, fontSize: 14, fontWeight: 500,
                background: content.trim().length >= 20 ? "var(--lp-ink)" : "var(--lp-line-soft)",
                color: content.trim().length >= 20 ? "var(--lp-cream)" : "var(--lp-muted)",
                border: "none", cursor: content.trim().length >= 20 ? "pointer" : "not-allowed",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
            >
              {status === "sending" ? "전송 중…" : "후기 남기기"}
            </button>
          </div>
          {status === "error" && (
            <p style={{ fontSize: 12.5, color: "rgba(239,68,68,0.8)", marginTop: 8 }}>잠시 후 다시 시도해주세요.</p>
          )}
        </form>
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────
export interface LandingQuestion {
  id: string;
  content: string;
  author_name: string;
  likes: number;
  saves: number;
  answers_count: number;
}

interface LandingPageProps {
  todayQuestion?: LandingQuestion | null;
  recentQuestions?: LandingQuestion[];
}

// ─── Main component ───────────────────────────────────────────
export default function LandingPage({ todayQuestion, recentQuestions }: LandingPageProps) {
  const [modalBook, setModalBook] = useState<BookClub | null>(null);
  const [activeFloat, setActiveFloat] = useState<number | null>(null);
  const [askContent, setAskContent] = useState("");
  const [askAuthor, setAskAuthor] = useState("");
  const [askStatus, setAskStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const floatTimeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  // Pick random popup items for each float element (stable per session)
  const [floatItems] = useState(() =>
    [0, 1, 2, 3, 4].map(() => floatPopupPool[Math.floor(Math.random() * floatPopupPool.length)])
  );

  useEffect(() => {
    const nav = document.getElementById("lp-nav");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".lp-reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const ta = document.querySelector(".lp-ask-field textarea") as HTMLTextAreaElement;
    if (!ta) return;
    const grow = () => { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; };
    ta.addEventListener("input", grow);
    return () => ta.removeEventListener("input", grow);
  }, []);

  const openFloat = useCallback((idx: number) => {
    const t = floatTimeouts.current.get(idx);
    if (t) clearTimeout(t);
    setActiveFloat(idx);
  }, []);

  const closeFloat = useCallback((idx: number) => {
    const t = setTimeout(() => setActiveFloat(null), 200);
    floatTimeouts.current.set(idx, t);
  }, []);

  const handleFloatOpen = useCallback((idx: number) => {
    const item = floatItems[idx];
    if (item.type === "book") {
      const book = books.find((b) => b.slug === item.slug);
      if (book) setModalBook(book);
    }
  }, [floatItems]);

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
      setAskContent("");
      setAskAuthor("");
    } catch {
      setAskStatus("error");
    }
    setTimeout(() => setAskStatus("idle"), 3000);
  };

  return (
    <div className="lp">
      <div className="lp-grain" aria-hidden="true" />
      <div className="lp-grain-light" aria-hidden="true" />

      {/* NAV */}
      <nav className="lp-nav" id="lp-nav">
        <a href="#top" className="lp-wordmark">
          <span className="wm-mark" aria-hidden="true">
            <span className="wm-q">?</span><span className="wm-bang">!</span>
          </span>
          <span className="wm-label">질문하는 사람들</span>
        </a>
        <div className="lp-nav-links">
          <a href="/questions">질문</a>
          <a href="/bookclub">북클럽</a>
          <a href="/archive">아카이빙</a>
          <a href="/giants">거인의 어깨</a>
        </div>
        <a href="/bookclub" className="lp-nav-cta">
          <span>참여 신청</span>
        </a>
      </nav>

      {/* HERO */}
      <section className="lp-hero" id="top">
        <div className="lp-hero-inner">
          <div className="lp-hero-meta">
            <div className="lp-eyebrow">서초구 선정 미래혁신형 북클럽</div>
            <div className="lp-right" />
          </div>
          <h1 className="lp-h-display">
            <span className="lp-reveal"><span>좋은 <span className="lp-em">질문</span>은</span></span>
            <span className="lp-reveal"><span>좋은 사람을 데려옵니다.</span></span>
          </h1>
          <div className="lp-hero-sub">
            <p>
              <span className="lp-kw">질문</span>으로{" "}
              <span className="lp-kw k2">연결</span>되는 미래혁신형{" "}
              <span className="lp-kw k3">북클럽</span>.<br />
              사람들이 가장 깊은 이야기를 합니다.
            </p>
            <div className="lp-cta-stack">
              <div className="lp-cta-row">
                <a href="/questions" className="lp-btn-primary">
                  <span>질문 탐색하기</span>
                  <span className="lp-arrow" />
                </a>
                <a href="/bookclub" className="lp-btn-skip" aria-label="북클럽으로 바로 가기">
                  <span>북클럽</span>
                  <span className="lp-skip-arrow">
                    <span className="lp-skip-line" />
                  </span>
                </a>
              </div>
              <span className="lp-cta-note">— 생각보다 따뜻합니다.</span>
            </div>
          </div>

          {/* Floating papers — secret hover links */}
          {([
            { cls: "p1", idx: 0 },
            { cls: "p2", idx: 1 },
            { cls: "p3", idx: 2 },
            { cls: "dot d1", idx: 3 },
            { cls: "dot d2", idx: 4 },
          ] as const).map(({ cls, idx }) => (
            <div
              key={idx}
              className={`lp-float ${cls} lp-float-secret`}
              onMouseEnter={() => openFloat(idx)}
              onMouseLeave={() => closeFloat(idx)}
            >
              {activeFloat === idx && (
                <FloatPopup
                  {...floatItems[idx]}
                  onOpen={() => handleFloatOpen(idx)}
                />
              )}
            </div>
          ))}
        </div>
        <div className="lp-scroll-cue">
          <span>scroll</span>
          <span className="sc-line" />
        </div>
      </section>

      {/* BOOKS */}
      <section className="lp-section lp-books" id="books">
        <div className="lp-section-head">
          <div className="lp-left">
            <div className="lp-eyebrow">BOOK LOVERS 책을 건네는 마음</div>
            <h2 className="lp-h-section">
              이 책을 누군가에게<br /><span className="lp-em">꼭 건네고</span> 싶었던 이유.
            </h2>
          </div>
          <p className="lp-lede">
            우리는 &lsquo;왜 이 책을 건네고 싶었는지&rsquo;를 씁니다. 우리는 이 책이 한 사람에게 어떻게 스며들었는가를 기록합니다.
          </p>
        </div>

        <div className="lp-books-grid">
          {books.map((b) => (
            <article
              key={b.title}
              className="lp-book lp-reveal"
              onClick={() => setModalBook(b)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setModalBook(b)}
            >
              <div className={`lp-book-cover ${b.color}`}>
                <span className="bc-spine" />
                <div className="bc-top">
                  <span className="bc-genre">{b.genre}</span>
                </div>
                <div className="bc-bot">
                  <h3>{b.title}</h3>
                  <p className="bc-author">— {b.author}</p>
                </div>
                <div className="bc-hover-hint">모임 상세 보기</div>
              </div>
              <div className="lp-book-info">
                <div className="bi-tag">{b.tag}</div>
                <p className="bi-rec">— {josa(b.recommender ?? "", "이가")} 건넵니다</p>
                <p className="bi-reason">{b.reason}</p>
                <div className="lp-emotion-tags">
                  {b.emotionTags?.map((t) => <span key={t}>{t}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Mini books — always expanded */}
        <div className="lp-books-more">
          <div className="lp-books-more-head">
            <div className="bm-rule" />
            <div className="lp-books-more-label">
              <span>더 많은 북클럽</span>
              <span className="bmt-count">24개</span>
            </div>
            <div className="bm-rule" />
          </div>
          <p className="lp-books-more-help">— 지금 바로 참여할 수 있는 모임들입니다.</p>

          <div className="lp-mini-grid">
            {miniBooks.map((b) => (
              <div
                key={b.title}
                className="lp-mini-book"
                onClick={() => setModalBook(b)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setModalBook(b)}
              >
                <div className={`lp-mini-spine ${b.color}`} />
                <div className="lp-mini-body">
                  <div className="lp-mini-title">{b.title}</div>
                  <div className="lp-mini-rec">— {josa(b.recommender ?? "", "이가")} 이끌어요</div>
                  <div className="lp-mini-meta">
                    <span className="lp-mini-tag">{b.tag}</span>
                    <span className="lp-mini-members">
                      <span className="mem-dot" />{b.currentParticipants}명 참여 중
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARCHIVING — 후기 섹션 */}
      <section className="lp-section lp-testify" id="testify">
        <div className="lp-section-head">
          <div className="lp-left">
            <div className="lp-eyebrow">ARCHIVING — 사람, 변화, 기록</div>
            <h2 className="lp-h-section">
              한 시즌이 지나면<br /><span className="lp-em">한 사람이</span> 바뀝니다.
            </h2>
          </div>
          <p className="lp-lede">
            참여자들이 시즌의 끝에 남기고 간 짧은 문장들입니다.
            과장된 후기는 싣지 않습니다. 우리가 가장 아끼는 작고 견고한 낮은 목소리입니다.
          </p>
        </div>
        <div className="lp-test-list">
          {testimonials.map((t) => (
            <div key={t.who} className="lp-test-item">
              <div className="ti-who">— {t.who}<span className="ti-sub">{t.sub}</span></div>
              <div className="ti-said">{t.said}</div>
              <div className="ti-when">{t.when}</div>
            </div>
          ))}
        </div>

        {/* 후기 남기기 폼 */}
        <ArchiveReviewForm />
      </section>

      {/* LEADERS */}
      <section className="lp-section lp-leaders" id="leaders">
        <div className="lp-section-head">
          <div className="lp-left">
            <div className="lp-eyebrow">LEADERS — 질문을 던지는 사람들</div>
            <h2 className="lp-h-section">
              Quesapience,<br /><span className="lp-em">질문하는</span> 사람들.
            </h2>
          </div>
          <p className="lp-lede">
            &lsquo;질문을 잘 던지는 사람&rsquo;과 함께합니다. 듣고, 이해하고, 다시 묻습니다.
          </p>
        </div>
        <div className="lp-leaders-grid">
          {leaders.map((l) => (
            <article key={l.name} className="lp-leader lp-reveal">
              <div className="lp-leader-portrait">{l.initial}</div>
              <div className="lp-leader-name">
                {l.name}<span className="ln-role">— {l.role}</span>
              </div>
              <p className="lp-leader-philosophy">{l.philosophy}</p>
              <div className="lp-leader-question">
                <div className="lq-k">대표 질문</div>
                <div className="lq-v">{l.q}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* QUESTIONS HUB — Today + Ask 통합 */}
      <section className="lp-section lp-question-hub" id="questions">
        <div className="lp-section-head">
          <div className="lp-left">
            <div className="lp-eyebrow">QUESTIONS — 오늘의 질문</div>
            <h2 className="lp-h-section">
              하루에 한 번,<br />
              <span className="lp-em">마음을 흔드는</span> 질문.
            </h2>
          </div>
          <p className="lp-lede">
            매일 아침, 멤버 한 사람이 자신의 마음에 오래 머물던 질문을
            이곳에 두고 갑니다. 답하지 않아도 좋습니다. 다만 잠시 머물러
            주세요.
          </p>
        </div>

        <div className="lp-q-grid">
          <article className="lp-q-feature lp-reveal">
            <div className="lp-q-marker">
              <span className="qm-pulse" /> Today
            </div>
            <p className="lp-q-text">
              {todayQuestion?.content ?? "당신은 마지막으로 언제,\n진심으로 울었나요?"}
            </p>
            <div className="lp-q-meta">
              <span><strong>{todayQuestion?.likes?.toLocaleString() ?? "1,284"}</strong> 공감</span>
              <span><strong>{todayQuestion?.saves?.toLocaleString() ?? "397"}</strong> 저장</span>
              <span><strong>{todayQuestion?.answers_count ?? "72"}</strong> 답변</span>
            </div>
            <div className="lp-q-comments">
              <div className="qc-label">In the margins · 메모</div>
              <div className="qc-row">
                <span className="qc-who">서연 ―</span>
                <span className="qc-what">&ldquo;아버지 장례식 끝나고 지하철에서. 그게 마지막이었던 것 같아요.&rdquo;</span>
              </div>
              <div className="qc-row">
                <span className="qc-who">현우 ―</span>
                <span className="qc-what">&ldquo;운 적은 많은데, 진심으로 운 적은 기억이 잘 안 나요.&rdquo;</span>
              </div>
              <div className="qc-row">
                <span className="qc-who">민지 ―</span>
                <span className="qc-what">&ldquo;오늘 새벽이요. 이유는 모르겠어요.&rdquo;</span>
              </div>
            </div>
          </article>

          <div className="lp-q-card-stack">
            {(recentQuestions && recentQuestions.length >= 3
              ? recentQuestions.slice(0, 3)
              : [
                  { id: "s1", content: "인간은 왜 외로운가요?", likes: 842, answers_count: 56, author_name: "" },
                  { id: "s2", content: "AI 시대에도 사랑은 여전히 중요할까요?", likes: 1103, answers_count: 91, author_name: "" },
                  { id: "s3", content: "당신을 살게 만든 한 문장은 무엇인가요?", likes: 2071, answers_count: 143, author_name: "" },
                ]
            ).map((c, idx) => (
              <article key={c.id ?? idx} className="lp-q-card lp-reveal">
                <span className="qcard-num">No. {String(100 - idx).padStart(3, "0")}</span>
                <p className="qcard-q">{c.content}</p>
                <div className="qcard-foot">
                  <span className="qf-nums">
                    <span><b>{c.likes?.toLocaleString()}</b> 공감</span>
                    <span><b>{c.answers_count}</b> 답변</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* 구분선 */}
        <div style={{ borderTop: "1px solid var(--lp-line-soft)", margin: "56px 0 48px" }} />

        {/* ASK 폼 */}
        <div className="lp-ask-inner">
          <div className="lp-eyebrow" style={{ marginBottom: 12 }}>당신의 질문을 남겨보세요</div>
          <h3 className="lp-h-section" style={{ fontSize: "clamp(22px, 3vw, 32px)", marginBottom: 16 }}>
            당신 마음 속에<br /><span className="lp-em">오래 남아 있던</span> 질문은.
          </h3>
          <p className="lp-lede" style={{ marginBottom: 32 }}>
            정답을 모으는 곳이 아닙니다. 좋은 질문 하나는, 때로 한 사람을 살립니다.
            부끄러운 질문일수록 환영합니다.
          </p>

          {askStatus === "sent" ? (
            <div className="lp-ask-success">
              <div className="lp-ask-success-icon">?</div>
              <p>질문이 전달되었습니다.</p>
              <span>누군가의 마음에 닿을 거예요.</span>
            </div>
          ) : (
            <form onSubmit={handleAskSubmit}>
              <div className="lp-ask-field" id="askField">
                <span className="af-pen">― 당신의 질문</span>
                <textarea
                  placeholder="당신 마음 속에 오래 남아 있던 질문은 무엇인가요?"
                  rows={3}
                  spellCheck={false}
                  aria-label="질문 입력"
                  value={askContent}
                  onChange={(e) => setAskContent(e.target.value)}
                  required
                  minLength={5}
                />
                <span className="lp-sparkle s1" />
                <span className="lp-sparkle s2" />
                <span className="lp-sparkle s3" />
              </div>
              <div className="lp-ask-name-row">
                <input
                  className="lp-ask-name"
                  type="text"
                  placeholder="이름 (선택 · 익명 가능)"
                  value={askAuthor}
                  onChange={(e) => setAskAuthor(e.target.value)}
                  maxLength={20}
                />
              </div>
              <div className="lp-ask-actions">
                <span className="aa-hint">
                  {askStatus === "error"
                    ? "— 잠시 후 다시 시도해주세요."
                    : "— 좋은 질문은 누군가를 살립니다."}
                </span>
                <button
                  className="lp-btn-cream"
                  type="submit"
                  disabled={askStatus === "sending" || askContent.trim().length < 5}
                >
                  <span>{askStatus === "sending" ? "전송 중…" : "질문 남기기"}</span>
                  <span className="lp-arrow" style={{ color: "var(--lp-bg-ink)" }} />
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="lp-final" id="final">
        <div className="lp-eyebrow">AT HEART</div>
        <p className="lp-final-quote">
          질문은<br />가장 <span className="lp-em">인간적인</span><br />대화의 시작입니다.
        </p>
        <div className="lp-final-divider" />
        <p className="lp-final-end">
          누군가는 <span className="lp-em">답</span>으로 기억되고,<br />
          누군가는 <span className="lp-em">질문</span>으로 남습니다.
        </p>
        <a href="/bookclub" className="lp-btn-cream">
          <span>지금 참여하기</span>
          <span className="lp-arrow" style={{ color: "var(--lp-bg-ink)" }} />
        </a>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-foot-inner">
          <div className="lp-foot-mark"><span className="lp-em">—</span>질문하는 사람들 · 미래혁신형 북클럽</div>
          <div className="lp-foot-links">
            <a href="/questions">질문</a>
            <a href="/bookclub">북클럽</a>
            <a href="/giants">거인의 어깨</a>
            <a href="/archive">아카이빙</a>
          </div>
          <div className="lp-foot-copy">© 2026 — Quesapience.</div>
        </div>
      </footer>

      {/* Book Detail Modal */}
      <BookDetailModal book={modalBook} onClose={() => setModalBook(null)} />
    </div>
  );
}
