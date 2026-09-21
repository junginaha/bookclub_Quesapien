"use client";

import Link from "next/link";
import type { BookClubSession } from "@/lib/bookclub/types";
import { formatMonthDay, getStatus } from "@/lib/bookclub/selectors";
import styles from "./home-tools.module.css";

export default function MiniBookSpread({ sessions }: { sessions: BookClubSession[] }) {
  const unique = new Map<string, BookClubSession>();
  const ordered = [...sessions].sort((a, b) => {
    const aPast = getStatus(a) === "past";
    const bPast = getStatus(b) === "past";
    if (aPast !== bPast) return aPast ? 1 : -1;
    return aPast ? Date.parse(b.startsAt) - Date.parse(a.startsAt) : Date.parse(a.startsAt) - Date.parse(b.startsAt);
  });
  for (const session of ordered) {
    const key = `${session.bookTitle}\u0000${session.author}`;
    if (!unique.has(key)) unique.set(key, session);
  }

  return <section className={styles.section} id="books" aria-labelledby="books-title">
    <div className={styles.sectionHead}><h2 id="books-title">함께 읽는 책</h2></div>
    {!unique.size ? <p className={styles.muted}>다음 책을 준비하고 있습니다.</p> : <div className={styles.bookGrid}>
      {[...unique.values()].map(session => <details className={styles.book} key={session.slug}>
        <summary className={styles.bookCover}>
          <strong>{session.bookTitle}</strong>
          <span>{session.author}</span>
          <span className={styles.bookToggle} aria-hidden="true" />
          <span className={styles.srOnly}>책 펼치기 또는 접기</span>
        </summary>
        <div className={styles.bookPages}>
          {session.leadQuestion && <p>{session.leadQuestion}</p>}
          <p>{formatMonthDay(session.startsAt)} · {getStatus(session) === "past" ? "지난 모임" : session.venue.name}</p>
          <Link className={styles.secondary} href={`/bookclub/${session.slug}`}>모임 상세 보기</Link>
        </div>
      </details>)}
    </div>}
  </section>;
}
