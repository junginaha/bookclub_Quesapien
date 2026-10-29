"use client";

import { useState } from "react";
import Link from "next/link";
import type { BookClubSession } from "@/lib/bookclub/types";
import { cardBlurb, getStatus } from "@/lib/bookclub/selectors";
import { UPCOMING_BOOKS, UPCOMING_GENRES, type UpcomingBook } from "@/lib/bookclub/upcoming";
import { INTEREST_CTA, interestCount, interestFace } from "@/lib/bookclub/interest";
import { DoodleFace, DoodleRule } from "@/components/common/Doodle";
import InterestDialog from "./InterestDialog";
import BookCoverImage from "./BookCoverImage";
import RecommendBookForm from "./RecommendBookForm";
import styles from "./home-tools.module.css";
import "@/components/bookclub/bookclub.css";

/**
 * 우리 다시 만나요 — 지난 북클럽(앵콜) + 회원이 추천한 다음 책(오픈 예정)을 한 섹션으로.
 * 지난 모임은 날짜를 노출하지 않는다(운영자 지시). 어느 책이든 5명이 모이면 북클럽을 연다.
 */
type Item =
  | { kind: "past"; key: string; session: BookClubSession }
  | { kind: "next"; key: string; book: UpcomingBook };

const FILTERS = UPCOMING_GENRES;
type Filter = (typeof FILTERS)[number];

export default function ReunionReads({
  sessions,
  counts = {},
}: {
  sessions: BookClubSession[];
  counts?: Record<string, number>;
}) {
  const [filter, setFilter] = useState<Filter>("전체");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [liveCounts, setLiveCounts] = useState<Record<string, number>>({});
  const [recOpen, setRecOpen] = useState(false);

  // 지난 모임 — 같은 책은 가장 최근 회차 하나만
  const seen = new Set<string>();
  const past: Item[] = sessions
    .filter((s) => getStatus(s) === "past")
    .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt))
    .filter((s) => {
      const k = s.bookTitle + "\u0000" + s.author;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .map((s) => ({ kind: "past", key: s.slug, session: s }));
  const next: Item[] = UPCOMING_BOOKS.map((b) => ({ kind: "next", key: b.slug, book: b }));

  const items =
    filter === "전체" ? [...past, ...next] : next.filter((i) => i.kind === "next" && i.book.genre === filter);

  return (
    <section className={styles.section} id="encore" aria-labelledby="encore-title">
      {/* 공지·llms.txt에 나간 #upcoming 링크를 살리기 위한 앵커 */}
      <span id="upcoming" aria-hidden="true" />
      <div className={styles.sectionHead}>
        <div>
          <span className={styles.eyebrow}>ENCORE</span>
          <h2 id="encore-title">우리 다시 만나요</h2>
          <DoodleRule />
          <p className={`${styles.sectionLead} lp-hand`}>
            지난 북클럽을 놓치셨나요? 다시 이야기를 나누고 싶다면 알려주세요. 취향이 같은 5분이 모이면 앵콜 북클럽을 열고 연결해드려요.
          </p>
        </div>
      </div>

      <div className={styles.upcomingFilters} role="tablist" aria-label="분류">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={filter === f ? styles.upcomingFilterActive : styles.upcomingFilter}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className={styles.bookGrid} style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item) => {
          const isPast = item.kind === "past";
          const title = isPast ? item.session.bookTitle : item.book.bookTitle;
          const author = isPast ? item.session.author : item.book.author;
          const blurb = isPast ? cardBlurb(item.session) : item.book.pitch;
          const cover = (
            <>
              <span className={styles.coverVisual}>
                <BookCoverImage title={title} author={author} coverUrl={isPast ? item.session.coverUrl : undefined} isbn={isPast ? item.session.isbn : item.book.isbn} />
              </span>
              <span className={styles.coverMeta}>
                <strong>{title}</strong>
                <small>{isPast ? author : credit(item.book)}</small>
                {!isPast && <small>{item.book.genre}</small>}
              </span>
            </>
          );
          return (
            <li key={item.key} className={styles.bookLink}>
              {isPast ? (
                <Link href={"/bookclub/" + item.session.slug} className={styles.encoreCoverLink} aria-label={`${title} 북클럽 보기`}>
                  {cover}
                  <span className={styles.tag} aria-hidden="true">기록</span>
                </Link>
              ) : (
                cover
              )}
              {blurb && <p className={styles.upcomingPitch}>{blurb}</p>}
              <div className={styles.cardFoot}>
                {(() => {
                  const n = liveCounts[item.key] ?? counts[item.key] ?? 0;
                  const tally = interestCount(n);
                  return (
                    <>
                      {tally && <p className={`${styles.cardFootCopy} lp-hand lp-hand--sm`}>{tally}</p>}
                      <button
                        type="button"
                        className={`${styles.cardAction} lp-hand lp-hand--sm`}
                        onClick={() => setOpenKey(item.key)}
                        aria-label={`${title} 같이 읽어요`}
                      >
                        <DoodleFace kind={interestFace(n)} />
                        <span className={styles.cardActionLabel}>{INTEREST_CTA}</span>
                      </button>
                    </>
                  );
                })()}
              </div>
              <InterestDialog
                clubSlug={item.key}
                bookTitle={title}
                open={openKey === item.key}
                onClose={() => setOpenKey(null)}
                onDone={(c) => c != null && setLiveCounts((m) => ({ ...m, [item.key]: c }))}
              />
            </li>
          );
        })}
      </ul>

      <div className={`${styles.upcomingRecommend}${recOpen ? ` ${styles.recommendOpen}` : ""}`} id="recommend">
        <div>
          <h3>함께 읽고 싶은 책 추천하기</h3>
          <DoodleRule />
          <p className={`${styles.sectionLead} lp-hand`}>
            목록에 없는 책이 있나요? 읽고 싶은 책을 추천해 주세요. 같은 책을 고른 분이 5명 모이면 북토크를 열고 연락드려요.
          </p>
          <button
            type="button"
            className={styles.recommendCta}
            aria-expanded={recOpen}
            aria-controls="recommend-form"
            onClick={() => setRecOpen((v) => !v)}
          >
            <span className={styles.recommendCtaGlow} aria-hidden="true" />
            <span className={styles.recommendCtaLabel}>{recOpen ? "접어두기" : "읽고 싶은 책 추천하기"}</span>
            <span className={styles.recommendCtaArrow} aria-hidden="true">{recOpen ? "↑" : "→"}</span>
          </button>
        </div>
        <div id="recommend-form" className={styles.recommendPanel} hidden={!recOpen}>
          <RecommendBookForm />
        </div>
      </div>
    </section>
  );
}

function credit(b: UpcomingBook) {
  const parts = [b.author || "저자 확인 중"];
  if (b.translator) parts.push(`${b.translator} 옮김`);
  if (b.publisher) parts.push(b.publisher);
  return parts.join(" · ");
}
