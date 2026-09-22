"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { BookClubSession } from "@/lib/bookclub/types";
import { dateKey, formatMonthDay, formatTimeRange, formatWeekdayFull, getStatus } from "@/lib/bookclub/selectors";
import styles from "./linen-calendar.module.css";

const DAYS = [
  { en: "Sun", ko: "일요일" }, { en: "Mon", ko: "월요일" },
  { en: "Tue", ko: "화요일" }, { en: "Wed", ko: "수요일" },
  { en: "Thu", ko: "목요일" }, { en: "Fri", ko: "금요일" },
  { en: "Sat", ko: "토요일" },
];
const pad = (value: number) => String(value).padStart(2, "0");

export function monthDays(year: number, month0: number): (number | null)[][] {
  const offset = new Date(Date.UTC(year, month0, 1)).getUTCDay();
  const count = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  const cells: (number | null)[] = Array(Math.ceil((offset + count) / 7) * 7).fill(null);
  for (let day = 1; day <= count; day++) cells[offset + day - 1] = day;
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
}

export function straightLineKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const rad = (value: number) => value * Math.PI / 180;
  const a = Math.sin(rad(to.lat - from.lat) / 2) ** 2 + Math.cos(rad(from.lat)) * Math.cos(rad(to.lat)) * Math.sin(rad(to.lng - from.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))));
}

export default function HomeCalendarLocationHub({ sessions, headingLevel = 2 }: {
  sessions: BookClubSession[];
  headingLevel?: 1 | 2;
}) {
  const router = useRouter();
  const sorted = useMemo(() => [...sessions]
    .filter(s => Number.isFinite(Date.parse(s.startsAt)) && Number.isFinite(Date.parse(s.endsAt)))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)), [sessions]);
  const first = sorted.find(s => getStatus(s) !== "past") ?? sorted[sorted.length - 1];
  const startKey = first ? dateKey(first.startsAt) : dateKey(new Date());
  const [month, setMonth] = useState(startKey.slice(0, 7));
  const [selection, setSelection] = useState(startKey);
  const [year, monthNumber] = month.split("-").map(Number);
  const inMonth = sorted.filter(s => dateKey(s.startsAt).startsWith(month));
  const selectedKey = inMonth.some(s => dateKey(s.startsAt) === selection)
    ? selection : inMonth[0] ? dateKey(inMonth[0].startsAt) : "";
  const selected = inMonth.filter(s => dateKey(s.startsAt) === selectedKey);
  const eventDays = new Set(inMonth.map(s => dateKey(s.startsAt)));
  const todayKey = dateKey(new Date());
  const Heading = headingLevel === 1 ? "h1" : "h2";
  function moveMonth(delta: number) {
    const next = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
    setMonth(`${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}`);
    setSelection("");
  }

  return (
    <section className={styles.section} id="calendar" aria-labelledby="calendar-title" data-calendar-design="linen-20260922">
      <div className={styles.layout}>
        <div className={styles.fabric}>
          <div className={styles.masthead}>
            <Heading id="calendar-title" className={styles.script}><span lang="en">Calendar</span><span className={styles.srOnly}> · 북클럽 모임 일정</span></Heading>
            <span className={styles.year}>{year}</span>
          </div>
          <div className={styles.toolbar}>
            <button type="button" className={styles.monthButton} onClick={() => moveMonth(-1)} aria-label="이전 달">←</button>
            <div className={styles.monthLabel} aria-live="polite" aria-atomic="true" aria-label={`${year}년 ${monthNumber}월`}>
              <span className={styles.monthNumber} aria-hidden="true">{pad(monthNumber)}</span>
              <span className={styles.srOnly}>{year}년 {monthNumber}월</span>
            </div>
            <button type="button" className={styles.monthButton} onClick={() => moveMonth(1)} aria-label="다음 달">→</button>
          </div>
          <table className={styles.calendarTable}>
            <caption className={styles.srOnly}>{year}년 {monthNumber}월 북클럽 일정</caption>
            <thead><tr>{DAYS.map(day => <th key={day.en} scope="col" aria-label={day.ko}><span lang="en">{day.en}</span></th>)}</tr></thead>
            <tbody>{monthDays(year, monthNumber - 1).map((week, index) => <tr key={index}>{week.map((day, column) => {
              const key = day ? `${month}-${pad(day)}` : "";
              const hasEvent = eventDays.has(key);
              return <td key={column}>{day && <button
                type="button" className={styles.day} disabled={!hasEvent}
                aria-pressed={key === selectedKey} aria-current={key === todayKey ? "date" : undefined}
                aria-label={`${monthNumber}월 ${day}일${key === todayKey ? " · 오늘" : ""}${hasEvent ? " · 모임 있음" : " · 모임 없음"}`}
                onClick={() => setSelection(key)}
              ><span>{day}</span>{hasEvent && <span className={styles.dot} aria-hidden="true" />}</button>}</td>;
            })}</tr>)}</tbody>
          </table>
          <p className={styles.legend}><span className={styles.legendDot} aria-hidden="true" />모임이 있는 날</p>
        </div>
        <div className={styles.details}>
          <div className={styles.detailHead}>
            <p className={styles.detailLabel}>함께 읽는 날</p>
          </div>
          <div className={styles.meetings} aria-live="polite" aria-atomic="false">
            {selected.length === 0 ? <div className={styles.empty}>
              <p>{sorted.length ? "이달에는 등록된 모임이 없습니다." : "다음 모임을 준비하고 있습니다."}</p>
              {first && <button type="button" className={styles.secondary} onClick={() => { setMonth(startKey.slice(0, 7)); setSelection(startKey); }}>등록된 일정 보기</button>}
            </div> : selected.map(session => {
              const status = getStatus(session);
              const venueText = session.venue.address || session.venue.name;
              return <article
                className={styles.meeting}
                key={session.slug}
                role="link"
                tabIndex={0}
                aria-label={session.bookTitle + " 북클럽 상세 보기"}
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest("a,button")) return;
                  router.push("/bookclub/" + session.slug);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") router.push("/bookclub/" + session.slug);
                }}
              >
                <p className={styles.status}>{status === "past" ? "지난 모임" : status === "full" ? "정원 마감" : status === "closed" ? "신청 마감" : "모집 중"}</p>
                <h3>{session.bookTitle}</h3>
                <p className={styles.author}>{session.author}</p>
                <dl className={styles.facts}>
                  <div><dt>일시</dt><dd>{formatMonthDay(session.startsAt)} {formatWeekdayFull(session.startsAt)}<br />{formatTimeRange(session.startsAt, session.endsAt)}</dd></div>
                </dl>
                <div className={styles.actions}>
                  <Link className={styles.primary} href={`/bookclub/${session.slug}`}>{status === "open" ? "참여 신청" : "모임 상세 보기"}</Link>
                  {venueText && <a className={styles.secondary} href={`https://map.kakao.com/?q=${encodeURIComponent(venueText)}`} target="_blank" rel="noopener noreferrer">지도 보기<span className={styles.srOnly}> · 새 창</span></a>}
                </div>
              </article>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
