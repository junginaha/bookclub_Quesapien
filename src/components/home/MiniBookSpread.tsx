"use client";

import Link from "next/link";
import type { BookClubSession } from "@/lib/bookclub/types";
import { formatMonthDay, getStatus } from "@/lib/bookclub/selectors";
import BookCoverImage from "./BookCoverImage";
import styles from "./home-tools.module.css";

export default function MiniBookSpread({ sessions }: { sessions: BookClubSession[] }) {
  const unique = new Map<string, BookClubSession>();
  // 진행 중·예정 모임만 — 지난 모임은 다음 섹션(EncoreReads, 5명 모이면 다시 열기)으로 간다
  const ordered = sessions
    .filter((s) => getStatus(s) !== "past")
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

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
          <p className={styles.sectionLead}>책을 선택하면 모임 상세 페이지로 이동합니다.</p>
        </div>
      </div>

      {!unique.size ? (
        <p className={styles.muted}>다음 책을 고르고 있습니다.</p>
      ) : (
        <div className={styles.bookGrid}>
          {[...unique.values()].map((session) => {
            return (
              <Link
                className={styles.bookLink}
                href={"/bookclub/" + session.slug}
                key={session.slug}
                aria-label={session.bookTitle + " 북클럽 상세 보기"}
              >
                <span className={styles.coverVisual}>
                  <BookCoverImage
                    title={session.bookTitle}
                    author={session.author}
                    coverUrl={session.coverUrl}
                  />
                </span>
                <span className={styles.coverMeta}>
                  <strong>{session.bookTitle}</strong>
                  <small>{session.author}</small>
                  <small>
                    {formatMonthDay(session.startsAt)} · {session.venue.name}
                  </small>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
