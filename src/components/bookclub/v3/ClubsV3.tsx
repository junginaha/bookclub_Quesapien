"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { BookClubSession } from "@/lib/bookclub/types";
import { seatsLeft } from "@/lib/bookclub/types";
import { dateKey, formatMonthDay, formatTimeOfDay, formatWeekdayFull, getStatus, sortByStart } from "@/lib/bookclub/selectors";
import ClubsMap from "./ClubsMap";
import "@/components/home/v3/home-v3.css";
import "./clubs-v3.css";

/**
 * 북클럽 찾기 v3 (MASTER_v3.md §3) — 리스트 · 지도 · 달력, 한 URL(/bookclub?view=…).
 * 필터: 모집 중 · 주말 · 평일 저녁 · 온라인. 빈 결과엔 항상 다음 행동 1개.
 */
type View = "list" | "map" | "calendar";
type Chip = "all" | "open" | "weekend" | "evening" | "online";

const CHIPS: { id: Chip; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "open", label: "모집 중" },
  { id: "weekend", label: "주말" },
  { id: "evening", label: "평일 저녁" },
  { id: "online", label: "온라인" },
];

const pad = (n: number) => String(n).padStart(2, "0");
function seoulHour(iso: string) {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", hour: "numeric", hourCycle: "h23" }).format(new Date(iso)));
}
function seoulDow(iso: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", weekday: "short" }).format(new Date(iso));
}
function isOnline(s: BookClubSession) {
  return /온라인|zoom|줌|online/i.test(`${s.venue.name} ${s.venue.detail}`);
}
function hasCoords(s: BookClubSession) {
  return Number.isFinite(s.venue.lat) && Number.isFinite(s.venue.lng);
}
function daysUntil(iso: string) {
  // KST 날짜 기준(시각 무관): 오늘 19시 모임은 "오늘", 자정 넘기면 "내일".
  const [y1, m1, d1] = dateKey(iso).split("-").map(Number);
  const [y0, m0, d0] = dateKey(new Date()).split("-").map(Number);
  return Math.round((Date.UTC(y1, m1 - 1, d1) - Date.UTC(y0, m0 - 1, d0)) / 86_400_000);
}
function kicker(s: BookClubSession) {
  const d = daysUntil(s.startsAt);
  if (d <= 0) return "오늘";
  if (d === 1) return "내일";
  if (d <= 7) return `이번 주 ${formatWeekdayFull(s.startsAt)}`;
  if (d <= 14) return `다음 주 ${formatWeekdayFull(s.startsAt)}`;
  return formatMonthDay(s.startsAt);
}
function monthGrid(year: number, month0: number) {
  const first = new Date(Date.UTC(year, month0, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  const cells: (number | null)[] = Array(first).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function Card({ s }: { s: BookClubSession }) {
  const st = getStatus(s);
  const left = seatsLeft(s);
  const past = st === "past";
  return (
    <Link href={`/bookclub/${s.slug}`} className="qv3-card">
      <span className={`qv3-kicker${!past && daysUntil(s.startsAt) <= 7 ? " qv3-kicker--soon" : ""}`}>{past ? "지난 북클럽" : kicker(s)}</span>
      <span className="qv3-q">{s.leadQuestion || s.title}</span>
      <span className="qv3-book">{s.bookTitle} · {s.author}</span>
      <span className="qv3-meta">
        <span>{formatMonthDay(s.startsAt)} {formatWeekdayFull(s.startsAt).replace("요일", "")} · {formatTimeOfDay(s.startsAt)}</span>
        <span className="m2">{s.venue.name} · {past ? "기록 보기" : st === "full" ? "자리가 다 찼어요 · 대기 받아요" : left <= 2 ? `${left}자리 남았어요` : `남은 ${left}자리`}</span>
      </span>
      <span className="qv3-btn">{past ? "자세히" : st === "full" ? "대기 신청" : "예약하기"}</span>
    </Link>
  );
}

export default function ClubsV3({ sessions }: { sessions: BookClubSession[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const view: View = (["list", "map", "calendar"] as View[]).includes(params.get("view") as View) ? (params.get("view") as View) : "list";
  const [chip, setChip] = useState<Chip>("all");
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locState, setLocState] = useState<"idle" | "asking" | "denied">("idle");
  const [picked, setPicked] = useState<BookClubSession | null>(null);
  const [showPast, setShowPast] = useState(false);

  const upcoming = useMemo(() => sessions.filter((s) => getStatus(s) !== "past").sort(sortByStart), [sessions]);
  const past = useMemo(() => sessions.filter((s) => getStatus(s) === "past").sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt)), [sessions]);

  const filtered = useMemo(() => upcoming.filter((s) => {
    if (chip === "open") return getStatus(s) === "open";
    if (chip === "weekend") return ["Sat", "Sun"].includes(seoulDow(s.startsAt));
    if (chip === "evening") return !["Sat", "Sun"].includes(seoulDow(s.startsAt)) && seoulHour(s.startsAt) >= 17;
    if (chip === "online") return isOnline(s);
    return true;
  }), [upcoming, chip]);

  const setView = useCallback((v: View) => {
    router.replace(v === "list" ? "/bookclub" : `/bookclub?view=${v}`, { scroll: false });
  }, [router]);

  // 지도 탭에 들어오면 위치를 한 번 묻는다(거절해도 지도는 보인다)
  useEffect(() => {
    if (view !== "map" || loc || locState !== "idle" || typeof navigator === "undefined" || !navigator.geolocation) return;
    setLocState("asking");
    navigator.geolocation.getCurrentPosition(
      (p) => { setLoc({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocState("idle"); },
      () => setLocState("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }, [view, loc, locState]);

  // 달력
  const today = dateKey(new Date());
  const [month, setMonth] = useState(() => (upcoming[0] ? dateKey(upcoming[0].startsAt) : today).slice(0, 7));
  const [selected, setSelected] = useState<string>("");
  const [y, m] = month.split("-").map(Number);
  const inMonth = useMemo(() => sessions.filter((s) => dateKey(s.startsAt).startsWith(month)).sort(sortByStart), [sessions, month]);
  const eventDays = useMemo(() => new Set(inMonth.map((s) => dateKey(s.startsAt))), [inMonth]);
  const firstUpcoming = inMonth.find((s) => getStatus(s) !== "past") ?? inMonth[0];
  const selectedKey = inMonth.some((s) => dateKey(s.startsAt) === selected) ? selected : firstUpcoming ? dateKey(firstUpcoming.startsAt) : "";
  const daySessions = inMonth.filter((s) => dateKey(s.startsAt) === selectedKey);
  function moveMonth(d: number) {
    const n = new Date(Date.UTC(y, m - 1 + d, 1));
    setMonth(`${n.getUTCFullYear()}-${pad(n.getUTCMonth() + 1)}`);
    setSelected("");
  }

  const mapSessions = filtered.filter(hasCoords);
  const onPick = useCallback((s: BookClubSession) => setPicked(s), []);

  return (
    <div className="qv3 qv3-clubs">
      <header className="qv3-clubs-top">
        <Link href="/" aria-label="홈으로" className="qv3-icon-btn qv3-icon-btn--ghost">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
        </Link>
        <div className="qv3-seg" role="tablist" aria-label="보기 방식">
          {([["list", "리스트"], ["map", "지도"], ["calendar", "달력"]] as [View, string][]).map(([v, label]) => (
            <button key={v} type="button" role="tab" aria-selected={view === v} className="qv3-seg-btn" onClick={() => setView(v)}>{label}</button>
          ))}
        </div>
        <Link href="/mypage" aria-label="내 북클럽" className="qv3-icon-btn qv3-icon-btn--ghost">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
        </Link>
      </header>

      {view !== "calendar" && (
        <div className="qv3-wrap qv3-filters" role="group" aria-label="필터">
          {CHIPS.map((c) => (
            <button key={c.id} type="button" className="qv3-filter" aria-pressed={chip === c.id} onClick={() => setChip(c.id)}>{c.label}</button>
          ))}
        </div>
      )}

      {view === "list" && (
        <main className="qv3-wrap qv3-clubs-main">
          <h1 className="qv3-clubs-title">열리는 북클럽 <span>{filtered.length}</span></h1>
          {filtered.length > 0 ? (
            <div className="qv3-grid">{filtered.map((s) => <Card key={s.slug} s={s} />)}</div>
          ) : (
            <div className="qv3-empty">
              <strong>{chip === "all" ? "지금 열리는 북클럽이 없어요." : "이 조건엔 아직 없어요."}</strong>
              <p>{chip === "all" ? "5명이 모이면 새 북클럽이 열려요. 읽고 싶은 책을 골라주세요." : "조건을 바꾸거나, 읽고 싶은 책으로 함께 열어볼까요?"}</p>
              <div className="qv3-empty-actions">
                {chip !== "all" && <button type="button" className="qv3-btn" onClick={() => setChip("all")}>전체 보기</button>}
                <Link href="/#open" className="qv3-btn qv3-btn--ink">함께 열기</Link>
              </div>
            </div>
          )}
          {past.length > 0 && (
            <section className="qv3-clubs-past" aria-labelledby="past-title">
              <div className="qv3-section-head">
                <h2 id="past-title">지난 북클럽 <span className="qv3-count">{past.length}</span></h2>
                {!showPast && <button type="button" className="qv3-link-btn" onClick={() => setShowPast(true)}>펼치기</button>}
              </div>
              {showPast && <div className="qv3-grid">{past.map((s) => <Card key={s.slug} s={s} />)}</div>}
            </section>
          )}
        </main>
      )}

      {view === "map" && (
        <main className="qv3-clubs-map">
          <div className="qv3-map">
            <ClubsMap sessions={mapSessions} user={loc} onSelect={onPick} />
          </div>
          {locState === "denied" && <p className="qv3-map-note" role="status">위치 권한 없이도 볼 수 있어요. 허용하면 가까운 순으로 보여드려요.</p>}
          {picked ? (
            <div className="qv3-map-card">
              <button type="button" className="qv3-map-card-close" aria-label="닫기" onClick={() => setPicked(null)}>
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
              <Card s={picked} />
            </div>
          ) : mapSessions.length === 0 ? (
            <div className="qv3-map-card qv3-empty">
              <strong>이 근처엔 아직 없어요.<br />첫 북클럽을 열어볼까요?</strong>
              <p>5명이 모이면 열려요. 읽고 싶은 책을 고르면 함께 열어드릴게요.</p>
              <div className="qv3-empty-actions">
                <Link href="/#open" className="qv3-cta">함께 열기</Link>
                {upcoming.some((s) => !hasCoords(s)) && <button type="button" className="qv3-link-btn" onClick={() => setView("list")}>장소 미정 북클럽 보기</button>}
              </div>
            </div>
          ) : (
            <div className="qv3-map-hint">핀을 누르면 북클럽이 보여요 · {mapSessions.length}개</div>
          )}
        </main>
      )}

      {view === "calendar" && (
        <main className="qv3-wrap qv3-clubs-main">
          <div className="qv3-cal">
            <div className="qv3-cal-head">
              <button type="button" className="qv3-icon-btn" aria-label="이전 달" onClick={() => moveMonth(-1)}>←</button>
              <h1 className="qv3-cal-month" aria-live="polite">{y}년 {m}월</h1>
              <button type="button" className="qv3-icon-btn" aria-label="다음 달" onClick={() => moveMonth(1)}>→</button>
            </div>
            <table className="qv3-cal-table">
              <thead><tr>{["일", "월", "화", "수", "목", "금", "토"].map((d) => <th key={d} scope="col">{d}</th>)}</tr></thead>
              <tbody>
                {monthGrid(y, m - 1).map((week, i) => (
                  <tr key={i}>{week.map((d, j) => {
                    const key = d ? `${month}-${pad(d)}` : "";
                    const has = eventDays.has(key);
                    return <td key={j}>{d && (
                      <button type="button" className="qv3-cal-day" disabled={!has} aria-pressed={key === selectedKey} aria-current={key === today ? "date" : undefined}
                        aria-label={`${m}월 ${d}일${has ? " · 북클럽 있음" : ""}`} onClick={() => setSelected(key)}>
                        <span>{d}</span>{has && <i aria-hidden="true" />}
                      </button>
                    )}</td>;
                  })}</tr>
                ))}
              </tbody>
            </table>
          </div>
          {daySessions.length > 0 ? (
            <div className="qv3-grid">{daySessions.map((s) => <Card key={s.slug} s={s} />)}</div>
          ) : (
            <div className="qv3-empty">
              <strong>이번 달엔 아직 없어요.</strong>
              <p>다음 달로 넘기거나, 읽고 싶은 책으로 함께 열어볼까요?</p>
              <div className="qv3-empty-actions">
                <button type="button" className="qv3-btn" onClick={() => moveMonth(1)}>다음 달 보기</button>
                <Link href="/#open" className="qv3-btn qv3-btn--ink">함께 열기</Link>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
