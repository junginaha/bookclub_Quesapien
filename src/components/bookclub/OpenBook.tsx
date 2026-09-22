"use client";

import { useState } from "react";
import type { BookClubSession } from "@/lib/bookclub/types";
import BookCoverImage from "@/components/home/BookCoverImage";
import { formatMonthDay, formatTimeRange } from "@/lib/bookclub/selectors";
import styles from "./OpenBook.module.css";

export default function OpenBook({ session }: { session: BookClubSession }) {
  const [spread, setSpread] = useState(0);
  return (
    <section className={styles.reader} aria-label={session.bookTitle + " 펼쳐 읽기"}>
      <div className={styles.toolbar}>
        <span>책을 펼치다</span>
        <span aria-live="polite">{spread === 0 ? "책 소개 · 1–2" : "함께 나눌 이야기 · 3–4"}</span>
      </div>
      <div className={styles.book} key={spread}>
        <article className={styles.page}>
          <span className={styles.running}>질문하는 사람들 · 북클럽</span>
          {spread === 0 ? (
            <>
              <div className={styles.cover}>
                <BookCoverImage title={session.bookTitle} author={session.author} coverUrl={session.coverUrl} priority />
              </div>
              <h1 className={styles.title}>{session.bookTitle}</h1>
              <p className={styles.author}>{session.author}</p>
              <span className={styles.note}>한 권의 책, 서로 다른 생각.</span>
            </>
          ) : (
            <>
              <span className={styles.kicker}>함께 생각하기</span>
              <h2>어떤 이야기를<br />나누게 될까요?</h2>
              {session.agendaPreview.length ? (
                <ol className={styles.questions}>{session.agendaPreview.map((question, i) => <li key={i}>{question}</li>)}</ol>
              ) : (
                <p className={styles.copy}>{session.leadQuestion || "마음에 남은 문장과 함께 나누고 싶은 질문을 가져와 주세요."}</p>
              )}
            </>
          )}
          <span className={styles.number}>{spread * 2 + 1}</span>
        </article>
        <article className={styles.page}>
          <span className={styles.running}>{session.bookTitle}</span>
          <span className={styles.kicker}>{spread === 0 ? "이 책과 만나는 시간" : "모임 안내"}</span>
          <h2>{spread === 0 ? "책 속으로" : "함께 읽는 날"}</h2>
          {spread === 0 ? (
            <>
              <p className={styles.copy}>{session.bookIntro || session.summary}</p>
              <p className={styles.note}>북클럽에서 준비한 소개입니다.</p>
              {session.bookSourceUrl && <a href={session.bookSourceUrl} target="_blank" rel="noreferrer" className={styles.source}>도서 정보 보기 ↗</a>}
            </>
          ) : (
            <>
              <dl className={styles.meta}>
                <div><dt>날짜</dt><dd>{formatMonthDay(session.startsAt)}</dd></div>
                <div><dt>시간</dt><dd>{formatTimeRange(session.startsAt, session.endsAt)}</dd></div>
                <div><dt>장소</dt><dd>{session.venue.name}</dd></div>
              </dl>
              <p className={styles.copy}>{session.title}</p>
              <a href="#meeting-details" className={styles.source}>모임 상세 · 신청 안내 ↓</a>
            </>
          )}
          <span className={styles.number}>{spread * 2 + 2}</span>
        </article>
      </div>
      <nav className={styles.controls} aria-label="책 페이지 넘기기">
        <button type="button" disabled={spread === 0} onClick={() => setSpread(0)}>← 이전</button>
        <span>{spread + 1} / 2</span>
        <button type="button" disabled={spread === 1} onClick={() => setSpread(1)}>다음 →</button>
      </nav>
    </section>
  );
}
