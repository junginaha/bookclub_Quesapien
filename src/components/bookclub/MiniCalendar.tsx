"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { dateKey as seoulDateKey, formatMonthDay, formatWeekdayFull } from "@/lib/bookclub/selectors";

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

/** "2026-09-19" → {year, month0, day} — new Date() 파싱 없이 문자열만 쪼갠다
 * (품질 게이트: 날짜 계산은 Asia/Seoul 기준 고정, 브라우저 로컬 타임존 파싱 금지). */
function splitDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return { year: y, month0: m - 1, day: d };
}

/**
 * 첫 주 빈 셀 = 그 달 1일의 요일. new Date(year, month0, 1).getDay()는 문자열
 * 파싱이 아니라 순수 숫자 연산(로컬/UTC 무관하게 같은 결과)이라 안전하다.
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
  // "오늘"은 항상 Asia/Seoul 기준 날짜 문자열로 고정한다(브라우저 로컬
  // 타임존의 new Date() 비교가 아니라 "YYYY-MM-DD" 문자열 비교만 쓴다).
  const todayKey = useMemo(() => seoulDateKey(new Date()), []);

  const nearest = useMemo(() => {
    if (initialDateKey) return null;
    const upcoming = clubs
      .filter((c) => !c.isPast)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    const future = upcoming.find((c) => c.dateKey >= todayKey);
    return future ?? upcoming[0] ?? null;
  }, [clubs, initialDateKey, todayKey]);

  const startKey = initialDateKey ?? nearest?.dateKey ?? todayKey;
  const startParts = splitDateKey(startKey);
  const [year, setYear] = useState(startParts.year);
  const [month0, setMonth0] = useState(startParts.month0);

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

  const [selectedKey, setSelectedKey] = useState(startKey);

  function selectDate(key: string) {
    setSelectedKey(key);
    onSelectDate(key);
  }

  function goMonth(delta: number) {
    const d = new Date(year, month0 + delta, 1);
    setYear(d.getFullYear());
    setMonth0(d.getMonth());
  }

  function jumpToNearest() {
    if (!nearestOverall) return;
    const { year: y, month0: m } = splitDateKey(nearestOverall.dateKey);
    setYear(y);
    setMonth0(m);
    selectDate(nearestOverall.dateKey);
  }

  const cells = buildMonthGrid(year, month0);
  const gridRef = useRef<HTMLDivElement>(null);

  // 1024px 미만(상단 가로 스트립)에서 쓰는, 모임 있는 날짜만 뽑은 정렬 목록.
  const stripDates = useMemo(
    () => [...clubs].sort((a, b) => a.dateKey.localeCompare(b.dateKey)),
    [clubs]
  );

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
      {/* 1024px 이상: 월별 캘린더(sticky, .qd-side가 담당). 그 미만은 아래
          가로 스트립으로 대체 — 둘 다 항상 DOM에 있고 CSS 미디어쿼리로만
          전환한다(레이아웃 시프트 없음, 품질 게이트). */}
      <div className="qc-cal-full">
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
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;
            return (
              <button
                key={key}
                type="button"
                data-day={day}
                className={`qc-cal-date${isToday ? " is-today" : ""}${isSelected ? " is-selected" : ""}`}
                disabled={!has}
                tabIndex={has && enabledDays[0] === day ? 0 : -1}
                onClick={() => has && selectDate(key)}
                aria-label={`${month0 + 1}월 ${day}일${isToday ? " · 오늘" : ""}${has ? " — 모임 있음" : ""}`}
                aria-current={isToday ? "date" : undefined}
              >
                {day}
                {has && <span className="qc-cal-dot" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1024px 미만: 모임 있는 날짜만 가로 스크롤 칩으로 — 월 넘기기 없이 바로 이동. */}
      <div className="qc-cal-strip" role="list" aria-label="모임 날짜 목록">
        {stripDates.map((c) => {
          const isToday = c.dateKey === todayKey;
          const isSelected = c.dateKey === selectedKey;
          return (
            <button
              key={c.slug}
              type="button"
              role="listitem"
              className={`qc-cal-chip${isSelected ? " is-selected" : ""}${isToday ? " is-today" : ""}${c.isPast ? " is-past" : ""}`}
              onClick={() => selectDate(c.dateKey)}
            >
              {formatMonthDay(`${c.dateKey}T00:00:00+09:00`)}({formatWeekdayFull(`${c.dateKey}T00:00:00+09:00`).slice(0, 1)})
              <span className="qc-cal-chip-dot" aria-hidden="true" />
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
