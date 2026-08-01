"use client";

import { useMemo, useState } from "react";
import "./board.css";
import type { BoardCardData, PastClubData } from "./types";
import ClubBoardCard from "./ClubBoardCard";
import BookClubCalendar from "./BookClubCalendar";
import { BOARD_SORTS, type BoardSort, formatFullDateWeekday, sortBoard } from "@/lib/bookclubBoard";

export default function BookClubBoard({
  clubs,
  pastClubs,
}: {
  clubs: BoardCardData[];
  pastClubs: PastClubData[];
}) {
  const [sort, setSort] = useState<BoardSort>("date");
  const [view, setView] = useState<"calendar" | "list">("calendar");

  const sorted = useMemo(() => sortBoard(clubs, sort), [clubs, sort]);

  return (
    <div className="qb-board">
      <div className="qb-board-inner">
        <div className="qb-page-heading">
          <div>
            <p className="qb-page-kicker">BOOK CLUB</p>
            <h1>북클럽 일정</h1>
            <p className="qb-page-intro">날짜를 선택하면 모임 정보를 바로 확인할 수 있어요.</p>
          </div>
          <div className="qb-view-tabs" aria-label="일정 보기 방식">
            <button type="button" className={view === "calendar" ? "is-active" : ""} onClick={() => setView("calendar")} aria-pressed={view === "calendar"}>달력</button>
            <button type="button" className={view === "list" ? "is-active" : ""} onClick={() => setView("list")} aria-pressed={view === "list"}>목록</button>
          </div>
        </div>

        {view === "calendar" ? (
          <BookClubCalendar clubs={clubs} />
        ) : (
          <>
            {sorted.length > 0 && (
              <div className="qb-toolbar">
                <select
                  className="qb-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as BoardSort)}
                  aria-label="정렬"
                >
                  {BOARD_SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {sorted.length === 0 ? (
              <div className="qb-empty">지금은 신청 가능한 북클럽이 없어요. 곧 새 일정이 열려요.</div>
            ) : (
              <div className="qb-grid">
                {sorted.map((club, i) => (
                  <ClubBoardCard key={club.id} club={club} index={i} />
                ))}
              </div>
            )}
          </>
        )}

        {pastClubs.length > 0 && (
          <section className="qb-past-section">
            <h2 className="qb-past-title">다시 함께 읽어요</h2>
            <div className="qb-past-list">
              {pastClubs.map((p) => (
                <div className="qb-past-row" key={p.id}>
                  <div className="qb-past-date-col">
                    <div className="qb-past-date">{formatFullDateWeekday(p.startsAt)}</div>
                    <div className="qb-past-place">{p.place}</div>
                  </div>
                  <div className="qb-past-content-col">
                    <span className="qb-past-book">『{p.bookTitle}』</span>
                    {p.bookAuthor && <span className="qb-past-author">{p.bookAuthor}</span>}
                    {p.note && <p className="qb-past-note">{p.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
