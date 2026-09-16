"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { BookClubSession, SessionStatus } from "@/lib/bookclub/types";
import { seatsLeft } from "@/lib/bookclub/types";
import {
  dateKey,
  feeLabel,
  formatMonthDay,
  formatTimeRange,
  formatWeekdayFull,
  getStatus,
  isPast,
} from "@/lib/bookclub/selectors";
import ApplyForm from "@/components/bookclub/ApplyForm";
import NotifyForm from "@/components/bookclub/NotifyForm";
import ApplyPanel from "@/components/bookclub/ApplyPanel";
import VenueCard from "@/components/bookclub/VenueCard";
import MiniCalendar, { type CalendarClub } from "@/components/bookclub/MiniCalendar";
import Timeline, { type TimelineEntry } from "@/components/bookclub/Timeline";
import "@/components/bookclub/bookclub.css";

function ogFallback(title: string, sub: string) {
  const p = new URLSearchParams({ title, sub });
  return `/og?${p.toString()}`;
}

type Period = "upcoming" | "past" | "all";

export default function DetailClient({
  session,
  status,
  allSessions,
}: {
  session: BookClubSession;
  status: SessionStatus;
  /** 전체 세션(현재 세션 포함, reserved 반영 완료) — 좌측 캘린더 + 우측 "다른 모임" 타임라인 공용. */
  allSessions: BookClubSession[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cover = session.coverUrl || ogFallback(session.bookTitle, session.author);
  const isSessionPast = status === "past";
  const weekday = formatWeekdayFull(session.startsAt);

  const rawPeriod = searchParams.get("period") ?? searchParams.get("filter");
  const period: Period = rawPeriod === "past" ? "past" : rawPeriod === "all" ? "all" : "upcoming";

  const calendarClubs: CalendarClub[] = useMemo(
    () => allSessions.map((s) => ({ slug: s.slug, dateKey: dateKey(s.startsAt), isPast: isPast(s) })),
    [allSessions]
  );

  function handleSelectDate(key: string) {
    const match = allSessions.find((s) => dateKey(s.startsAt) === key);
    if (!match) return;
    if (match.slug === session.slug) {
      document.getElementById("qd-hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    router.push(`/bookclub/${match.slug}`);
  }

  const others = allSessions.filter((s) => s.slug !== session.slug);
  const otherUpcoming = others.filter((s) => !isPast(s)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const otherPast = others.filter(isPast).sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const otherAll = [...otherUpcoming, ...otherPast];
  const otherList = period === "upcoming" ? otherUpcoming : period === "past" ? otherPast : otherAll;
  const otherEntries: TimelineEntry[] = otherList.map((s) => ({ session: s, status: getStatus(s) }));

  function setPeriod(next: Period) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("filter");
    if (next === "upcoming") params.delete("period");
    else params.set("period", next);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  }

  return (
    <div className="qd-body">
      <aside className="qd-side">
        <MiniCalendar clubs={calendarClubs} initialDateKey={dateKey(session.startsAt)} onSelectDate={handleSelectDate} />
        <div className="qd-brand">
          <span className="qd-brand-mark" aria-hidden="true">?!</span>
          <span className="qd-brand-name">질문하는 사람들</span>
        </div>
        <div className="qd-side-links">
          <a href="mailto:junginaha@qsapiens.com">문의하기</a>
          <Link href="/terms">환불 규정</Link>
        </div>
      </aside>

      <div className="qd-main">
        <div id="qd-hero">
          <div className="qd-hero-top">
            <div className="qd-cover-sm">
              <Image src={cover} alt={`『${session.bookTitle}』 표지`} width={120} height={180} unoptimized priority />
            </div>
            <div>
              <p className="qd-eyebrow">BOOK CLUB</p>
              <h1 className="qd-title">{session.title}</h1>
              <div className="qd-book-title">『{session.bookTitle}』</div>
              <div className="qd-book-author">{session.author}</div>
            </div>
          </div>

          {/* 스크롤해도 날짜·시간이 계속 보이는 sticky 서브헤더(Luma 프레임 — 작업지시서 Phase 2). */}
          <div className="qd-date-sticky">
            <span>{formatMonthDay(session.startsAt)} {weekday}</span>
            <span className="qd-date-sticky-sep">·</span>
            <span>{formatTimeRange(session.startsAt, session.endsAt)}</span>
          </div>
        </div>

        <p className="qd-reason">{session.summary}</p>

        <VenueCard venue={session.venue} />

        {session.agendaPreview.length > 0 && (
          <div className="qd-questions">
            <div className="qd-questions-title">이번 발제 미리보기</div>
            {session.agendaPreview.slice(0, 3).map((q, i) => (
              <p className="qd-question" key={i}>{q}</p>
            ))}
          </div>
        )}

        {isSessionPast ? (
          <div className="qd-apply">
            <div className="qd-apply-title">지난 모임이에요</div>
            <p className="qd-apply-sub">이날의 이야기를 기록으로 남겨두었어요.</p>
            {session.archiveSlug ? (
              <Link href={`/archive/${session.archiveSlug}`} className="qd-archive-link">그날의 기록 보기</Link>
            ) : (
              <span className="qd-archive-link is-disabled">정리 중입니다</span>
            )}
          </div>
        ) : (
          <ApplyPanel triggerLabel={status === "full" ? "대기 신청" : `참여 신청 · ${seatsLeft(session)}자리 남음`}>
            <div className="qd-apply" id="apply">
              <div className="qd-apply-title">{status === "full" ? "이번 모임은 마감됐어요" : "함께해요"}</div>
              <p className="qd-apply-sub">
                {status === "full"
                  ? `${session.venue.name} · 대기자로 등록하면 자리가 나는 대로 안내해 드려요.`
                  : `${formatMonthDay(session.startsAt)} ${weekday} · ${feeLabel(session.fee)} · ${seatsLeft(session)}자리 남음`}
              </p>
              {status === "full" ? <NotifyForm clubSlug={session.slug} mode="waitlist" /> : <ApplyForm clubSlug={session.slug} />}
            </div>
          </ApplyPanel>
        )}

        {others.length > 0 && (
          <div className="qd-next">
            <div className="qd-next-title">다른 모임도 열려 있어요</div>
            <div className="qc-tabs" role="tablist" aria-label="다른 모임 보기">
              <button type="button" role="tab" aria-selected={period === "upcoming"} className={`qc-tab${period === "upcoming" ? " is-active" : ""}`} onClick={() => setPeriod("upcoming")}>
                예정 ({otherUpcoming.length})
              </button>
              <button type="button" role="tab" aria-selected={period === "past"} className={`qc-tab${period === "past" ? " is-active" : ""}`} onClick={() => setPeriod("past")}>
                지난 ({otherPast.length})
              </button>
              <button type="button" role="tab" aria-selected={period === "all"} className={`qc-tab${period === "all" ? " is-active" : ""}`} onClick={() => setPeriod("all")}>
                전체 ({otherAll.length})
              </button>
            </div>
            <Timeline
              entries={otherEntries}
              highlightedSlug={null}
              emptyMessage={period === "past" ? "아직 지난 모임 기록이 없어요." : "곧 새 일정이 열려요."}
            />
          </div>
        )}
      </div>
    </div>
  );
}
