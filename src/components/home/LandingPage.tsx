"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./landing.css";

export default function LandingPage() {
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
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
        });
      },
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

  return (
    <div className="lp">
      {/* Grain overlays */}
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
          <a href="#today">오늘의 질문</a>
          <a href="#books">추천책</a>
          <a href="#ask">질문 남기기</a>
          <a href="#season">시즌</a>
          <a href="#leaders">리더</a>
        </div>
        <Link href="/questions/create" className="lp-nav-cta">
          <span>참여 신청</span>
        </Link>
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
              조용한 사람들이 가장 깊은 이야기를 시작합니다.
            </p>
            <div className="lp-cta-stack">
              <Link href="/questions/create" className="lp-btn-primary">
                <span>지금 질문 참여하기</span>
                <span className="lp-arrow" />
              </Link>
              <span className="lp-cta-note">— 생각보다 따뜻합니다.</span>
            </div>
          </div>
          <div className="lp-float p1" />
          <div className="lp-float p2" />
          <div className="lp-float p3" />
          <div className="lp-float dot d1" />
          <div className="lp-float dot d2" />
        </div>
        <div className="lp-scroll-cue">
          <span>scroll</span>
          <span className="sc-line" />
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

      {/* BOOKS */}
      <section className="lp-section lp-books" id="books">
        <div className="lp-section-head">
          <div className="lp-left">
            <div className="lp-eyebrow">From Hand to Hand — 책을 건네는 마음</div>
            <h2 className="lp-h-section">
              이 책을 누군가에게<br /><em>꼭 건네고</em> 싶었던 이유.
            </h2>
          </div>
          <p className="lp-lede">
            독후감 대신, 우리는 &lsquo;왜 이 책을 건네고 싶었는지&rsquo;를 씁니다.
            줄거리는 인터넷에 있습니다. 우리가 모으는 건 그 책이
            한 사람을 어떻게 흔들었는가의 기록입니다.
          </p>
        </div>

        <div className="lp-books-grid">
          {[
            { color: "navy", genre: "A NOVEL", title: "밤은 부드러워, 마침내", author: "Anna Vellner", tag: "#위로 · #불안", rec: "도연이 건넵니다", reason: "새벽 세 시에 깨어 있는 사람만 아는 문장이 여기 있습니다. 잠들지 못한 누군가에게 이 책이 곁에 있다고 말해주고 싶었어요.", tags: ["#불면", "#회복", "#고요"], genreColor: "rgba(236,227,207,0.55)" },
            { color: "cream", genre: "ESSAY · 산문", title: "다정함의 발명", author: "한지혜", tag: "#관계 · #사랑", rec: "수민이 건넵니다", reason: "사랑은 큰 사건이 아니라 매일 발명되는 작은 다정함이라는 말. 헤어진 친구에게 부치지 못한 편지처럼 읽었습니다.", tags: ["#다정함", "#일상", "#연결"], genreColor: "rgba(58,47,34,0.6)" },
            { color: "rust", genre: "PHILOSOPHY", title: "혼자라는 감각", author: "Olivia Hahm", tag: "#외로움 · #인생전환", rec: "진우가 건넵니다", reason: "고독을 결핍이 아니라 깊이로 다루는 책. 혼자 있는 것이 부끄럽지 않아진 첫 책이었어요.", tags: ["#고독", "#성장", "#사유"], genreColor: "rgba(236,227,207,0.55)" },
            { color: "olive", genre: "MEMOIR · 회고", title: "아무도 보지 않는 오후", author: "박서경", tag: "#창업 · #번아웃", rec: "윤서가 건넵니다", reason: "실패한 사람이 아니라, 멈춰본 적 있는 사람의 문장. 무너졌던 시기에 이 책의 챕터 7이 저를 일으켰습니다.", tags: ["#회복", "#쉼", "#용기"], genreColor: "rgba(236,227,207,0.55)" },
            { color: "dusk", genre: "POETRY · 시", title: "오늘 저녁, 당신께", author: "정은우", tag: "#사랑 · #이별", rec: "하린이 건넵니다", reason: "시집은 빠르게 읽지 않는 것이라고 가르쳐준 책. 한 페이지에서 일주일을 머문 적이 있어요.", tags: ["#느림", "#이별", "#기억"], genreColor: "rgba(236,227,207,0.55)" },
            { color: "sage", genre: "NON-FICTION", title: "인간이라는 풍경", author: "Marius Lind", tag: "#인간 · #사유", rec: "채현이 건넵니다", reason: "인간을 풍경처럼 멀리서 바라보는 시선. 미워하던 사람을 다시 사람으로 보게 만드는 책입니다.", tags: ["#관계", "#용서", "#거리"], genreColor: "rgba(28,31,38,0.55)" },
          ].map((b) => (
            <article key={b.title} className="lp-book lp-reveal">
              <div className={`lp-book-cover ${b.color}`}>
                <span className="bc-spine" />
                <div className="bc-top">
                  <div className="lp-small-cap" style={{ color: b.genreColor }}>{b.genre}</div>
                </div>
                <div className="bc-bot">
                  <h3>{b.title}</h3>
                  <p className="bc-author">— {b.author}</p>
                </div>
              </div>
              <div className="lp-book-info">
                <div className="bi-tag">{b.tag}</div>
                <p className="bi-rec">— {b.rec}</p>
                <p className="bi-reason">{b.reason}</p>
                <div className="lp-emotion-tags">
                  {b.tags.map((t) => <span key={t}>{t}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ASK */}
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
          <div className="lp-ask-field">
            <span className="af-pen">― 당신의 질문</span>
            <textarea
              placeholder="당신 마음 속에 오래 남아 있던 질문은 무엇인가요?"
              rows={3}
              spellCheck={false}
              aria-label="질문 입력"
            />
            <span className="lp-sparkle s1" />
            <span className="lp-sparkle s2" />
            <span className="lp-sparkle s3" />
          </div>
          <div className="lp-ask-actions">
            <span className="aa-hint">— 좋은 질문은 누군가를 살립니다.</span>
            <button className="lp-btn-cream" type="button">
              <span>질문 남기기</span>
              <span className="lp-arrow" style={{ color: "var(--lp-bg-ink)" }} />
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="lp-section lp-testify" id="testify">
        <div className="lp-section-head">
          <div className="lp-left">
            <div className="lp-eyebrow">What People Left Here — 사람들이 남기고 간 변화</div>
            <h2 className="lp-h-section">
              한 시즌이 지나면<br /><em>한 사람이</em> 바뀝니다.
            </h2>
          </div>
          <p className="lp-lede">
            참여자들이 시즌의 끝에 남기고 간 짧은 문장들입니다.
            과장된 후기는 싣지 않습니다. 우리가 가장 아끼는 건 작고 낮은 목소리입니다.
          </p>
        </div>
        <div className="lp-test-list">
          {[
            { who: "채현", sub: "UX 디자이너 · 30", said: "처음으로 모르는 사람 앞에서 솔직한 대화를 했어요. 그 밤이 한 달 동안 저를 흔들고 있었습니다.", when: "외로움 시즌 · Week 04" },
            { who: "진우", sub: "개발자 · 34", said: "'사람은 아직 믿을 만하다'는 감각을 4년 만에 다시 느꼈습니다. 그게 가장 큰 회복이었어요.", when: "관계 시즌 · 종료 후" },
            { who: "윤서", sub: "에디터 · 28", said: "질문 하나가 삶을 흔들었습니다. 그 후로 일을 그만두고 6개월을 쉬었어요. 후회하지 않습니다.", when: "사랑 시즌 · Week 02" },
            { who: "도연", sub: "대학원생 · 26", said: "대답을 잘 하려 애쓰지 않게 된 첫 번째 자리였어요. 정답 없이 머무는 법을 배웠습니다.", when: "인간 시즌" },
            { who: "하린", sub: "교사 · 39", said: "우리 반 아이들에게도 이런 자리를 만들어주고 싶다고 생각했습니다. 그게 변화의 시작이었어요.", when: "AI와 인간 시즌" },
          ].map((t) => (
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
            매 시즌, 하나의 주제 위에서만 함께 머뭅니다.
            너무 많은 것을 다루지 않습니다. 한 가지를 충분히 깊게 다루기 위해서.
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
            <Link href="/questions/create" className="lp-btn-primary">
              <span>이 시즌에 참여하기</span>
              <span className="lp-arrow" />
            </Link>
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
          <div className="lp-left">
            <div className="lp-eyebrow">Past &amp; Coming — 지난 시즌, 다음 시즌</div>
          </div>
          <p className="lp-lede">
            한 번 지나간 시즌은 다시 열리지 않습니다. 그 시간은 그때 머문 사람의 것입니다.
          </p>
        </div>

        <div className="lp-season-list">
          {[
            { n: "No. 03", t: "관계 회복 시즌", desc: "멀어진 사람에게 다시 다가가는 일에 대하여", when: "'25 Winter", status: "종료", live: false },
            { n: "No. 02", t: "AI와 인간 시즌", desc: "기계의 시대에 인간으로 남는 법", when: "'25 Autumn", status: "종료", live: false },
            { n: "No. 01", t: "사랑 시즌", desc: "우리가 사랑이라 부른 것의 다른 이름들", when: "'25 Summer", status: "종료", live: false },
            { n: "No. 05", t: "인간 회복 시즌", desc: "소진된 사람이 다시 사람이 되는 과정", when: "'26 Summer", status: "모집 예정", live: true },
          ].map((s, i) => (
            <div key={s.n} className="lp-season-row" style={i === 3 ? { opacity: 0.75 } : undefined}>
              <div className="sr-n">{s.n}</div>
              <div className="sr-t">{s.t}</div>
              <div className="sr-desc">{s.desc}</div>
              <div className="sr-when">{s.when}</div>
              <div className={`sr-status${s.live ? " live" : ""}`}>
                {s.live && <span className="st-dot" />}
                {s.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LEADERS */}
      <section className="lp-section lp-leaders" id="leaders">
        <div className="lp-section-head">
          <div className="lp-left">
            <div className="lp-eyebrow">Question Leaders — 질문을 던지는 사람들</div>
            <h2 className="lp-h-section">
              대답하는 사람이 아니라,<br /><em>질문하는</em> 사람들.
            </h2>
          </div>
          <p className="lp-lede">
            우리는 &lsquo;질문을 잘 던지는 사람&rsquo;과 함께합니다.
            가르치지 않고, 듣고, 다시 묻습니다.
          </p>
        </div>
        <div className="lp-leaders-grid">
          {[
            { initial: "J", name: "정해린", role: "시즌 04 진행", philosophy: "정답보다 진심을 믿습니다. 우리는 결론을 미루는 연습 중입니다.", q: "\"당신이 가장 오래 미뤄둔 감정은 무엇인가요?\"" },
            { initial: "S", name: "서민준", role: "시즌 03 진행", philosophy: "조용한 사람의 한 문장은 시끄러운 사람의 한 시간보다 길게 남습니다.", q: "\"당신이 마지막으로 누군가에게 진심으로 사과한 건 언제였나요?\"" },
            { initial: "Y", name: "유은재", role: "시즌 02 진행", philosophy: "대화는 답을 찾는 일이 아니라, 함께 머무는 일입니다.", q: "\"기계가 더 잘하는 시대에, 인간으로 남고 싶은 부분이 있나요?\"" },
          ].map((l) => (
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

      {/* FINAL CTA */}
      <section className="lp-final" id="final">
        <div className="lp-eyebrow">― Closing</div>
        <p className="lp-final-quote">
          질문은<br />가장 <em>인간적인</em><br />대화의 시작입니다.
        </p>
        <div className="lp-final-divider" />
        <p className="lp-final-end">
          누군가는 <em>답</em>으로 기억되고,<br />
          누군가는 <em>질문</em>으로 남습니다.
        </p>
        <Link href="/questions/create" className="lp-btn-cream">
          <span>지금 참여하기</span>
          <span className="lp-arrow" style={{ color: "var(--lp-bg-ink)" }} />
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-foot-inner">
          <div className="lp-foot-mark"><em>—</em>질문하는 사람들 · 미래혁신형 북클럽</div>
          <div className="lp-foot-links">
            <a href="#today">오늘의 질문</a>
            <a href="#season">시즌</a>
            <a href="#leaders">리더</a>
            <a href="#ask">참여 신청</a>
          </div>
          <div className="lp-foot-copy">© 2026 — Seoul, in low voice.</div>
        </div>
      </footer>
    </div>
  );
}
