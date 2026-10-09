"use client";

import Link from "next/link";
import { useState } from "react";
import type { BookClubSession } from "@/lib/bookclub/types";
import { ENCORE_THRESHOLD, formatCompactSchedule, formatMonthDay, getStatus } from "@/lib/bookclub/selectors";
import EncoreForm from "@/components/bookclub/EncoreForm";
import { JOURNEY, JOURNEY_PATH } from "@/lib/journey/hitchhiker";
import BookCoverImage from "./BookCoverImage";
import styles from "./home-tools.module.css";
import rt from "./read-together.module.css";

const SCENES = [
  "/images/bookclub/warm-group.webp",
  "/images/bookclub/actual-group.webp",
];

/** 같은 책(제목+저자)은 한 번만 — 지금 모집 중인 회차를 우선 남긴다. */
function uniqueByBook(list: BookClubSession[]): BookClubSession[] {
  const seen = new Map<string, BookClubSession>();
  for (const s of list) {
    const key = s.bookTitle + "\u0000" + s.author;
    if (!seen.has(key)) seen.set(key, s);
  }
  return [...seen.values()];
}

function EncoreCard({ session }: { session: BookClubSession }) {
  // 서버 집계가 없으면(undefined) 숫자를 숨긴다 — 0명으로 지어내지 않는다.
  const [count, setCount] = useState<number | undefined>(session.encoreCount);
  const pct = typeof count === "number" ? Math.min(100, Math.round((count / ENCORE_THRESHOLD) * 100)) : 0;
  const titleId = `encore-${session.slug}`;
  return (
    <article className={rt.encoreCard} aria-labelledby={titleId}>
      <div className={rt.encoreTop}>
        <span className={rt.encoreCover}>
          <BookCoverImage title={session.bookTitle} author={session.author} coverUrl={session.coverUrl} fallbackClassName={rt.miniFallback} />
        </span>
        <div className={rt.encoreText}>
          <h4 id={titleId}><Link href={`/bookclub/${session.slug}`}>{session.bookTitle}</Link></h4>
          <p className={rt.author}>{session.author}</p>
          {session.leadQuestion && <p className={rt.question}>“{session.leadQuestion}”</p>}
        </div>
      </div>
      {typeof count === "number" && (
        <div className={rt.progress}>
          <div className={rt.progressLabel}>
            <span>함께 읽을 사람</span>
            <strong>{Math.min(count, 99)} / {ENCORE_THRESHOLD}명</strong>
          </div>
          <div className={rt.bar} role="progressbar" aria-valuemin={0} aria-valuemax={ENCORE_THRESHOLD} aria-valuenow={Math.min(count, ENCORE_THRESHOLD)} aria-label={`${session.bookTitle} 다시 함께 읽기 신청 인원`}>
            <span style={{ width: `${pct}%` }} />
          </div>
          {count >= ENCORE_THRESHOLD && <p className={rt.ready}>모였어요. 새 일정을 준비하고 있어요.</p>}
        </div>
      )}
      <EncoreForm slug={session.slug} bookTitle={session.bookTitle} onCount={setCount} />
    </article>
  );
}

