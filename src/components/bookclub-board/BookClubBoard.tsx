"use client";

import { useMemo, useState } from "react";
import "./board.css";
import type { BoardCardData, PastClubData } from "./types";
import ClubBoardCard from "./ClubBoardCard";
import { BOARD_SORTS, type BoardSort, formatFullDateWeekday, sortBoard } from "@/lib/bookclubBoard";

export default function BookClubBoard({
  clubs,
  pastClubs,
}: {
  clubs: BoardCardData[];
  pastClubs: PastClubData[];
}) {
  const [sort, setSort] = useState<BoardSort>("date");

  const sorted = useMemo(() => sortBoard(clubs, sort), [clubs, sort]);

  return (
    <div className="qb-board">
      <div className="qb-board-inner">
        <h1 className="qb-heading">북클럽</h1>

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
