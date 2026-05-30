"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import BookDetailModal, { type BookClub } from "./BookDetailModal";
import "./landing.css";

// ─── Static data ──────────────────────────────────────────────
const books: BookClub[] = [
  { color: "navy", genre: "NEW", slug: "최신간-북토크", title: "최신간 북토크, 핫한 문장들", author: "Quesapience", tag: "#신간 #트렌드", recommender: "Q5", reason: "새벽 세 시에 깨어 있는 사람만 아는 문장이 여기 있습니다. 잠들지 못한 누군가에게 이 책이 곁에 있다고 말해주고 싶었어요.", emotionTags: ["#불면", "#회복", "#고요"] },
  { color: "cream", genre: "ESSAY · 산문", slug: "다정함의-발명", title: "다정함의 발명", author: "허지영", tag: "#관계 · #사랑", recommender: "지영", reason: "사랑은 큰 사건이 아니라 매일 발명되는 작은 다정함이라는 말. 헤어진 친구에게 부치지 못한 편지처럼 읽었습니다.", emotionTags: ["#다정함", "#일상", "#연결"] },
  { color: "rust", genre: "PHILOSOPHY", slug: "혼자라는-감각", title: "혼자라는 감각", author: "주성원", tag: "#외로움 · #인생전환", recommender: "성원", reason: "고독을 결핍이 아니라 깊이로 다루는 책. 혼자 있는 것이 부끄럽지 않아진 첫 책이었어요.", emotionTags: ["#고독", "#성장", "#사유"] },
  { color: "olive", genre: "MEMOIR · 회고", slug: "아무도-보지-않는-오후", title: "아무도 보지 않는 오후", author: "김범", tag: "#창업 · #번아웃", recommender: "범", reason: "실패한 사람이 아니라, 멈춰본 적 있는 사람의 문장. 무너졌던 시기에 이 책의 챕터 7이 저를 일으켰습니다.", emotionTags: ["#회복", "#쉼", "#용기"] },
  { color: "dusk", genre: "POETRY · 시", slug: "오늘-저녁-당신께", title: "오늘 저녁, 당신께", author: "박상현", tag: "#사랑 · #이별", recommender: "상현", reason: "시집은 빠르게 읽지 않는 것이라고 가르쳐준 책. 한 페이지에서 일주일을 머문 적이 있어요.", emotionTags: ["#느림", "#이별", "#기억"] },
  { color: "sage", genre: "NON-FICTION", slug: "인간이라는-풍경", title: "인간이라는 풍경", author: "한강", tag: "#인간 · #사유", recommender: "한강", reason: "인간을 풍경처럼 멀리서 바라보는 시선. 미워하던 사람을 다시 사람으로 보게 만드는 책입니다.", emotionTags: ["#관계", "#용서", "#거리"] },
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

const seasons = [
  { n: "No. 03", t: "관계 회복 시즌", desc: "멀어진 사람에게 다시 다가가는 일에 대하여", when: "'25 Winter", status: "종료", live: false },
  { n: "No. 02", t: "AI와 인간 시즌", desc: "기계의 시대에 인간으로 남는 법", when: "'25 Autumn", status: "종료", live: false },
  { n: "No. 01", t: "사랑 시즌", desc: "우리가 사랑이라 부른 것의 다른 이름들", when: "'25 Summer", status: "종료", live: false },
  { n: "No. 05", t: "인간 회복 시즌", desc: "소진된 사람이 다시 사람이 되는 과정", when: "'26 Summer", status: "모집 예정", live: true },
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

// ─── Main component ───────────────────────────────────────────
export default function LandingPage() {
  const [booksOpen, setBooksOpen] = useState(false);
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
            <span className="lp-reveal"><span>좋은 <em>질문</em>은</span></span>
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
              이 책을 누군가에게<br /><em>꼭 건네고</em> 싶었던 이유.
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
                <div className="bc-hover-hint">클릭하여 자세히 보기</div>
              </div>
              <div className="lp-book-info">
                <div className="bi-tag">{b.tag}</div>
                <p className="bi-rec">— {b.recommender}이 건넵니다</p>
                <p className="bi-reason">{b.reason}</p>
                <div className="lp-emotion-tags">
                  {b.emotionTags?.map((t) => <span key={t}>{t}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Collapsible: 더 많은 북클럽 */}
        <div className="lp-books-more">
          <div className="lp-books-more-head">
            <div className="bm-rule" />
            <button
              className="lp-books-more-toggle"
              type="button"
              aria-expanded={booksOpen}
              onClick={() => setBooksOpen((o) => !o)}
            >
              <span>{booksOpen ? "더 적게 보기" : "더 많은 북클럽 보기"}</span>
              <span className="bmt-count">24개</span>
              <span className="bmt-chev" aria-hidden="true" />
            </button>
            <div className="bm-rule" />
          </div>
          <p className="lp-books-more-help">— 지금 바로 참여할 수 있는 모임들입니다.</p>

          <div className={`lp-books-more-body${booksOpen ? " open" : ""}`}>
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
                    <div className="lp-mini-rec">— {b.recommender}이 이끌어요</div>
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
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="lp-section lp-testify" id="testify">
        <div className="lp-section-head">
          <div className="lp-left">
            <div className="lp-eyebrow">ARCHIVING — 사람, 변화, 성장, 기록</div>
            <h2 className="lp-h-section">
              한 시즌이 지나면<br /><em>한 사람이</em> 바뀝니다.
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
      </section>

      {/* SEASONS */}
      <section className="lp-section lp-seasons" id="season">
        <div className="lp-section-head">
          <div className="lp-left">
            <div className="lp-eyebrow">Seasons — 시즌 시스템</div>
            <h2 className="lp-h-section">
              우리는 3개월에 한 번,<br />주제를 바꿉니다.
            </h2>
          </div>
          <p className="lp-lede">
            매 시즌, 하나의 주제 위에서 함께 머뭅니다. 한 가지를 충분히 깊게 다룹니다.
          </p>
        </div>

        <article className="lp-season-feature">
          <div>
            <div className="lp-season-num">Season 04 · Now playing</div>
            <h3 className="lp-season-title">외로움 <em>시즌</em></h3>
            <p className="lp-lede">
              혼자 있어도 외롭지 않은 사람과, 함께 있어도 외로운 사람.
              이 시즌은 그 두 사람 사이의 거리를 다룹니다.
            </p>
            <div className="lp-season-meta">
              <div><div className="sm-k">참여 인원</div><div className="sm-v">142명</div></div>
              <div><div className="sm-k">시즌 기간</div><div className="sm-v">3월–6월</div></div>
              <div><div className="sm-k">모임 횟수</div><div className="sm-v">총 8회</div></div>
            </div>
            <a href="/bookclub" className="lp-btn-primary">
              <span>이 시즌에 참여하기</span>
              <span className="lp-arrow" />
            </a>
          </div>
          <div className="lp-season-qs">
            <div className="sq-label">— 이번 시즌의 질문들</div>
            <ul>
              <li>혼자 있을 때 가장 나다운가요, 가장 외로운가요?</li>
              <li>외로움은 결핍입니까, 깊이입니까?</li>
              <li>당신을 가장 잘 아는 사람은 지금 곁에 있습니까?</li>
              <li>&lsquo;사람과 함께 있는 외로움&rsquo;을 겪어본 적 있나요?</li>
            </ul>
          </div>
        </article>

        <div className="lp-section-head" style={{ marginBottom: 32 }}>
          <div className="lp-left"><div className="lp-eyebrow">Past &amp; Coming</div></div>
          <p className="lp-lede">한 번 지나간 시즌은 다시 열리지 않습니다.</p>
        </div>

        <div className="lp-season-list">
          {seasons.map((s, i) => (
            <div key={s.n} className="lp-season-row" style={i === 3 ? { opacity: 0.75 } : undefined}>
              <div className="sr-n">{s.n}</div>
              <div className="sr-t">{s.t}</div>
              <div className="sr-desc">{s.desc}</div>
              <div className="sr-when">{s.when}</div>
              <div className={`sr-status${s.live ? " live" : ""}`}>
                {s.live && <span className="st-dot" />}{s.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LEADERS */}
      <section className="lp-section lp-leaders" id="leaders">
        <div className="lp-section-head">
          <div className="lp-left">
            <div className="lp-eyebrow">QUESAPIENCE 질문을 던지는 사람들</div>
            <h2 className="lp-h-section">
              Quesapience,<br /><em>질문하는</em> 사람들.
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

      {/* TODAY'S QUESTION */}
      <section className="lp-section lp-today" id="today">
        <div className="lp-section-head">
          <div className="lp-left">
            <div className="lp-eyebrow">Today&apos;s Question — 오늘의 질문</div>
            <h2 className="lp-h-section">
              하루에 한 번,<br />
              <em>마음을 흔드는</em> 질문.
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
              <span className="qm-pulse" /> Today · 5월 22일
            </div>
            <p className="lp-q-text">
              당신은 마지막으로 언제,<br />진심으로 울었나요?
            </p>
            <div className="lp-q-meta">
              <span><strong>1,284</strong> 공감</span>
              <span><strong>397</strong> 저장</span>
              <span><strong>72</strong> 답변</span>
              <span><strong>28분 전</strong> 마지막 댓글</span>
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
            {[
              { num: "No. 087", q: "인간은 왜 외로운가요?", sym: "842", ans: "56", when: "3시간 전" },
              { num: "No. 086", q: "AI 시대에도 사랑은 여전히 중요할까요?", sym: "1,103", ans: "91", when: "어제" },
              { num: "No. 085", q: "당신을 살게 만든 한 문장은 무엇인가요?", sym: "2,071", ans: "143", when: "2일 전" },
            ].map((c) => (
              <article key={c.num} className="lp-q-card lp-reveal">
                <span className="qcard-num">{c.num}</span>
                <p className="qcard-q">{c.q}</p>
                <div className="qcard-foot">
                  <span className="qf-nums">
                    <span><b>{c.sym}</b> 공감</span>
                    <span><b>{c.ans}</b> 답변</span>
                  </span>
                  <span>{c.when}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ASK — with real submission */}
      <section className="lp-section lp-ask" id="ask">
        <div className="lp-ask-inner">
          <div className="lp-eyebrow">A QUESTION — 질문 남기기</div>
          <h2 className="lp-h-section">
            당신 마음 속에<br /><em>오래 남아 있던</em> 질문은.
          </h2>
          <p className="lp-lede">
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
          질문은<br />가장 <em>인간적인</em><br />대화의 시작입니다.
        </p>
        <div className="lp-final-divider" />
        <p className="lp-final-end">
          누군가는 <em>답</em>으로 기억되고,<br />
          누군가는 <em>질문</em>으로 남습니다.
        </p>
        <a href="/bookclub" className="lp-btn-cream">
          <span>지금 참여하기</span>
          <span className="lp-arrow" style={{ color: "var(--lp-bg-ink)" }} />
        </a>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-foot-inner">
          <div className="lp-foot-mark"><em>—</em>질문하는 사람들 · 미래혁신형 북클럽</div>
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
