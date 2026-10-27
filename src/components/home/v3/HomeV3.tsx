"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { BookClubSession } from "@/lib/bookclub/types";
import { dateKey, formatMonthDay, formatTimeOfDay, formatWeekdayFull, getStatus, seatsLeft, sortByStart } from "@/lib/bookclub/selectors";
import { UPCOMING_BOOKS, UPCOMING_GENRES, type UpcomingBook } from "@/lib/bookclub/upcoming";
import { INTEREST_THRESHOLD } from "@/lib/bookclub/interest";
import InterestDialog from "@/components/home/InterestDialog";
import RecommendBookForm from "@/components/home/RecommendBookForm";
import BookCoverImage from "@/components/home/BookCoverImage";
import "./home-v3.css";

/**
 * 홈 v3 — MASTER_v3.md §2.
 * 순서: 히어로 → 달력·내 근처 → 지금 열리는 북클럽 → 함께 여는 북클럽 → 책 요청 → 처음 오시는 분께.
 * 데이터 없는 섹션은 렌더하지 않는다. 후기·수치 창작 없음(실제 집계만).
 */

type OpenItem =
  | { kind: "past"; key: string; title: string; author: string; question: string; href: string; coverUrl?: string; isbn?: string; genre?: undefined }
  | { kind: "next"; key: string; title: string; author: string; question: string; href?: undefined; coverUrl?: string; isbn?: string; genre: UpcomingBook["genre"] };

