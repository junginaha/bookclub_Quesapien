"use client";

import Link from "next/link";
import type { BookClubSession } from "@/lib/bookclub/types";
import { formatMonthDay, getStatus, seatKind, seatNotice } from "@/lib/bookclub/selectors";
import BookCoverImage from "./BookCoverImage";
import styles from "./home-tools.module.css";
import { DoodleFace, DoodleRule } from "@/components/common/Doodle";

/** 꼬리표에 적는 두 글자 — getStatus()와 같은 분기에서 뽑는다. */
function tagFor(s: BookClubSession): string {
  const st = getStatus(s);
  return st === "past" ? "기록" : st === "full" ? "대기" : "예약";
}

/** CTA 둘째 줄 — 꼬리표와 같은 분기에서 뽑는다. */
function ctaFor(s: BookClubSession): string {
  const st = getStatus(s);
  return st === "past" ? "기록 보기" : st === "full" ? "대기 신청" : "예약하기";
}

export default function MiniBookSpread({
  sessions,
  series,
  id = "books",
  eyebrow = "NEXT READS",
  heading = "함께 읽는 책",
  lead,
}: {
  sessions: BookClubSession[];
  /**
   * 연속 기획만 추려 그린다(예: "talks-2026"). 비우면 **기획에 속하지 않은** 모임만
   * 그린다 — 같은 모임이 두 섹션에 겹쳐 뜨지 않게.
   */
  series?: string;
  id?: string;
  eyebrow?: string;
  heading?: string;
  lead?: string;
}) {
  const unique = new Map<string, BookClubSession>();
  // 진행 중·예정 모임만 — 지난 모임은 다음 섹션(ReunionReads, 우리 다시 만나요)으로 간다
  const ordered = sessions
    .filter((s) => getStatus(s) !== "past")
    .filter((s) => (series ? s.series === series : !s.series))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

  for (const session of ordered) {
    const key = session.bookTitle + "\u0000" + session.author;
    if (!unique.has(key)) unique.set(key, session);
  }

  return (
    <section className={styles.section} id={id} aria-labelledby={`${id}-title`}>
      <div className={styles.sectionHead}>
        <div>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h2 id={`${id}-title`}>{heading}</h2>
          <DoodleRule />
          {lead && <p className={`${styles.sectionLead} lp-hand`}>{lead}</p>}
        </div>
      </div>

      {!unique.size ? (
        <p className={styles.muted}>다음에 읽을 책을 고르고 있습니다.</p>
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
                    isbn={session.isbn}
                  />
                  {session.leadQuestion ? (
                    <span className={styles.coverFace}>{session.leadQuestion}</span>
                  ) : null}
                </span>
                <span className={styles.tag} aria-hidden="true">{tagFor(session)}</span>
                <span className={styles.coverMeta}>
                  {/* 레퍼런스처럼 한 줄 — 작가와 제목이 같은 크기·같은 굵기로 이어진다.
                      제목을 굵게 키우면 표지가 아니라 글자가 먼저 읽힌다. */}
                  <span className={styles.coverLine}>
                    <span className={styles.coverArtist}>{session.author}</span>
                    <span className={styles.coverSep}>{"\u00a0—"}</span>{" "}
                    <span className={styles.coverTitle}>{session.bookTitle}</span>
                  </span>
                  <small>
                    {formatMonthDay(session.startsAt)} · {session.venue.name}
                  </small>
                </span>
                <span className={`${styles.cardAction} ${styles.cardActionStatic} lp-hand lp-hand--sm`}>
                  <DoodleFace kind={seatKind(session)} />
                  <span className={styles.cardActionLabel}>
                    <span className={styles.ctaHook}>{seatNotice(session)}</span>
                    <span className={styles.ctaAction}>{ctaFor(session)}</span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
