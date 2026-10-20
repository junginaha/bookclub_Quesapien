"use client";

import { useState } from "react";
import Link from "next/link";
import type { BookClubSession } from "@/lib/bookclub/types";
import { cardBlurb, formatMonthDay, getStatus } from "@/lib/bookclub/selectors";
import { interestCopy } from "@/lib/bookclub/interest";
import NotifyForm from "@/components/bookclub/NotifyForm";
import BookCoverImage from "./BookCoverImage";
import styles from "./home-tools.module.css";
import "@/components/bookclub/bookclub.css";

/** 지난 북클럽 — 같은 책으로 다시 모이고 싶은 사람이 5명 모이면 앵콜 북클럽을 연다. */
export default function EncoreReads({
  sessions,
  counts = {},
}: {
  sessions: BookClubSession[];
  counts?: Record<string, number>;
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  // 같은 책은 가장 최근 회차 하나만
  const seen = new Set<string>();
  const past = sessions
    .filter((s) => getStatus(s) === "past")
    .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt))
    .filter((s) => {
      const key = s.bookTitle + "\u0000" + s.author;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  if (!past.length) return null;

  return (
    <section className={styles.section} id="encore" aria-labelledby="encore-title">
      <div className={styles.sectionHead}>
        <div>
          <span className={styles.eyebrow}>ENCORE</span>
          <h2 id="encore-title">우리 다시 만나요</h2>
          <p className={styles.sectionLead}>
            지난 북클럽을 놓치셨나요? 다시 이야기를 나누고 싶다면 알려주세요. 취향이 같은 5분이 모이면 앵콜 북클럽을 열고 연결해드려요.
          </p>
        </div>
      </div>

      <ul className={styles.bookGrid} style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {past.map((s) => (
          <li key={s.slug} className={styles.bookLink}>
            <Link href={"/bookclub/" + s.slug} className={styles.encoreCoverLink} aria-label={`${s.bookTitle} 지난 모임 보기`}>
              <span className={styles.coverVisual}>
                <BookCoverImage title={s.bookTitle} author={s.author} coverUrl={s.coverUrl} />
              </span>
              <span className={styles.coverMeta}>
                <strong>{s.bookTitle}</strong>
                <small>{s.author}</small>
                <small>{formatMonthDay(s.startsAt)} 진행 · {s.title}</small>
              </span>
            </Link>
            {cardBlurb(s) && <p className={styles.upcomingPitch}>{cardBlurb(s)}</p>}
            <p className={styles.upcomingCount}>{interestCopy(counts[s.slug] ?? 0)}</p>
            {openSlug === s.slug ? (
              <div style={{ marginTop: "auto" }}>
                <NotifyForm clubSlug={s.slug} mode="interest" />
              </div>
            ) : (
              <button
                type="button"
                className={styles.cardAction}
                onClick={() => setOpenSlug(s.slug)}
                aria-label={`${s.bookTitle} 다시 읽고 싶어요`}
              >
                다시 읽고 싶어요
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
