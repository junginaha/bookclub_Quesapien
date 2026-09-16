"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { BookClubSession } from "@/lib/bookclub/types";
import { dateKey, getStatus, isPast } from "@/lib/bookclub/selectors";
import MiniCalendar, { type CalendarClub } from "./MiniCalendar";
import Timeline, { type TimelineEntry } from "./Timeline";
import NotifyForm from "./NotifyForm";

type Filter = "upcoming" | "past" | "all";

/**
 * "함께 읽어요" 단일 섹션 — 홈·/bookclub 공용(작업지시서 Phase 1).
 * 하나의 세션 배열에서 필터로 분기하며, 별도 배열/별도 카드 컴포넌트를 두지 않는다.
 */
export default function TogetherReading({
  sessions,
  title = "함께 읽어요",
  limit,
  showCalendar = true,
  ctaHref,
  ctaLabel,
  syncUrl = true,
}: {
  sessions: BookClubSession[];
  title?: string;
  limit?: number;
  showCalendar?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
  syncUrl?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 레거시 쿼리(?tab=past, ?period=past) 호환 — 기존 공유 링크를 깨뜨리지 않는다.
  const rawFilter = searchParams.get("filter") ?? searchParams.get("period") ?? searchParams.get("tab");
  const urlFilter: Filter = rawFilter === "past" ? "past" : rawFilter === "all" ? "all" : "upcoming";
  const urlDate = searchParams.get("date");

  const [filter, setFilter] = useState<Filter>(urlFilter);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [emptyNotifyOpen, setEmptyNotifyOpen] = useState(false);

  const upcoming = useMemo(
    () => sessions.filter((s) => !isPast(s)).sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [sessions]
  );
  const past = useMemo(
    () => sessions.filter(isPast).sort((a, b) => b.startsAt.localeCompare(a.startsAt)),
    [sessions]
  );
  const all = useMemo(
    () => [...upcoming, ...past],
    [upcoming, past]
  );

  const calendarClubs: CalendarClub[] = useMemo(
    () => sessions.map((s) => ({ slug: s.slug, dateKey: dateKey(s.startsAt), isPast: isPast(s) })),
    [sessions]
  );

  const updateUrl = useCallback(
    (nextFilter: Filter, nextDate: string | null) => {
      if (!syncUrl) return;
      const params = new URLSearchParams();
      if (nextFilter !== "upcoming") params.set("filter", nextFilter);
      if (nextDate) params.set("date", nextDate);
      const qs = params.toString();
      // scroll:false — 필터 전환 시 스크롤 위치를 유지한다(작업지시서 Phase 1-4).
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, syncUrl]
  );

  useEffect(() => {
    if (!urlDate) return;
    const match = sessions.find((s) => dateKey(s.startsAt) === urlDate);
    if (match) setSelectedSlug(match.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedSlug) return;
    const el = document.getElementById(`club-${selectedSlug}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedSlug, filter]);

  function handleFilterChange(next: Filter) {
    setFilter(next);
    updateUrl(next, urlDate);
  }

  function handleSelectDate(key: string) {
    const match = sessions.find((s) => dateKey(s.startsAt) === key);
    if (!match) return;
    const nextFilter: Filter = isPast(match) ? "past" : "upcoming";
    setFilter(nextFilter);
    setSelectedSlug(match.slug);
    updateUrl(nextFilter, key);
  }

  const activeList = filter === "upcoming" ? upcoming : filter === "past" ? past : all;
  const limited = typeof limit === "number" ? activeList.slice(0, limit) : activeList;
  const entries: TimelineEntry[] = limited.map((session) => ({ session, status: getStatus(session) }));
  const hasAnyPastShown = limited.some((s) => isPast(s));

  return (
    <div className="qc-main">
      {title && (
        <h3 className="qc-together-title">{title}</h3>
      )}

      {showCalendar && <MiniCalendar clubs={calendarClubs} initialDateKey={urlDate ?? undefined} onSelectDate={handleSelectDate} />}

      <div className="qc-tabs" role="tablist" aria-label="모임 보기">
        <button type="button" role="tab" aria-selected={filter === "upcoming"} className={`qc-tab${filter === "upcoming" ? " is-active" : ""}`} onClick={() => handleFilterChange("upcoming")}>
          예정 ({upcoming.length})
        </button>
        <button type="button" role="tab" aria-selected={filter === "past"} className={`qc-tab${filter === "past" ? " is-active" : ""}`} onClick={() => handleFilterChange("past")}>
          지난 ({past.length})
        </button>
        <button type="button" role="tab" aria-selected={filter === "all"} className={`qc-tab${filter === "all" ? " is-active" : ""}`} onClick={() => handleFilterChange("all")}>
          전체 ({all.length})
        </button>
      </div>

      <Timeline
        entries={entries}
        highlightedSlug={selectedSlug}
        emptyMessage={
          filter === "past"
            ? "아직 지난 모임 기록이 없어요."
            : "준비 중입니다. 새 일정이 열리면 알림으로 알려드릴게요."
        }
        emptyCta={
          filter !== "past" ? (
            <>
              <button type="button" className="qc-notify-btn is-outline" onClick={() => setEmptyNotifyOpen((v) => !v)} aria-expanded={emptyNotifyOpen} style={{ width: "auto", padding: "9px 18px" }}>
                알림 받기
              </button>
              {emptyNotifyOpen && (
                <div style={{ marginTop: 10, maxWidth: 320, marginInline: "auto" }}>
                  <NotifyForm clubSlug={null} mode="notify" />
                </div>
              )}
            </>
          ) : undefined
        }
      />

      {/* 앵콜 안내 문구 — 카드마다 반복하지 않고 섹션 하단 1회만(작업지시서 Phase 1-6). */}
      {hasAnyPastShown && (
        <p className="qc-together-caption">함께 읽을 사람들이 모이면 새 일정을 엽니다.</p>
      )}

      {ctaHref && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <Link href={ctaHref} className="btn-pill-neu" style={{ padding: "6px 14px", fontSize: 11.5 }}>
            {ctaLabel ?? "북클럽 전체 일정 보기"}
          </Link>
        </div>
      )}
    </div>
  );
}
