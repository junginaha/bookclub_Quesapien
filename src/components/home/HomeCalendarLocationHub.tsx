"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  type BookClubRecord,
  getEventStart,
  remainingSeats,
} from "@/lib/bookclub";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function dateKey(club: BookClubRecord) {
  const start = getEventStart(club);
  if (!start) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(start);
}

function splitKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month0: month - 1, day };
}

function monthCells(year: number, month0: number) {
  const first = new Date(year, month0, 1).getDay();
  const count = new Date(year, month0 + 1, 0).getDate();
  return [
    ...Array.from({ length: first }, () => null),
    ...Array.from({ length: count }, (_, index) => index + 1),
  ] as Array<number | null>;
}

function formatTime(club: BookClubRecord) {
  const start = getEventStart(club);
  if (!start) return club.schedule ?? "시간 확인 중";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "numeric",
    minute: "2-digit",
  }).format(start);
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const rad = (n: number) => (n * Math.PI) / 180;
  const earth = 6371;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return earth * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

export default function HomeCalendarLocationHub({ clubs }: { clubs: BookClubRecord[] }) {
  const dated = useMemo(
    () =>
      clubs
        .map((club) => ({ club, key: dateKey(club), start: getEventStart(club) }))
        .filter((item): item is { club: BookClubRecord; key: string; start: Date } => !!item.key && !!item.start)
        .sort((a, b) => a.start.getTime() - b.start.getTime()),
    [clubs]
  );

  const future = dated.filter((item) => item.start.getTime() >= Date.now());
  const first = future[0] ?? dated[0] ?? null;
  const firstKey = first?.key ?? "2026-10-01";
  const firstParts = splitKey(firstKey);

  const [year, setYear] = useState(firstParts.year);
  const [month0, setMonth0] = useState(firstParts.month0);
  const [selectedKey, setSelectedKey] = useState(firstKey);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationState, setLocationState] =
    useState<"idle" | "loading" | "ready" | "denied">("idle");

  const byDate = useMemo(() => {
    const map = new Map<string, BookClubRecord[]>();
    for (const item of dated) {
      map.set(item.key, [...(map.get(item.key) ?? []), item.club]);
    }
    return map;
  }, [dated]);

  const selected = (byDate.get(selectedKey) ?? [])[0] ?? first?.club ?? null;
  const selectedParts = splitKey(selectedKey);
  const weekday = WEEKDAYS[new Date(selectedParts.year, selectedParts.month0, selectedParts.day).getDay()];
  const cells = monthCells(year, month0);

  useEffect(() => {
    setDistance(null);
    setLocationState("idle");
  }, [selectedKey]);

  function moveMonth(delta: number) {
    const next = new Date(year, month0 + delta, 1);
    setYear(next.getFullYear());
    setMonth0(next.getMonth());
  }

  function selectDay(day: number) {
    const key = `${year}-${pad2(month0 + 1)}-${pad2(day)}`;
    if (byDate.has(key)) setSelectedKey(key);
  }

  function detectLocation() {
    if (!selected || selected.lat == null || selected.lng == null || !navigator.geolocation) {
      setLocationState("denied");
      return;
    }
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDistance(
          distanceKm(
            position.coords.latitude,
            position.coords.longitude,
            selected.lat!,
            selected.lng!
          )
        );
        setLocationState("ready");
      },
      () => setLocationState("denied"),
      { timeout: 7000, maximumAge: 300000 }
    );
  }

  const seats = selected ? remainingSeats(selected) : null;
  const mapHref = selected?.location_url ||
    `https://map.kakao.com/?q=${encodeURIComponent(selected?.location ?? "")}`;

  return (
    <section className="lp-apphub" aria-label="북클럽 일정과 위치">
      <div className="lp-apphub-top">
        <div>
          <span className="lp-apphub-brand">질문하는 사람들</span>
          <h1>북클럽을 날짜와 위치로 찾습니다.</h1>
          <p>일정, 장소, 남은 자리와 신청을 한 화면에서 확인하세요.</p>
        </div>
        <Link href="/bookclub" className="lp-apphub-all">전체 일정 →</Link>
      </div>

      <div className="lp-apphub-frame">
        <div className="lp-apphub-cal">
          <div className="lp-apphub-toolbar">
            <div>
              <span>일정</span>
              <strong>{year}년 {month0 + 1}월</strong>
            </div>
            <div className="lp-apphub-nav">
              <button type="button" onClick={() => moveMonth(-1)} aria-label="이전 달">←</button>
              <button type="button" onClick={() => moveMonth(1)} aria-label="다음 달">→</button>
            </div>
          </div>

          <div className="lp-apphub-week" aria-hidden="true">
            {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
          </div>

          <div className="lp-apphub-grid" role="grid" aria-label="북클럽 일정 캘린더">
            {cells.map((day, index) => {
              if (day === null) return <span key={`blank-${index}`} className="lp-apphub-blank" aria-hidden="true" />;
              const key = `${year}-${pad2(month0 + 1)}-${pad2(day)}`;
              const has = byDate.has(key);
              const active = key === selectedKey;
              return (
                <button
                  key={key}
                  type="button"
                  className={`lp-apphub-day${has ? " has" : ""}${active ? " active" : ""}`}
                  disabled={!has}
                  onClick={() => selectDay(day)}
                  aria-pressed={active}
                >
                  <span>{day}</span>
                  {has && <i aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="lp-apphub-place">
          <div className="lp-apphub-placehead">
            <span>선택한 모임</span>
            <strong>{selectedParts.month0 + 1}월 {selectedParts.day}일 · {weekday}</strong>
          </div>

          {selected ? (
            <>
              <div className="lp-apphub-book">
                <small>{seats === 0 ? "정원 마감" : "예약 가능"}</small>
                <h2>{selected.title}</h2>
                <p>{selected.author}</p>
              </div>

              <div className="lp-apphub-facts">
                <div>
                  <span>시간</span>
                  <strong>{formatTime(selected)}</strong>
                </div>
                <div>
                  <span>장소</span>
                  <strong>{selected.location || "장소 확인 중"}</strong>
                  {selected.area && <small>{selected.area}</small>}
                </div>
                <div>
                  <span>자리</span>
                  <strong>{seats == null ? "상세에서 확인" : seats === 0 ? "마감" : `${seats}자리 남음`}</strong>
                </div>
                <div>
                  <span>내 위치</span>
                  {locationState === "ready" && distance != null ? (
                    <strong>현재 위치에서 약 {formatDistance(distance)}</strong>
                  ) : (
                    <button type="button" onClick={detectLocation} disabled={locationState === "loading"}>
                      {locationState === "loading"
                        ? "위치 확인 중…"
                        : locationState === "denied"
                          ? "위치 권한을 확인해 주세요"
                          : "내 위치 기준 거리 보기"}
                    </button>
                  )}
                </div>
              </div>

              <div className="lp-apphub-actions">
                <Link href={`/bookclub/${selected.slug}`} className="primary">이 모임 보기</Link>
                <a href={mapHref} target="_blank" rel="noreferrer" className="secondary">지도 보기</a>
              </div>
            </>
          ) : (
            <p className="lp-apphub-empty">등록된 북클럽 일정이 없습니다.</p>
          )}
        </aside>
      </div>

      <div className="lp-apphub-steps">
        <span><b>1</b> 날짜</span><i />
        <span><b>2</b> 위치</span><i />
        <span><b>3</b> 예약</span>
      </div>
    </section>
  );
}
