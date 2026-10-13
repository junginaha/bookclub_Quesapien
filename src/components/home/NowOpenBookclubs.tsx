"use client";

import Link from "next/link";
import { useState } from "react";
import { genreLabel, genreOf, type GenreId } from "@/lib/bookclub/genres";
import GenreChips from "./GenreChips";
import type { BookClubSession } from "@/lib/bookclub/types";
import { formatCompactSchedule, getStatus, isWaitlistFull, seatsLeft } from "@/lib/bookclub/selectors";
import BookCoverImage from "./BookCoverImage";
import styles from "./home-tools.module.css";

export const FIND_NEARBY_EVENT = "qs:find-nearby";

function statusLabel(session: BookClubSession): string {
  const status = getStatus(session);
  if (status === "open") return `모집 중 · ${seatsLeft(session)}자리 남음`;
  return isWaitlistFull(session) ? "정원·대기 마감" : "정원 마감 · 대기 신청 가능";
}

// 지금 열리는 북클럽 — 지나지 않은 모임만, 가까운 날짜순.
// 상단 세 버튼: 지금 바로 참여하기(가장 가까운 모집 중 모임) / 달력에서 보기 / 내 근처에서 찾기.
export default function NowOpenBookclubs({ sessions }: { sessions: BookClubSession[] }) {
  const upcoming = sessions
    .filter((s) => Number.isFinite(Date.parse(s.startsAt)) && getStatus(s) !== "past")
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const nextOpen = upcoming.find((s) => getStatus(s) === "open");
  const [genre, setGenre] = useState<GenreId | "all">("all");
  const available = new Set(upcoming.map((s) => genreOf(s.slug)).filter((g): g is GenreId => !!g));
  const shown = genre === "all" ? upcoming : upcoming.filter((s) => genreOf(s.slug) === genre);

  function findNearby() {
    document.getElementById("calendar")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.dispatchEvent(new Event(FIND_NEARBY_EVENT));
  }

  return (
    <section className={styles.section} id="now" aria-labelledby="now-title">
      <div className={styles.sectionHead}>
        <div>
          <span className={styles.eyebrow}>NOW OPEN</span>
          <h2 id="now-title">지금 열리는 북클럽</h2>
          <p className={styles.sectionLead}>서초·강남에서 이번 달에 함께 읽는 책입니다. 혼자 오셔도 괜찮아요.</p>
        </div>
      </div>

      <div className={styles.nowActions}>
        {nextOpen ? (
          <Link className={styles.primary} href={`/bookclub/${nextOpen.slug}#apply`}>지금 바로 참여하기</Link>
        ) : (
          <a className={styles.primary} href="#waiting">기다리는 북클럽 보기</a>
        )}
        <a className={styles.secondary} href="#calendar">달력에서 보기</a>
        <button type="button" className={styles.secondary} onClick={findNearby}>내 근처에서 찾기</button>
      </div>

      <GenreChips available={available} value={genre} onChange={setGenre} label="지금 열리는 북클럽 장르" />

      {upcoming.length === 0 ? (
        <p className={styles.muted}>다음 모임을 준비하고 있습니다. 아래 기다리는 북클럽에 이름을 올려 주세요.</p>
      ) : (
        <ul className={styles.nowList}>
          {shown.map((session) => {
            const status = getStatus(session);
            const g = genreOf(session.slug);
            return (
              <li key={session.slug} className={styles.nowItem}>
                <Link className={styles.nowCover} href={`/bookclub/${session.slug}`} aria-label={`${session.bookTitle} 북클럽 상세 보기`}>
                  <BookCoverImage
                    title={session.bookTitle}
                    author={session.author}
                    coverUrl={session.coverUrl}
                    fallbackClassName={styles.coverFallback}
                  />
                </Link>
                <div className={styles.nowBody}>
                  <p className={`${styles.status}${status === "open" ? ` ${styles.statusOpen}` : ""}`}>
                    {statusLabel(session)}{g && <span className={styles.genreTag}>{genreLabel(g)}</span>}
                  </p>
                  <h3><Link href={`/bookclub/${session.slug}`}>{session.bookTitle}</Link></h3>
                  <p className={styles.nowMeta}>
                    {session.author}
                    <br />
                    <time dateTime={session.startsAt}>{formatCompactSchedule(session.startsAt, session.endsAt)}</time>
                    {" · "}{session.venue.name || "장소 추후 안내"}
                  </p>
                  <Link className={styles.nowLink} href={`/bookclub/${session.slug}${status === "open" || !isWaitlistFull(session) ? "#apply" : ""}`}>
                    {status === "open" ? "참여 신청 →" : isWaitlistFull(session) ? "상세 보기 →" : "대기 신청 →"}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
