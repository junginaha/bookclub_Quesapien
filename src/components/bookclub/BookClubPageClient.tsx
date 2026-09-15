"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { BookClub, ClubStatus } from "@/lib/bookclubs";
import { dateKey } from "@/lib/bookclubs";
import MiniCalendar, { type CalendarClub } from "./MiniCalendar";
import Timeline, { type TimelineEntry } from "./Timeline";
import NotifyForm from "./NotifyForm";

export interface ClubWithComputed {
  club: BookClub;
  status: ClubStatus;
  joinedCount: number;
}

type Tab = "upcoming" | "past";

export default function BookClubPageClient({ items }: { items: ClubWithComputed[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlTab = searchParams.get("tab") === "past" ? "past" : "upcoming";
  const urlDate = searchParams.get("date");

  const [tab, setTab] = useState<Tab>(urlTab);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [emptyNotifyOpen, setEmptyNotifyOpen] = useState(false);

  const upcoming = useMemo(
    () => items.filter((i) => i.status !== "past").sort((a, b) => a.club.startAt.localeCompare(b.club.startAt)),
    [items]
  );
  const past = useMemo(
    () =>
      items
        .filter((i) => i.status === "past")
        .sort((a, b) => b.club.startAt.localeCompare(a.club.startAt)), // 최신순
    [items]
  );

  const calendarClubs: CalendarClub[] = useMemo(
    () => items.map((i) => ({ slug: i.club.slug, dateKey: dateKey(i.club.startAt), isPast: i.status === "past" })),
    [items]
  );

  const updateUrl = useCallback(
    (nextTab: Tab, nextDate: string | null) => {
      const params = new URLSearchParams();
      if (nextTab === "past") params.set("tab", "past");
      if (nextDate) params.set("date", nextDate);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  // 초기 진입 시 URL의 date로 슬러그를 찾아 하이라이트 대상으로 복원.
  useEffect(() => {
    if (!urlDate) return;
    const match = items.find((i) => dateKey(i.club.startAt) === urlDate);
    if (match) setSelectedSlug(match.club.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedSlug) return;
    const el = document.getElementById(`club-${selectedSlug}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedSlug, tab]);

  function handleTabChange(next: Tab) {
    setTab(next);
    updateUrl(next, urlDate);
  }

  function handleSelectDate(key: string) {
    const match = items.find((i) => dateKey(i.club.startAt) === key);
    if (!match) return;
    const nextTab: Tab = match.status === "past" ? "past" : "upcoming";
    setTab(nextTab);
    setSelectedSlug(match.club.slug);
    updateUrl(nextTab, key);
  }

  const activeEntries: TimelineEntry[] = (tab === "upcoming" ? upcoming : past).map((i) => ({
    club: i.club,
    status: i.status,
    joinedCount: i.joinedCount,
  }));

  return (
    <div className="qc-main">
      <MiniCalendar clubs={calendarClubs} initialDateKey={urlDate ?? undefined} onSelectDate={handleSelectDate} />

      <div className="qc-tabs" role="tablist" aria-label="모임 보기">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "upcoming"}
          className={`qc-tab${tab === "upcoming" ? " is-active" : ""}`}
          onClick={() => handleTabChange("upcoming")}
        >
          예정된 모임
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "past"}
          className={`qc-tab${tab === "past" ? " is-active" : ""}`}
          onClick={() => handleTabChange("past")}
        >
          지나간 모임
        </button>
      </div>

      <Timeline
        entries={activeEntries}
        highlightedSlug={selectedSlug}
        emptyMessage={
          tab === "upcoming"
            ? "준비 중입니다. 새 일정이 열리면 알림으로 알려드릴게요."
            : "아직 지난 모임 기록이 없어요."
        }
        emptyCta={
          tab === "upcoming" ? (
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
    </div>
  );
}
