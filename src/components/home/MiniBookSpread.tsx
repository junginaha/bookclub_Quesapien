"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { BookClubSession } from "@/lib/bookclub/types";

function isPast(session: BookClubSession) {
  return new Date(session.endsAt).getTime() < Date.now();
}

function dateLabel(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 ${weekday}요일`;
}

export default function MiniBookSpread({ sessions }: { sessions: BookClubSession[] }) {
  const session = useMemo(
    () => sessions.find((item) => !isPast(item)) ?? sessions[0] ?? null,
    [sessions]
  );
  const [open, setOpen] = useState(false);

  if (!session) return null;

  const summary =
    session.summary.split("\n").find((line) => line.trim().length > 0) ??
    "책 한 권과 질문 하나를 들고 만납니다.";

  return (
    <section className="lp-mini-book-section" aria-label="인터랙티브 북클럽 미리보기">
      <div className="lp-mini-book-copy">
        <span>INTERACTIVE BOOK</span>
        <h2>책을 펼치면, 다음 모임이 보입니다.</h2>
        <p>메인 기능을 방해하지 않도록 작게 두었습니다. 책을 눌러 펼쳐보세요.</p>
      </div>

      <button
        type="button"
        className={`lp-mini-book${open ? " is-open" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "책 닫기" : "책 펼치기"}
      >
        <span className="lp-mini-book-cover">
          <small>QUESTIONING PEOPLE</small>
          <strong>{session.bookTitle}</strong>
          <em>{open ? "닫기" : "펼치기 →"}</em>
        </span>
        <span className="lp-mini-book-pages">
          <span className="lp-mini-page left">
            <small>NEXT BOOK CLUB</small>
            <strong>{dateLabel(session.startsAt)}</strong>
            <p>{session.venue.name}</p>
          </span>
          <span className="lp-mini-page right">
            <small>{session.author}</small>
            <p>{summary}</p>
            <Link href={`/bookclub/${session.slug}`} onClick={(event) => event.stopPropagation()}>
              자세히 보기 →
            </Link>
          </span>
        </span>
      </button>
    </section>
  );
}
