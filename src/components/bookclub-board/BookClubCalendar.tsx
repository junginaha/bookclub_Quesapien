"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import type { BoardCardData } from "./types";
import { formatFullDateWeekday, formatTimeOfDay } from "@/lib/bookclubBoard";
import BookClubReservation from "@/components/bookclub/BookClubReservation";

const SEOUL_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function seoulDateKey(input: string | Date): string {
  const values: Record<string, string> = {};
  for (const part of SEOUL_DATE_FORMATTER.formatToParts(new Date(input))) {
    values[part.type] = part.value;
  }
  return `${values.year}-${values.month}-${values.day}`;
}

function parseDateKey(key: string): { year: number; month: number; day: number } {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month, day };
}

function makeDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function statusLabel(club: BoardCardData): string {
  if (club.status === "closing") return club.left > 0 ? `${club.left}자리 남음` : "마감 임박";
  if (club.status === "full") return "대기 신청";
  if (club.status === "closed") return "신청 마감";
  return "신청 가능";
}

export default function BookClubCalendar({ clubs }: { clubs: BoardCardData[] }) {
  const chronological = useMemo(
    () => [...clubs].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    [clubs]
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, BoardCardData[]>();
    for (const club of chronological) {
      const key = seoulDateKey(club.startsAt);
      map.set(key, [...(map.get(key) ?? []), club]);
    }
    return map;
  }, [chronological]);

  const initialKey = chronological[0] ? seoulDateKey(chronological[0].startsAt) : seoulDateKey(new Date());
  const initialDate = parseDateKey(initialKey);
  const [monthCursor, setMonthCursor] = useState({ year: initialDate.year, month: initialDate.month });
  const [selectedKey, setSelectedKey] = useState(chronological[0] ? initialKey : "");

  const days = useMemo(() => {
    const firstWeekday = new Date(Date.UTC(monthCursor.year, monthCursor.month - 1, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(monthCursor.year, monthCursor.month, 0)).getUTCDate();
    return Array.from({ length: 42 }, (_, index) => {
      const day = index - firstWeekday + 1;
      return {
        day,
        key: day >= 1 && day <= daysInMonth ? makeDateKey(monthCursor.year, monthCursor.month, day) : "",
        inMonth: day >= 1 && day <= daysInMonth,
      };
    });
  }, [monthCursor]);

  const selectedEvents = selectedKey ? eventsByDate.get(selectedKey) ?? [] : [];

  const moveMonth = (amount: number) => {
    const next = new Date(Date.UTC(monthCursor.year, monthCursor.month - 1 + amount, 1));
    const year = next.getUTCFullYear();
    const month = next.getUTCMonth() + 1;
    setMonthCursor({ year, month });

    const prefix = `${year}-${String(month).padStart(2, "0")}-`;
    const firstEvent = [...eventsByDate.keys()].filter((key) => key.startsWith(prefix)).sort()[0];
    setSelectedKey(firstEvent ?? "");
  };

  return (
    <div className="qb-calendar-layout">
      <section className="qb-calendar-card" aria-label={`${monthCursor.year}년 ${monthCursor.month}월 북클럽 달력`}>
        <div className="qb-calendar-month-row">
          <button type="button" className="qb-calendar-nav" onClick={() => moveMonth(-1)} aria-label="이전 달">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <h2>{monthCursor.year}년 {monthCursor.month}월</h2>
          <button type="button" className="qb-calendar-nav" onClick={() => moveMonth(1)} aria-label="다음 달">
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="qb-calendar-weekdays" aria-hidden="true">
          {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
        </div>

        <div className="qb-calendar-grid">
          {days.map((cell, index) => {
            if (!cell.inMonth) return <span className="qb-calendar-day is-outside" key={`outside-${index}`} aria-hidden="true" />;
            const events = eventsByDate.get(cell.key) ?? [];
            const hasEvent = events.length > 0;
            const isSelected = cell.key === selectedKey;
            if (!hasEvent) {
              return <span className="qb-calendar-day" key={cell.key}><span className="qb-calendar-day-number">{cell.day}</span></span>;
            }
            return (
              <button
                type="button"
                className={`qb-calendar-day has-event${isSelected ? " is-selected" : ""}`}
                key={cell.key}
                onClick={() => setSelectedKey(cell.key)}
                aria-pressed={isSelected}
                aria-label={`${monthCursor.month}월 ${cell.day}일, ${events.map((event) => event.bookTitle).join(", ")}`}
              >
                <span className="qb-calendar-day-number">{cell.day}</span>
                <span className="qb-calendar-event-dot" aria-hidden="true" />
              </button>
            );
          })}
        </div>
        <p className="qb-calendar-caption"><span aria-hidden="true" />색이 표시된 날에 북클럽이 있어요.</p>
      </section>

      <section className="qb-calendar-detail" aria-live="polite" aria-label="선택한 날짜의 북클럽">
        {selectedEvents.length > 0 ? (
          <>
            <p className="qb-calendar-eyebrow">선택한 날짜</p>
            <h2>{formatFullDateWeekday(selectedEvents[0].startsAt)}</h2>
            <div className="qb-calendar-events">
              {selectedEvents.map((club) => (
                <article className="qb-calendar-event" key={club.id}>
                  <div className="qb-calendar-status-row">
                    <span className="qb-calendar-status">{statusLabel(club)}</span>
                    <span>{formatTimeOfDay(club.startsAt)}</span>
                  </div>
                  <h3>{club.bookTitle}</h3>
                  {club.bookAuthor && <p className="qb-calendar-author">{club.bookAuthor}</p>}
                  <div className="qb-calendar-meta"><CalendarDays size={16} aria-hidden="true" /><span>{formatFullDateWeekday(club.startsAt)}</span></div>
                  <div className="qb-calendar-meta"><MapPin size={16} aria-hidden="true" /><span>{club.place}</span></div>
                  <div className="qb-calendar-actions">
                    <BookClubReservation
                      event={{
                        slug: club.slug,
                        bookTitle: club.bookTitle,
                        startsAt: club.startsAt,
                        place: club.place,
                        status: club.status,
                        nameExample: club.nameExample,
                      }}
                      className="qb-calendar-action qb-calendar-action--primary"
                      label={club.status === "full" ? "대기 예약하기" : "참여 예약하기"}
                      disabled={club.status === "closed" || club.status === "done"}
                    />
                    <Link className="qb-calendar-detail-link" href={`/bookclub/${club.slug}`}>소개 자세히 보기</Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="qb-calendar-no-event">
            <CalendarDays size={22} aria-hidden="true" />
            <p>이달에 예정된 북클럽이 없어요.</p>
            <span>다음 달 일정을 확인해 보세요.</span>
          </div>
        )}
      </section>
    </div>
  );
}
