"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";

export interface CalendarClub {
  slug: string;
  dateKey: string; // "2026-09-19"
  isPast: boolean;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function monthKey(year: number, month0: number) {
  return `${year}-${pad2(month0 + 1)}`;
}

/**
 * 첫 주 빈 셀 = 그 달 1일의 요일(JS Date 로컬 getDay(), 일=0)을 그대로 쓴다 —
 * 수동 계산 없이 실제 Date 객체로 구하므로 "2026-09-01=화요일" 같은 값이 항상 맞는다.
 */
function buildMonthGrid(year: number, month0: number) {
  const firstDay = new Date(year, month0, 1).getDay();
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function MiniCalendar({
  clubs,
  initialDateKey,
  onSelectDate,
}: {
  clubs: CalendarClub[];
  initialDateKey?: string;
  onSelectDate: (dateKey: string) => void;
}) {
  const initial = initialDateKey ? new Date(`${initialDateKey}T00:00:00`) : new Date();
  const nearest = useMemo(() => {
    if (initialDateKey) return null;
    const now = Date.now();
    const upcoming = clubs
      .filter((c) => !c.isPast)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    const future = upcoming.find((c) => new Date(`${c.dateKey}T00:00:00`).getTime() >= now);
    return future ?? upcoming[0] ?? null;
  }, [clubs, initialDateKey]);

  const startDate = nearest ? new Date(`${nearest.dateKey}T00:00:00`) : initial;
  const [year, setYear] = useState(startDate.getFullYear());
  const [month0, setMonth0] = useState(startDate.getMonth());

  const clubsByDate = useMemo(() => {
    const map = new Map<string, CalendarClub[]>();
    for (const c of clubs) {
      const list = map.get(c.dateKey) ?? [];
      list.push(c);
      map.set(c.dateKey, list);
    }
    return map;
  }, [clubs]);

  const thisMonthKey = monthKey(year, month0);
  const hasAnyThisMonth = useMemo(
    () => [...clubsByDate.keys()].some((k) => k.startsWith(thisMonthKey)),
    [clubsByDate, thisMonthKey]
  );

  const nearestOverall = useMemo(() => {
    const sorted = [...clubs].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    return sorted[0] ?? null;
  }, [clubs]);

  function goMonth(delta: number) {
    const d = new Date(year, month0 + delta, 1);
    setYear(d.getFullYear());
    setMonth0(d.getMonth());
  }

  function jumpToNearest() {
    if (!nearestOverall) return;
    const d = new Date(`${nearestOverall.dateKey}T00:00:00`);
    setYear(d.getFullYear());
    setMonth0(d.getMonth());
    onSelectDate(nearestOverall.dateKey);
  }

  const cells = buildMonthGrid(year, month0);
  const gridRef = useRef<HTMLDivElement>(null);

  const enabledDays = useMemo(
    () => cells.filter((d): d is number => d !== null && (clubsByDate.get(`${year}-${pad2(month0 + 1)}-${pad2(d)}`)?.length ?? 0) > 0),
    [cells, clubsByDate, year, month0]
  );

  function focusDay(day: number) {
    const el = gridRef.current?.querySelector<HTMLButtonElement>(`button[data-day="${day}"]`);
    el?.focus();
  }

  // 화살표로 "모임 있는 날짜"끼리 이동 — 빈 날짜는 어차피 선택할 수 없으므로
  // 하나씩 건너뛰는 것보다 실질적으로 이동 가능한 날짜 사이를 오가게 한다.
  function handleGridKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (enabledDays.length === 0) return;
    const target = e.target as HTMLElement;
    const currentDay = Number(target.dataset.day);
    const idx = enabledDays.indexOf(currentDay);

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = idx === -1 ? enabledDays[0] : enabledDays[(idx + 1) % enabledDays.length];
      focusDay(next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = idx === -1 ? enabledDays[enabledDays.length - 1] : enabledDays[(idx - 1 + enabledDays.length) % enabledDays.length];
      focusDay(prev);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusDay(enabledDays[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      focusDay(enabledDays[enabledDays.length - 1]);
    }
  }

  return (
    <div className="qc-cal">
      <div className="qc-cal-head">
        <button type="button" className="qc-cal-nav" onClick={() => goMonth(-1)} aria-label="이전 달">‹</button>
        <span className="qc-cal-title">{year}년 {month0 + 1}월</span>
        <button type="button" className="qc-cal-nav" onClick={() => goMonth(1)} aria-label="다음 달">›</button>
      </div>

      <div
        className="qc-cal-grid"
        role="grid"
        aria-label={`${year}년 ${month0 + 1}월 모임 일정 — 화살표 키로 모임 있는 날짜 사이를 이동할 수 있어요`}
        ref={gridRef}
        onKeyDown={handleGridKeyDown}
      >
        {WEEKDAYS.map((w) => (
          <span key={w} className="qc-cal-weekday" aria-hidden="true">{w}</span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} className="qc-cal-date is-empty" aria-hidden="true" />;
          const key = `${year}-${pad2(month0 + 1)}-${pad2(day)}`;
          const matches = clubsByDate.get(key) ?? [];
          const has = matches.length > 0;
          return (
            <button
              key={key}
              type="button"
              data-day={day}
              className="qc-cal-date"
              disabled={!has}
              tabIndex={has && enabledDays[0] === day ? 0 : -1}
              onClick={() => has && onSelectDate(key)}
              aria-label={`${month0 + 1}월 ${day}일${has ? " — 모임 있음" : ""}`}
            >
              {day}
              {has && <span className="qc-cal-dot" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {!hasAnyThisMonth && (
        <div className="qc-cal-empty-month">
          이 달에는 모임이 없어요.
          {nearestOverall && (
            <>
              {" "}
              <button type="button" className="qc-inline-btn" onClick={jumpToNearest}>가까운 모임 보기</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
