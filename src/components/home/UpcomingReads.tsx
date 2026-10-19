"use client";

import { useState } from "react";
import { UPCOMING_BOOKS, UPCOMING_GENRES, type UpcomingBook } from "@/lib/bookclub/upcoming";
import NotifyForm from "@/components/bookclub/NotifyForm";
import BookCoverImage from "./BookCoverImage";
import RecommendBookForm from "./RecommendBookForm";
import { interestCopy } from "@/lib/bookclub/interest";
import styles from "./home-tools.module.css";
import "@/components/bookclub/bookclub.css";

/** 오픈 예정 북모임 — 투표 후보 책. 일정 미정이라 상세 페이지 대신 "읽고 싶어요" 등록만 받는다. */
export default function UpcomingReads({ counts = {} }: { counts?: Record<string, number> }) {
  const [genre, setGenre] = useState<(typeof UPCOMING_GENRES)[number]>("전체");
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const books = genre === "전체" ? UPCOMING_BOOKS : UPCOMING_BOOKS.filter((b) => b.genre === genre);

  return (
    <section className={styles.section} id="upcoming" aria-labelledby="upcoming-title">
      <div className={styles.sectionHead}>
        <div>
          <span className={styles.eyebrow}>COMING SOON</span>
          <h2 id="upcoming-title">오픈 예정 북모임</h2>
          <p className={styles.sectionLead}>
            회원들이 추천한 다음 책입니다. 읽고 싶은 책에 등록해 주시면, 함께 읽을 사람이 모인 책부터 북토크를 엽니다.
          </p>
        </div>
      </div>

      <div className={styles.upcomingFilters} role="tablist" aria-label="장르">
        {UPCOMING_GENRES.map((g) => (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={genre === g}
            className={genre === g ? styles.upcomingFilterActive : styles.upcomingFilter}
            onClick={() => setGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>

      <ul className={styles.bookGrid} style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {books.map((book) => (
          <li key={book.slug} className={styles.bookLink}>
            <span className={styles.coverVisual}>
              <BookCoverImage title={book.bookTitle} author={book.author} fallbackClassName={styles.coverFallback} />
            </span>
            <span className={styles.coverMeta}>
              <strong>{book.bookTitle}</strong>
              <small>{credit(book)}</small>
              <small>{book.genre} · 일정 투표 중</small>
            </span>
            <p className={styles.upcomingPitch}>{book.pitch}</p>
            <p className={styles.upcomingCount}>{interestCopy(counts[book.slug] ?? 0)}</p>
            {openSlug === book.slug ? (
              <NotifyForm clubSlug={book.slug} mode="interest" />
            ) : (
              <button
                type="button"
                className={styles.secondary}
                onClick={() => setOpenSlug(book.slug)}
                aria-label={`${book.bookTitle} 읽고 싶어요`}
              >
                읽고 싶어요
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className={styles.upcomingRecommend} id="recommend">
        <div>
          <h3>함께 읽고 싶은 책 추천하기</h3>
          <p className={styles.sectionLead}>
            목록에 없는 책이 있나요? 읽고 싶은 책을 추천해 주세요. 같은 책을 고른 분이 5명 모이면 북토크를 열고 연락드려요.
          </p>
        </div>
        <RecommendBookForm />
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