export default function MiniBookSpread({ sessions }: { sessions: BookClubSession[] }) {
  const byStart = [...sessions].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const now = uniqueByBook(byStart.filter((s) => getStatus(s) !== "past"));
  const pastRecent = [...sessions].filter((s) => getStatus(s) === "past").sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt));
  const nowKeys = new Set(now.map((s) => s.bookTitle + "\u0000" + s.author));
  // 지금 다시 열려 있는 책은 앵콜 목록에서 뺀다(같은 책 두 번 신청 방지).
  const encore = uniqueByBook(pastRecent).filter((s) => !nowKeys.has(s.bookTitle + "\u0000" + s.author));

  return (
    <section className={styles.section} id="books" aria-labelledby="books-title">
      <div className={styles.sectionHead}>
        <div>
          <span className={styles.eyebrow}>READ TOGETHER</span>
          <h2 id="books-title">함께 읽어요</h2>
          <p className={styles.sectionLead}>
            지금 모집 중인 모임에 참여하거나, 지난 책을 다시 함께 읽자고 신청해 주세요. {ENCORE_THRESHOLD}명이 모이면 새 북클럽이 열립니다.
          </p>
        </div>
      </div>

      {/* 추천 독서여행 카드 — 정식 선정 전이므로 '추천·모집 중'으로만 표기 */}
      <Link className={rt.journey} href={JOURNEY_PATH} aria-label={`${JOURNEY.title} 상세 보기`}>
        <span className={rt.journeyArt} aria-hidden="true">
          <svg viewBox="0 0 120 120" focusable="false">
            <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".45" />
            <circle cx="60" cy="60" r="11" fill="currentColor" />
            <circle cx="93" cy="38" r="3.5" fill="currentColor" />
          </svg>
        </span>
        <span className={rt.journeyText}>
          <span className={rt.journeyBadge}>{JOURNEY.status}</span>
          <strong>{JOURNEY.headline}</strong>
          <small>《{JOURNEY.book.title}》 · {JOURNEY.period} · 4개월 함께 읽기</small>
        </span>
        <span className={rt.journeyCta}>상세 보기 →</span>
      </Link>

      {/* 1 · 지금 함께 읽어요 — 캘린더 데이터(data.ts) 기준 자동 갱신 */}
      <div className={rt.block} aria-labelledby="rt-now-title">
        <div className={rt.blockHead}>
          <h3 id="rt-now-title">지금 함께 읽어요</h3>
          <Link className={rt.more} href="/bookclub">전체 일정</Link>
        </div>
        {!now.length ? (
          <p className={styles.muted}>다음 책을 고르고 있습니다. 아래에서 다시 읽고 싶은 책을 신청해 주세요.</p>
        ) : (
          <div className={styles.bookGrid}>
            {now.map((session, index) => {
              const scene = SCENES[index];
              return (
                <Link className={styles.bookLink} href={"/bookclub/" + session.slug} key={session.slug} aria-label={session.bookTitle + " 북클럽 상세 보기"}>
                  <span className={styles.coverVisual}>
                    <BookCoverImage title={session.bookTitle} author={session.author} coverUrl={session.coverUrl} fallbackClassName={styles.coverFallback} />
                    {scene && (
                      <span className={styles.coverScene} aria-hidden="true">
                        <img src={scene} alt="" loading="lazy" />
                      </span>
                    )}
                  </span>
                  <span className={styles.coverMeta}>
                    <strong>{session.bookTitle}</strong>
                    <small>{session.author}</small>
                    <small>{formatMonthDay(session.startsAt)} · {session.venue.name}</small>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 2 · 다시 함께 읽어요 — 지난 책 앵콜 예약: 5명 모이면 재개설 */}
      {encore.length > 0 && (
        <div className={rt.block} aria-labelledby="rt-encore-title">
          <div className={rt.blockHead}>
            <h3 id="rt-encore-title">다시 함께 읽어요</h3>
          </div>
          <p className={rt.blockLead}>
            좋았던 책을 다시 엽니다. 읽고 싶은 책에 신청을 남기면, 같은 책을 고른 사람이 {ENCORE_THRESHOLD}명 모일 때 이메일·문자·전화 중 원하시는 방법으로 알려드려요.
          </p>
          <div className={rt.encoreGrid}>
            {encore.map((session) => <EncoreCard key={session.slug} session={session} />)}
          </div>
        </div>
      )}

      {/* 3 · 지난 북클럽 — 끝난 모임 전체 기록 */}
      {pastRecent.length > 0 && (
        <details className={rt.pastList}>
          <summary>지난 북클럽 <span>{pastRecent.length}</span></summary>
          <ol>
            {pastRecent.map((s) => (
              <li key={s.slug}>
                <Link href={`/bookclub/${s.slug}`}>
                  <strong>{s.bookTitle}</strong>
                  <span>{s.author}</span>
                  <time dateTime={s.startsAt}>{formatCompactSchedule(s.startsAt, s.endsAt)}</time>
                </Link>
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}
