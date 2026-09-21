"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { BookClubSession } from "@/lib/bookclub/types";
import DiscussionGenerator from "@/components/discussion/DiscussionGenerator";
import HomeCalendarLocationHub from "./HomeCalendarLocationHub";
import MiniBookSpread from "./MiniBookSpread";
import HomeArchive from "./HomeArchive";
import "./landing.css";
import styles from "./home-tools.module.css";

export interface LandingQuestion {
  id: string;
  content: string;
  author_name: string;
  likes: number;
  saves: number;
  answers_count: number;
}

export default function LandingPage({ bookclubSessions = [] }: { bookclubSessions?: BookClubSession[] }) {
  const [navBtnIdx, setNavBtnIdx] = useState(0);
  const [navBtnFading, setNavBtnFading] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);
  const guide = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let transition: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      setNavBtnFading(true);
      transition = setTimeout(() => { setNavBtnIdx(i => (i + 1) % 2); setNavBtnFading(false); }, 300);
    }, 3000);
    return () => { clearInterval(interval); clearTimeout(transition); };
  }, []);

  useEffect(() => {
    const nav = document.getElementById("lp-nav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll("#top .lp-reveal");
    if (!("IntersectionObserver" in window)) {
      elements.forEach(element => element.classList.add("visible"));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (howToOpen && !guide.current?.open) guide.current?.showModal();
    if (!howToOpen && guide.current?.open) guide.current.close();
  }, [howToOpen]);

  return (
    <div className="lp">
      <div className="lp-grain" aria-hidden="true" />
      <div className="lp-grain-light" aria-hidden="true" />
      <nav className="lp-nav" id="lp-nav">
        <a href="#top" className="lp-wordmark">
          <span className="wm-mark" aria-hidden="true">
            <span className="wm-q">?</span><span className="wm-bang">!</span>
          </span>
          <span style={{ display: "inline-grid" }}>
            {(["질문하는 사람들", "Qsapiens"] as const).map((w, i) => (
              <span key={w} style={{
                gridArea: "1 / 1", whiteSpace: "nowrap",
                fontFamily: i === 1 ? '"EB Garamond", Georgia, serif' : "var(--lp-serif-ko)",
                fontStyle: i === 1 ? "italic" : "normal",
                fontWeight: i === 1 ? 400 : 600,
                fontSize: i === 1 ? 15 : 19,
                letterSpacing: i === 1 ? "0.06em" : "-0.012em",
                transition: "opacity 0.4s ease, transform 0.4s cubic-bezier(.2,.8,.2,1)",
                opacity: navBtnIdx === i && !navBtnFading ? 1 : 0,
                transform: navBtnIdx === i && !navBtnFading ? "translateY(0)" : navBtnIdx === i ? "translateY(-4px)" : "translateY(4px)",
              }} aria-hidden={navBtnIdx !== i}>{w}</span>
            ))}
          </span>
        </a>
        <div className="lp-nav-links">
          <a href="/questions">질문</a>
          <a href="/bookclub">북클럽</a>
          <a href="/archive">아카이빙</a>
          <a href="/giants">거인의 어깨</a>
        </div>
        <div style={{ position: "relative", width: 100, height: 40, overflow: "visible" }}>
          {[
            { href: "/login", label: "로그인", filled: false },
            { href: "/signup", label: "함께 읽기", filled: true },
          ].map((btn, i) => (
            <a
              key={btn.href}
              href={btn.href}
              className={btn.filled ? "btn-pill-neu btn-pill-neu-accent" : "btn-pill-neu"}
              tabIndex={navBtnIdx === i ? 0 : -1}
              aria-hidden={navBtnIdx !== i}
              style={{
                position: "absolute", inset: 0,
                display: "flex",
                transition: "opacity .3s ease, transform .3s ease, box-shadow .18s ease",
                opacity: navBtnIdx === i && !navBtnFading ? 1 : 0,
                transform: navBtnIdx === i && !navBtnFading ? "translateY(0)" : navBtnIdx === i ? "translateY(-5px)" : "translateY(5px)",
                pointerEvents: navBtnIdx === i ? "auto" : "none",
              }}
            >
              <span>{btn.label}</span>
            </a>
          ))}
        </div>
      </nav>
      <main>
        <section className="lp-hero" id="top">
          <div className="lp-hero-inner">
            <div className="lp-hero-meta">
              <div className="lp-eyebrow">서초구 선정 미래혁신형 북클럽</div>
              <div className="lp-right" />
            </div>
            <h1 className="lp-h-display">
              <span className="lp-reveal"><span>좋은 <span className="lp-em">질문</span>은</span></span>
              <span className="lp-reveal"><span>좋은 사람을</span></span>
              <span className="lp-reveal lp-reveal-last">
                <span style={{ display: "flex", alignItems: "flex-end", gap: "clamp(6px, 1.2vw, 16px)", flexWrap: "nowrap",
                  paddingBottom: "28px", paddingTop: "12px",
                  marginBottom: "-28px", marginTop: "-12px" }}>
                  <span>데려옵니다</span>
                  <a href="/bookclub" className="lp-hero-bookclub-btn">
                    <span>북클럽 둘러보기</span>
                  </a>
                </span>
              </span>
            </h1>
            <div className="lp-hero-sub">
              <p>
                <span className="lp-kw">질문</span>으로{" "}
                <span className="lp-kw k2">연결</span>되는 미래혁신형{" "}
                <span className="lp-kw k3">북클럽</span>.<br />
                <span className="lp-kw k4">사람들</span>이 가장 깊은 이야기를 나눠요.
              </p>
            </div>
          </div>
          <div className="lp-scroll-cue"><span className="sc-line" /></div>
          <div className="lp-hero-entry-cta">
            <button type="button" onClick={() => setHowToOpen(v => !v)} aria-expanded={howToOpen} aria-controls="how-it-works-panel" className="lp-hero-entry-btn">
              <span className="lp-hero-entry-text">처음 온 당신에게</span>
              <ChevronDown size={15} className={`lp-hero-entry-arrow${howToOpen ? " lp-hero-entry-arrow--open" : ""}`} />
            </button>
          </div>
        </section>
        <HomeCalendarLocationHub sessions={bookclubSessions} />
        <MiniBookSpread sessions={bookclubSessions} />
        <HomeArchive />
        <section className={`${styles.section} ${styles.generator}`} id="final" aria-labelledby="discussion-title">
          <div className={styles.sectionHead}><h2 id="discussion-title">발제 · 거인의 어깨</h2><a className={styles.secondary} href="/giants">전체 발제 도구</a></div>
          <DiscussionGenerator variant="landing" />
        </section>
      </main>
      <footer className="lp-footer">
        <div className="lp-foot-inner"><span className="lp-foot-mark">질문하는 사람들</span><span className="lp-foot-copy">© 2026 Qsapiens.</span></div>
      </footer>
      <dialog ref={guide} id="how-it-works-panel" className={styles.dialog} onClose={() => setHowToOpen(false)} aria-labelledby="guide-title">
        <h2 id="guide-title">처음 온 당신에게</h2>
        <p>캘린더에서 날짜를 고른 뒤, 책과 장소를 확인하고 참여를 신청하세요.</p>
        <p>혼자 오셔도, 처음이셔도 괜찮습니다.</p>
        <button type="button" onClick={() => setHowToOpen(false)}>닫기</button>
      </dialog>
    </div>
  );
}
