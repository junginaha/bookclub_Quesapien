"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { BookClubSession } from "@/lib/bookclub/types";
import {
  dateKey,
  feeLabel,
  formatMonthDay,
  formatTimeRange,
  formatWeekdayFull,
  getStatus,
  isPast,
  sortByStart,
} from "@/lib/bookclub/selectors";
import { seatsLeft } from "@/lib/bookclub/types";
import styles from "./calendar-booking.module.css";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function splitKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return { y, m0: m - 1, d };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function buildGrid(year: number, month0: number) {
  const first = new Date(year, month0, 1).getDay();
  const last = new Date(year, month0 + 1, 0).getDate();
  return [...Array(first).fill(null), ...Array.from({ length: last }, (_, i) => i + 1)] as Array<number | null>;
}

function stateLabel(session: BookClubSession) {
  const status = getStatus(session);
  if (status === "past") return "지난 모임";
  if (status === "full") return "대기 신청";
  if (status === "closed") return "신청 마감";
  return `${seatsLeft(session)}자리 남음`;
}

export default function CalendarBookingHub({ sessions }: { sessions: BookClubSession[] }) {
  const sorted = useMemo(() => [...sessions].sort(sortByStart), [sessions]);
  const upcoming = useMemo(() => sorted.filter((s) => !isPast(s)), [sorted]);
  const first = upcoming[0] ?? sorted[0];
  const initialKey = first ? dateKey(first.startsAt) : dateKey(new Date());
  const initial = splitKey(initialKey);

  const [year, setYear] = useState(initial.y);
  const [month0, setMonth0] = useState(initial.m0);
  const [selectedKey, setSelectedKey] = useState(initialKey);

  const byDate = useMemo(() => {
    const map = new Map<string, BookClubSession[]>();
    for (const s of sorted) {
      const k = dateKey(s.startsAt);
      const list = map.get(k) ?? [];
      list.push(s);
      map.set(k, list);
    }
    return map;
  }, [sorted]);

  const selected = byDate.get(selectedKey) ?? [];
  const cells = buildGrid(year, month0);
  const monthLabel = `${year}년 ${month0 + 1}월`;

  function moveMonth(delta: number) {
    const d = new Date(year, month0 + delta, 1);
    setYear(d.getFullYear());
    setMonth0(d.getMonth());
  }

  return (
    <section className={styles.wrap} aria-label="북클럽 예약 캘린더">
      <div className={styles.calendarCard}>
        <div className={styles.calendarHead}>
          <div>
            <span className={styles.kicker}>BOOKING CALENDAR</span>
            <h2>{monthLabel}</h2>
          </div>
          <div className={styles.monthNav}>
            <button type="button" onClick={() => moveMonth(-1)} aria-label="이전 달">←</button>
            <button type="button" onClick={() => moveMonth(1)} aria-label="다음 달">→</button>
          </div>
        </div>

        <div className={styles.weekRow}>
          {WEEKDAYS.map((w) => <span key={w}>{w}</span>)}
        </div>

        <div className={styles.grid}>
          {cells.map((day, idx) => {
            if (day === null) return <span className={styles.blank} key={`blank-${idx}`} />;
            const key = `${year}-${pad(month0 + 1)}-${pad(day)}`;
            const events = byDate.get(key) ?? [];
            const active = key === selectedKey;
            const has = events.length > 0;
            return (
              <button
                key={key}
                type="button"
                className={`${styles.day} ${active ? styles.active : ""} ${has ? styles.hasEvent : ""}`}
                onClick={() => has && setSelectedKey(key)}
                disabled={!has}
                aria-pressed={active}
              >
                <span>{day}</span>
                {has && (
                  <span className={styles.dots} aria-hidden="true">
                    {events.slice(0, 3).map((e) => <i key={e.slug} />)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className={styles.legend}>
          <span><i className={styles.blueDot} /> 예약 가능한 모임</span>
          <span><i className={styles.camelDot} /> 지난 모임</span>
        </div>
      </div>

      <aside className={styles.selection}>
        <span className={styles.kicker}>SELECTED DATE</span>
        <div className={styles.selectedDate}>
          {formatMonthDay(`${selectedKey}T00:00:00+09:00`)}
          <small>{formatWeekdayFull(`${selectedKey}T00:00:00+09:00`)}</small>
        </div>

        {selected.length === 0 ? (
          <div className={styles.empty}>
            모임이 있는 날짜를 선택하세요.
            <span>점이 표시된 날짜만 예약할 수 있습니다.</span>
          </div>
        ) : (
          <div className={styles.cards}>
            {selected.map((session) => (
              <article className={styles.eventCard} key={session.slug}>
                <div className={styles.eventTop}>
                  <span className={styles.state}>{stateLabel(session)}</span>
                  <span className={styles.fee}>{feeLabel(session.fee)}</span>
                </div>
                <h3>{session.bookTitle}</h3>
                <p className={styles.author}>{session.author}</p>
                <dl>
                  <div><dt>시간</dt><dd>{formatTimeRange(session.startsAt, session.endsAt)}</dd></div>
                  <div><dt>장소</dt><dd>{session.venue.name}</dd></div>
                </dl>
                <Link href={`/bookclub/${session.slug}`} className={styles.reserve}>
                  {getStatus(session) === "past" ? "기록 보기" : "예약하기"}
                </Link>
              </article>
            ))}
          </div>
        )}
      </aside>
    </section>
  );
}
