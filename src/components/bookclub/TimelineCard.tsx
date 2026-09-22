"use client";

import Link from "next/link";
import BookCoverImage from "@/components/home/BookCoverImage";
import { useState } from "react";
import type { BookClubSession, SessionStatus } from "@/lib/bookclub/types";
import { isWaitlistFull } from "@/lib/bookclub/types";
import { cardBlurb, encoreCopy, formatMonthDay, formatTimeOfDay, formatWeekdayFull } from "@/lib/bookclub/selectors";
import { Button } from "@/components/ui/button";
import StatusPill from "./StatusPill";
import NotifyForm from "./NotifyForm";
import EncoreRequestButton from "./EncoreRequestButton";

/**
 * 세션 카드 — 예정/지난 공용 컴포넌트 1개(작업지시서 Phase 1-5). 날짜·시간·장소·
 * 모임 정보를 카드 하나에 합쳐 보여주고, 우측 액션만 status로 분기한다.
 *   open → 자리 수 + [참여 신청]
 *   full → [대기 신청]
 *   past → 앵콜 요청 문구 + [앵콜 요청] + [기록 보기]
 */
export default function TimelineCard({
  session,
  status,
  highlighted,
}: {
  session: BookClubSession;
  status: SessionStatus;
  highlighted: boolean;
}) {
  const [actionOpen, setActionOpen] = useState(false);
  const isPast = status === "past";
  const weekday = formatWeekdayFull(session.startsAt).slice(0, 1);

  const cardInner = (
    <>
      <div className="qc-card-cover">
        <BookCoverImage title={session.bookTitle} author={session.author} coverUrl={session.coverUrl} />
      </div>
      <div className="qc-card-body">
        <span className="qc-card-title">{session.title}</span>
        <span className="qc-card-datetime">
          {formatMonthDay(session.startsAt)}({weekday}) · {formatTimeOfDay(session.startsAt)} · {session.venue.name}
        </span>
        {cardBlurb(session) && <span className="qc-card-reason">{cardBlurb(session)}</span>}
        <div className="qc-card-meta">
          <span className="qc-card-book">『{session.bookTitle}』 {session.author}</span>
          <StatusPill status={status} session={session} />
        </div>
      </div>
    </>
  );

  return (
    <div id={`club-${session.slug}`} className="qc-tl-item">
      <div className={`qc-card-wrap${highlighted ? " is-highlight" : ""}${isPast ? " is-past" : ""}`}>
        {isPast ? (
          <div className="qc-card">{cardInner}</div>
        ) : (
          <Link href={`/bookclub/${session.slug}`} className="qc-card qc-card-link">
            {cardInner}
          </Link>
        )}

        {status === "open" && (
          <div className="qc-card-actionrow">
            <Link href={`/bookclub/${session.slug}`}>
              <Button type="button" variant="primary" size="sm">참여 신청</Button>
            </Link>
          </div>
        )}

        {status === "full" && (
          <div className="qc-card-actionrow">
            {isWaitlistFull(session) ? (
              <Button type="button" variant="outline" size="sm" disabled>마감되었습니다</Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => { e.preventDefault(); setActionOpen((v) => !v); }}
                aria-expanded={actionOpen}
              >
                대기 신청
              </Button>
            )}
          </div>
        )}
        {status === "full" && actionOpen && !isWaitlistFull(session) && (
          <div className="qc-card-actionform">
            <NotifyForm clubSlug={session.slug} mode="waitlist" />
          </div>
        )}

        {isPast && (
          <>
            {/* count=0일 때 문구는 섹션 하단 캡션 1회로만 보여준다(카드마다 반복 금지 — 작업지시서 Phase 1-6). */}
            {(session.encoreCount ?? 0) > 0 && (
              <p className="qc-card-encore-copy">{encoreCopy(session.encoreCount ?? 0)}</p>
            )}
            <div className="qc-card-actionrow" style={{ justifyContent: "space-between" }}>
              {session.archiveSlug ? (
                <Link href={`/archive/${session.archiveSlug}`} className="qc-inline-btn">기록 보기</Link>
              ) : (
                <span className="qc-inline-btn is-disabled">정리 중입니다</span>
              )}
              <button
                type="button"
                className="qc-inline-btn"
                onClick={(e) => { e.preventDefault(); setActionOpen((v) => !v); }}
                aria-expanded={actionOpen}
              >
                앵콜 요청
              </button>
            </div>
            {actionOpen && (
              <div className="qc-card-actionform">
                <EncoreRequestButton clubSlug={session.slug} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
