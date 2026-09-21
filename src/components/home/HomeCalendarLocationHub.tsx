"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { BookClubSession } from "@/lib/bookclub/types";
import { dateKey, feeLabel, formatMonthDay, formatTimeRange, formatWeekdayFull, getStatus } from "@/lib/bookclub/selectors";
import styles from "./home-tools.module.css";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
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
  const sorted = useMemo(() => [...sessions].filter(s => Number.isFinite(Date.parse(s.startsAt)) && Number.isFinite(Date.parse(s.endsAt))).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)), [sessions]);
  const first = sorted.find(s => getStatus(s) !== "past") ?? sorted[sorted.length - 1];
  const startKey = first ? dateKey(first.startsAt) : dateKey(new Date());
  const [month, setMonth] = useState(startKey.slice(0, 7));
  const [selection, setSelection] = useState(startKey);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const locatingRef = useRef(false);
  const [year, monthNumber] = month.split("-").map(Number);
  const inMonth = sorted.filter(s => dateKey(s.startsAt).startsWith(month));
  const selectedKey = inMonth.some(s => dateKey(s.startsAt) === selection) ? selection : inMonth[0] ? dateKey(inMonth[0].startsAt) : "";
  const selected = inMonth.filter(s => dateKey(s.startsAt) === selectedKey);
  const eventDays = new Set(inMonth.map(s => dateKey(s.startsAt)));
  const Heading = headingLevel === 1 ? "h1" : "h2";

  function moveMonth(delta: number) {
    const next = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
    setMonth(`${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}`);
    setSelection("");
  }

  function locate() {
    if (locatingRef.current) return;
    if (!navigator.geolocation) { setLocationMessage("위치를 사용할 수 없습니다. 장소 옆 지도를 이용해 주세요."); return; }
    locatingRef.current = true;
    setLocating(true);
    setLocationMessage("");
    // Coordinates stay in memory and are requested only after an explicit click.
    navigator.geolocation.getCurrentPosition(position => {
      setOrigin({ lat: position.coords.latitude, lng: position.coords.longitude });
      locatingRef.current = false;
      setLocating(false);
    }, error => {
      setLocationMessage(error.code === 1 ? "위치 권한이 꺼져 있습니다. 지도는 권한 없이 볼 수 있습니다." : "위치를 확인하지 못했습니다. 다시 시도해 주세요.");
      locatingRef.current = false;
      setLocating(false);
    }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 });
  }

  return (
    <section className={styles.section} id="calendar" aria-labelledby="calendar-title">
      <div className={styles.sectionHead}>
        <Heading id="calendar-title">모임 일정</Heading>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={locate} disabled={locating}>{locating ? "위치 확인 중…" : "내 위치에서 거리 보기"}</button>
          {origin && <button type="button" className={styles.textButton} onClick={() => { setOrigin(null); setLocationMessage(""); }}>위치 지우기</button>}
        </div>
      </div>
      {locationMessage && <p role="status" className={styles.notice}>{locationMessage}</p>}
      <div className={styles.calendarLayout}>
        <div className={styles.calendar}>
          <div className={styles.toolbar}>
            <strong aria-live="polite">{year}년 {monthNumber}월</strong>
            <div className={styles.actions}>
              <button type="button" className={styles.iconButton} onClick={() => moveMonth(-1)} aria-label="이전 달">←</button>
              <button type="button" className={styles.iconButton} onClick={() => moveMonth(1)} aria-label="다음 달">→</button>
            </div>
          </div>
          <table className={styles.calendarTable}>
            <caption className={styles.srOnly}>{year}년 {monthNumber}월 북클럽 일정</caption>
            <thead><tr>{DAYS.map(day => <th key={day} scope="col">{day}</th>)}</tr></thead>
            <tbody>{monthDays(year, monthNumber - 1).map((week, index) => <tr key={index}>{week.map((day, column) => {
              const key = day ? `${month}-${pad(day)}` : "";
              const hasEvent = eventDays.has(key);
              return <td key={column}>{day && <button type="button" className={styles.day} disabled={!hasEvent} aria-pressed={key === selectedKey} aria-label={`${monthNumber}월 ${day}일${hasEvent ? " · 모임 있음" : " · 모임 없음"}`} onClick={() => setSelection(key)}>{day}{hasEvent && <span className={styles.dot} aria-hidden="true" />}</button>}</td>;
            })}</tr>)}</tbody>
          </table>
          <p className={styles.hint}>점이 있는 날짜를 선택하세요.</p>
        </div>
        <div className={styles.meetings} aria-live="polite" aria-atomic="false">
          {selected.length === 0 ? <div className={styles.empty}>
            <p>{sorted.length ? "이달에는 등록된 모임이 없습니다." : "아직 등록된 모임이 없습니다."}</p>
            {first && <button type="button" className={styles.secondary} onClick={() => { setMonth(startKey.slice(0, 7)); setSelection(startKey); }}>등록된 일정 보기</button>}
          </div> : selected.map(session => {
            const status = getStatus(session);
            const canLocate = Number.isFinite(session.venue.lat) && Number.isFinite(session.venue.lng) && Math.abs(session.venue.lat) <= 90 && Math.abs(session.venue.lng) <= 180;
            const km = origin && canLocate ? straightLineKm(origin, session.venue) : null;
            const venueText = session.venue.address || session.venue.name;
            return <article className={styles.meeting} key={session.slug}>
              <p className={styles.status}>{status === "past" ? "지난 모임" : status === "full" ? "정원 마감" : status === "closed" ? "신청 마감" : "모집 중"}</p>
              <h3>{session.bookTitle}</h3>
              <p className={styles.muted}>{session.author}</p>
              <dl className={styles.facts}>
                <div><dt>일시</dt><dd>{formatMonthDay(session.startsAt)} {formatWeekdayFull(session.startsAt)}<br />{formatTimeRange(session.startsAt, session.endsAt)}</dd></div>
                <div><dt>장소</dt><dd>{session.venue.name || "장소 확인 중"}{session.venue.address && <small>{session.venue.address}</small>}{km !== null && <small>직선거리 약 {km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`}</small>}</dd></div>
                <div><dt>참가비</dt><dd>{feeLabel(session.fee)}</dd></div>
              </dl>
              <div className={styles.actions}>
                <Link className={styles.primary} href={`/bookclub/${session.slug}`}>{status === "open" ? "참여 신청" : "모임 상세 보기"}</Link>
                {venueText && <a className={styles.secondary} href={`https://map.kakao.com/?q=${encodeURIComponent(venueText)}`} target="_blank" rel="noopener noreferrer">지도 보기</a>}
              </div>
            </article>;
          })}
        </div>
      </div>
    </section>
  );
}
