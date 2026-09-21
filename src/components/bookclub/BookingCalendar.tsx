"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { BookClubSession } from "@/lib/bookclub/types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const FULL_WEEKDAYS = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function sessionDateKey(session: BookClubSession) {
  return session.startsAt.slice(0, 10);
}

function splitDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month0: month - 1, day };
}

function buildMonthGrid(year: number, month0: number) {
  const firstDay = new Date(year, month0, 1).getDay();
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  return [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ] as Array<number | null>;
}

function isPastSession(session: BookClubSession) {
  return new Date(session.endsAt).getTime() < Date.now();
}

function formatWon(amount: number) {
  return amount === 0 ? "무료" : `${amount.toLocaleString("ko-KR")}원`;
}

function formatTime(iso: string) {
  const time = iso.slice(11, 16);
  const [hourText, minute] = time.split(":");
  const hour = Number(hourText);
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour % 12 || 12;
  return `${period} ${displayHour}:${minute}`;
}

function formatSelectedDate(key: string) {
  const { year, month0, day } = splitDateKey(key);
  const weekday = new Date(year, month0, day).getDay();
  return {
    label: `${month0 + 1}월 ${day}일`,
    weekday: FULL_WEEKDAYS[weekday],
  };
}

export default function BookingCalendar({ sessions }: { sessions: BookClubSession[] }) {
  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [sessions]
  );

  const upcoming = useMemo(
    () => sortedSessions.filter((session) => !isPastSession(session)),
    [sortedSessions]
  );

  const past = useMemo(
    () =>
      sortedSessions
        .filter(isPastSession)
        .sort((a, b) => b.startsAt.localeCompare(a.startsAt)),
    [sortedSessions]
  );

  const initialSession = upcoming[0] ?? past[0] ?? null;
  const initialKey = initialSession ? sessionDateKey(initialSession) : "2026-10-01";
  const initialParts = splitDateKey(initialKey);

  const [year, setYear] = useState(initialParts.year);
  const [month0, setMonth0] = useState(initialParts.month0);
  const [selectedKey, setSelectedKey] = useState(initialKey);

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, BookClubSession[]>();
    for (const session of sortedSessions) {
      const key = sessionDateKey(session);
      const current = map.get(key) ?? [];
      current.push(session);
      map.set(key, current);
    }
    return map;
  }, [sortedSessions]);

  const cells = buildMonthGrid(year, month0);
  const selectedSessions = sessionsByDate.get(selectedKey) ?? [];
  const selectedDate = formatSelectedDate(selectedKey);

  function goMonth(delta: number) {
    const next = new Date(year, month0 + delta, 1);
    setYear(next.getFullYear());
    setMonth0(next.getMonth());
  }

  function selectDay(day: number) {
    const key = `${year}-${pad2(month0 + 1)}-${pad2(day)}`;
    if (!sessionsByDate.has(key)) return;
    setSelectedKey(key);
  }

  return (
    <main className="qbook-shell">
      <section className="qbook-hero" aria-labelledby="qbook-title">
        <p className="qbook-kicker">QUESTIONING PEOPLE · BOOKING</p>
        <h1 id="qbook-title">
          날짜를 고르면,
          <br />
          대화가 시작됩니다.
        </h1>
        <p className="qbook-lede">
          캘린더에서 원하는 날짜를 선택하세요. 책, 시간, 장소, 참가비를 확인하고
          기존 신청 페이지에서 바로 참여할 수 있습니다.
        </p>
      </section>

      <section className="qbook-booking" aria-label="북클럽 예약 캘린더">
        <div className="qbook-calendar">
          <div className="qbook-calendar-head">
            <div>
              <p className="qbook-kicker">BOOKING CALENDAR</p>
              <h2>{year}년 {month0 + 1}월</h2>
            </div>
            <div className="qbook-arrows">
              <button type="button" onClick={() => goMonth(-1)} aria-label="이전 달">←</button>
              <button type="button" onClick={() => goMonth(1)} aria-label="다음 달">→</button>
            </div>
          </div>

          <div className="qbook-week" aria-hidden="true">
            {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
          </div>

          <div className="qbook-grid" role="grid" aria-label={`${year}년 ${month0 + 1}월 모임 일정`}>
            {cells.map((day, index) => {
              if (day === null) {
                return <span className="qbook-blank" key={`blank-${index}`} aria-hidden="true" />;
              }

              const key = `${year}-${pad2(month0 + 1)}-${pad2(day)}`;
              const hasMeeting = sessionsByDate.has(key);
              const isActive = key === selectedKey;

              return (
                <button
                  key={key}
                  type="button"
                  className={`qbook-day${hasMeeting ? " has" : ""}${isActive ? " active" : ""}`}
                  onClick={() => selectDay(day)}
                  disabled={!hasMeeting}
                  aria-label={`${month0 + 1}월 ${day}일${hasMeeting ? " · 모임 있음" : ""}`}
                  aria-pressed={isActive}
                >
                  <span>{day}</span>
                  {hasMeeting && <i className="qbook-dot" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <div className="qbook-legend" aria-label="캘린더 범례">
            <span><i className="is-selected" />선택한 날짜</span>
            <span><i className="has-meeting" />모임이 있는 날</span>
          </div>
        </div>

        <aside className="qbook-side" aria-label="선택한 날짜의 모임">
          <p className="qbook-kicker">SELECTED DATE</p>
          <div className="qbook-selected-date">
            {selectedDate.label}
            <small>{selectedDate.weekday}</small>
          </div>

          <div className="qbook-selected-list">
            {selectedSessions.length === 0 ? (
              <div className="qbook-empty-card">
                이 날짜에는 등록된 모임이 없습니다.
                <small>보라색 점이 있는 날짜를 선택해 주세요.</small>
              </div>
            ) : (
              selectedSessions.map((session) => {
                const pastSession = isPastSession(session);
                const seatsLeft = Math.max(0, session.capacity - session.reserved);

                return (
                  <article className="qbook-card" key={session.slug}>
                    <div className="qbook-card-top">
                      <span className="qbook-state">
                        {pastSession
                          ? "지난 모임"
                          : seatsLeft === 0
                            ? "정원 마감"
                            : `정원 ${session.capacity}명 · ${seatsLeft}자리 남음`}
                      </span>
                      <span className="qbook-fee">{formatWon(session.fee)}</span>
                    </div>

                    <h3>{session.bookTitle}</h3>
                    <p className="qbook-author">{session.author}</p>

                    <dl>
                      <div>
                        <dt>시간</dt>
                        <dd>{formatTime(session.startsAt)} – {formatTime(session.endsAt)}</dd>
                      </div>
                      <div>
                        <dt>장소</dt>
                        <dd>{session.venue.name}</dd>
                      </div>
                    </dl>

                    <Link href={`/bookclub/${session.slug}`} className="qbook-cta">
                      {pastSession ? "지난 모임 보기" : "예약하기"}
                    </Link>
                  </article>
                );
              })
            )}
          </div>
        </aside>
      </section>

      <section className="qbook-steps" aria-label="예약 순서">
        <div><b>1</b>날짜 선택</div>
        <i aria-hidden="true" />
        <div><b>2</b>모임 확인</div>
        <i aria-hidden="true" />
        <div><b>3</b>예약</div>
      </section>

      <section className="qbook-past" aria-labelledby="qbook-past-title">
        <div className="qbook-past-head">
          <h2 id="qbook-past-title">지난 대화</h2>
          <Link href="/archive">모든 기록 보기 →</Link>
        </div>

        <div className="qbook-past-grid">
          {past.slice(0, 3).map((session) => {
            const key = sessionDateKey(session);
            const { month0: pastMonth0, day } = splitDateKey(key);
            return (
              <Link href={`/bookclub/${session.slug}`} className="qbook-past-card" key={session.slug}>
                <span>{pastMonth0 + 1}월 {day}일</span>
                <strong>{session.bookTitle}</strong>
                <small>{session.author}</small>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
