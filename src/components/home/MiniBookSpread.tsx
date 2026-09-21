"use client";

import Link from "next/link";
import type { BookClubSession } from "@/lib/bookclub/types";
import { formatMonthDay, getStatus } from "@/lib/bookclub/selectors";
import BookCoverImage from "./BookCoverImage";
import ClubMoments from "./ClubMoments";
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
    const key = session.bookTitle + "\u0000" + session.author;
    if (!unique.has(key)) unique.set(key, session);
  }

  return (
    <section className={styles.section} id="books" aria-labelledby="books-title">
      <div className={styles.sectionHead}>
        <div>
          <span className={styles.eyebrow}>NEXT READS</span>
          <h2 id="books-title">함께 읽는 책</h2>
          <p className={styles.sectionLead}>책을 고르는 순간부터 모임은 시작됩니다. 표지를 눌러 다음 대화를 미리 만나보세요.</p>
        </div>
      </div>

      {!unique.size ? (
        <p className={styles.muted}>다음 책을 고르고 있습니다.</p>
      ) : (
        <div className={styles.bookGrid}>
          {[...unique.values()].map((session) => (
            <details className={styles.book} key={session.slug}>
              <summary className={styles.bookCover}>
                <span className={styles.coverVisual}>
                  <BookCoverImage
                    title={session.bookTitle}
                    author={session.author}
                    fallbackClassName={styles.coverFallback}
                  />
                </span>
                <span className={styles.coverMeta}>
                  <strong>{session.bookTitle}</strong>
                  <small>{session.author}</small>
                </span>
                <span className={styles.bookToggle} aria-hidden="true" />
                <span className={styles.srOnly}>책 정보 펼치기 또는 접기</span>
              </summary>
              <div className={styles.bookPages}>
                {session.leadQuestion && <p className={styles.bookQuestion}>{session.leadQuestion}</p>}
                <p className={styles.bookSummary}>{session.summary.split("\n").filter(Boolean).slice(0, 2).join(" ")}</p>
                <p className={styles.bookDate}>{formatMonthDay(session.startsAt)} · {getStatus(session) === "past" ? "지난 대화" : session.venue.name}</p>
                <Link className={styles.secondary} href={"/bookclub/" + session.slug}>모임 자세히 보기</Link>
              </div>
            </details>
          ))}
        </div>
      )}

      <ClubMoments />
    </section>
  );
}