const PIN = (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

function seatCopy(left: number) {
  if (left <= 0) return "자리가 다 찼어요";
  if (left <= 2) return `${left}자리 남았어요`;
  return `남은 ${left}자리`;
}

function daysUntil(iso: string) {
  // KST 날짜 기준(시각 무관): 오늘 19시 모임은 "오늘", 자정 넘기면 "내일".
  const [y1, m1, d1] = dateKey(iso).split("-").map(Number);
  const [y0, m0, d0] = dateKey(new Date()).split("-").map(Number);
  return Math.round((Date.UTC(y1, m1 - 1, d1) - Date.UTC(y0, m0 - 1, d0)) / 86_400_000);
}

function whenKicker(s: BookClubSession) {
  const d = daysUntil(s.startsAt);
  if (d <= 0) return "오늘";
  if (d === 1) return "내일";
  if (d <= 7) return `이번 주 ${formatWeekdayFull(s.startsAt)}`;
  if (d <= 14) return `다음 주 ${formatWeekdayFull(s.startsAt)}`;
  return formatMonthDay(s.startsAt);
}

export default function HomeV3({
  sessions,
  interestCounts = {},
}: {
  sessions: BookClubSession[];
  interestCounts?: Record<string, number>;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [filter, setFilter] = useState<(typeof UPCOMING_GENRES)[number]>("전체");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [liveCounts, setLiveCounts] = useState<Record<string, number>>({});
  const [showAll, setShowAll] = useState(false);
  const PREVIEW = 6;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const upcoming = useMemo(
    () => sessions.filter((s) => getStatus(s) !== "past").sort(sortByStart).slice(0, 8),
    [sessions],
  );

  const openItems = useMemo<OpenItem[]>(() => {
    const seen = new Set<string>();
    const past: OpenItem[] = sessions
      .filter((s) => getStatus(s) === "past")
      .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt))
      .filter((s) => {
        const k = `${s.bookTitle}\u0000${s.author}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .map((s) => ({ kind: "past", key: s.slug, title: s.bookTitle, author: s.author, question: s.leadQuestion, href: `/bookclub/${s.slug}`, coverUrl: s.coverUrl, isbn: s.isbn }));
    const next: OpenItem[] = UPCOMING_BOOKS.map((b) => ({ kind: "next", key: b.slug, title: b.bookTitle, author: b.author, question: b.pitch, genre: b.genre, isbn: b.isbn }));
    const all = [...past, ...next];
    const count = (k: string) => liveCounts[k] ?? interestCounts[k] ?? 0;
    // 게이지 높은 순 — 숫자 0은 뒤로
    return all.sort((a, b) => count(b.key) - count(a.key));
  }, [sessions, interestCounts, liveCounts]);

  const filteredOpen = filter === "전체" ? openItems : openItems.filter((i) => i.kind === "next" && i.genre === filter);
  const visibleOpen = showAll ? filteredOpen : filteredOpen.slice(0, PREVIEW);
  const hiddenCount = filteredOpen.length - visibleOpen.length;
  const countOf = (k: string) => liveCounts[k] ?? interestCounts[k] ?? 0;
  const dialogItem = openItems.find((i) => i.key === openKey) ?? null;

  return (
    <div className="qv3">
      <header className={`qv3-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="qv3-wrap qv3-header-in">
          <Link href="/" className="qv3-wordmark" aria-label="질문하는 사람들 홈">
            질문하는 사람들 <small>Qsapiens</small>
          </Link>
          <nav className="qv3-nav" aria-label="주요 메뉴">
            <Link href="/bookclub?view=calendar">달력</Link>
            <a href="#now">지금 열리는</a>
            <a href="#open">함께 여는</a>
            <Link href="/archive">기록</Link>
          </nav>
          <Link href="/mypage" className="qv3-icon-btn" aria-label="내 북클럽">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </Link>
        </div>
      </header>

      <main>
        <section className="qv3-wrap qv3-hero" aria-labelledby="hero-title">
          <span className="qv3-hero-eyebrow">서초구 선정 미래혁신형 북클럽</span>
          <h1 id="hero-title">질문 하나로<br />시작하는 북클럽</h1>
          <p>책을 다 읽지 않아도 괜찮아요.<br />질문 하나만 들고 오세요.</p>
          <Link href="/bookclub?view=map" className="qv3-cta qv3-cta--hero">{PIN} 내 근처 북클럽 찾기</Link>
          <Link href="/bookclub?view=calendar" className="qv3-link-quiet">달력으로 보기</Link>
        </section>

        {upcoming.length > 0 && (
          <section className="qv3-wrap qv3-section" id="now" aria-labelledby="now-title">
            <div className="qv3-section-head">
              <h2 id="now-title">지금 열리는 북클럽</h2>
              <Link href="/bookclub">리스트 · 지도 · 달력</Link>
            </div>
            <div className="qv3-grid">
              {upcoming.map((s) => {
                const left = seatsLeft(s);
                const full = getStatus(s) === "full";
                return (
                  <Link key={s.slug} href={`/bookclub/${s.slug}`} className="qv3-card qv3-card--book">
                    <span className="qv3-card-top">
                      <span className="qv3-cover"><BookCoverImage title={s.bookTitle} author={s.author} coverUrl={s.coverUrl} isbn={s.isbn} /></span>
                      <span className="qv3-card-body">
                        <span className={`qv3-kicker${daysUntil(s.startsAt) <= 7 ? " qv3-kicker--soon" : ""}`}>{whenKicker(s)}</span>
                        <span className="qv3-q">{s.leadQuestion || s.title}</span>
                        <span className="qv3-book">{s.bookTitle} · {s.author}</span>
                      </span>
                    </span>
                    <span className="qv3-meta">
                      <span>{formatMonthDay(s.startsAt)} {formatWeekdayFull(s.startsAt).replace("요일", "")} · {formatTimeOfDay(s.startsAt)}</span>
                      <span className="m2">{s.venue.name} · {full ? "자리가 다 찼어요 · 대기 받아요" : seatCopy(left)}</span>
                    </span>
                    <span className="qv3-btn">{full ? "대기 신청" : "예약하기"}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {openItems.length > 0 && (
          <section className="qv3-wrap qv3-section" id="open" aria-labelledby="open-title">
            <span id="encore" aria-hidden="true" />
            <span id="upcoming" aria-hidden="true" />
            <div className="qv3-section-head">
              <div>
                <h2 id="open-title">함께 여는 북클럽</h2>
                <p>{INTEREST_THRESHOLD}명이 모이면 날짜를 정하고 함께 읽어요.</p>
              </div>
            </div>
            <div className="qv3-filters" role="group" aria-label="장르">
              {UPCOMING_GENRES.map((g) => (
                <button key={g} type="button" className="qv3-filter" aria-pressed={filter === g} onClick={() => setFilter(g)}>{g}</button>
              ))}
            </div>
            <div className="qv3-grid">
              {visibleOpen.map((it) => {
                const n = countOf(it.key);
                const pct = Math.min(100, Math.round((n / INTEREST_THRESHOLD) * 100));
                const need = Math.max(0, INTEREST_THRESHOLD - n);
                return (
                  <article key={it.key} className="qv3-card qv3-card--book">
                    <span className="qv3-card-top">
                      <span className="qv3-cover"><BookCoverImage title={it.title} author={it.author} coverUrl={it.coverUrl} isbn={it.isbn} /></span>
                      <span className="qv3-card-body">
                        <span className={`qv3-chip ${it.kind === "past" ? "qv3-chip--sage" : "qv3-chip--cta"}`}>{it.kind === "past" ? "다시 함께" : "새로"}</span>
                        <span className="qv3-q qv3-q--sm">{it.question || it.title}</span>
                        <span className="qv3-book">{it.question ? `${it.title}${it.author ? ` · ${it.author}` : ""}` : it.author}</span>
                      </span>
                    </span>
                    <span className="qv3-gauge" aria-label={`${n}명 모임, ${INTEREST_THRESHOLD}명이면 출발`}>
                      <span className="qv3-gauge-row">
                        <b>{n > 0 ? `${n}/${INTEREST_THRESHOLD}명 모였어요` : "함께 읽을 분을 기다려요"}</b>
                        <span>{n > 0 && need > 0 ? `${need}명만 더` : n >= INTEREST_THRESHOLD ? "일정 준비 중" : `${INTEREST_THRESHOLD}명이면 열려요`}</span>
                      </span>
                      <span className="qv3-gauge-bar"><span className="qv3-gauge-fill" style={{ width: `${pct}%` }} /></span>
                    </span>
                    <button type="button" className="qv3-btn qv3-btn--ink" onClick={() => setOpenKey(it.key)}>함께 열기</button>
                  </article>
                );
              })}
            </div>
            {hiddenCount > 0 && (
              <button type="button" className="qv3-btn" onClick={() => setShowAll(true)}>{hiddenCount}권 더 보기</button>
            )}
            {visibleOpen.length === 0 && (
              <div className="qv3-empty">
                <strong>이 장르는 아직 없어요.</strong>
                <p>읽고 싶은 책을 아래에 알려주시면 함께 열어볼게요.</p>
                <a href="#recommend" className="qv3-btn">책 요청하기</a>
              </div>
            )}
          </section>
        )}

        <section className="qv3-wrap qv3-section" id="recommend" aria-labelledby="rec-title">
          <div className="qv3-section-head">
            <div>
              <h2 id="rec-title">읽고 싶은 책이 있나요?</h2>
              <p>아직 없으면 알려주세요. 같은 책을 기다리는 분이 {INTEREST_THRESHOLD}명 모이면 함께 열어요.</p>
            </div>
          </div>
          <div className="qv3-recommend">
            <RecommendBookForm />
          </div>
        </section>

        <div className="qv3-wrap">
          <section className="qv3-first" aria-labelledby="first-title">
            <div className="qv3-first-body">
              <h2 id="first-title">처음 오시는 분께</h2>
              <p>발표하지 않아도 돼요. 듣기만 해도 괜찮고, 중간에 나가도 괜찮아요.<br />질문 하나만 있으면 충분합니다.</p>
              <Link href="/guide">자세히 보기 →</Link>
            </div>
          </section>
        </div>
      </main>

      <footer className="qv3-wrap qv3-footer">
        <div className="qv3-footer-links">
          <Link href="/guide">안내</Link>
          <Link href="/archive">기록</Link>
          <Link href="/terms">이용약관</Link>
          <Link href="/privacy">개인정보 처리방침</Link>
        </div>
        <span>© 2026 질문하는 사람들 · Qsapiens</span>
      </footer>

      {dialogItem && (
        <InterestDialog
          clubSlug={dialogItem.key}
          bookTitle={dialogItem.title}
          open={openKey != null}
          onClose={() => setOpenKey(null)}
          onDone={(c) => c != null && setLiveCounts((m) => ({ ...m, [dialogItem.key]: c }))}
        />
      )}
    </div>
  );
}
