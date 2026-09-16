"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { BookClub, ClubStatus } from "@/lib/bookclubs";
import { formatMonthDay, formatWeekdayFull, formatTimeOfDay } from "@/lib/bookclubs";
import StatusPill from "./StatusPill";
import NotifyForm from "./NotifyForm";

function ogFallback(title: string, sub: string) {
  const p = new URLSearchParams({ title, sub });
  return `/og?${p.toString()}`;
}

/**
 * 카드 하나에 날짜·시간·장소·모임 정보를 전부 합쳐서 보여준다(사용자 피드백:
 * 정보가 여러 요소에 쪼개져 있어 겹쳐 보이고 읽기 어려웠음). sticky 등
 * 별도 포지셔닝 요소 없이 일반 흐름(flex)만 사용해 겹침 위험을 없앤다.
 */
export default function TimelineCard({
  club,
  status,
  joinedCount,
  highlighted,
}: {
  club: BookClub;
  status: ClubStatus;
  joinedCount: number;
  highlighted: boolean;
}) {
  const [actionOpen, setActionOpen] = useState(false);
  const cover = club.bookCover || ogFallback(club.bookTitle, club.bookAuthor);
  const isPast = status === "past";
  const needsAction = status === "full" || status === "tentative";
  const weekday = formatWeekdayFull(club.startAt).slice(0, 1);

  const cardInner = (
    <>
      <div className="qc-card-cover">
        <Image src={cover} alt={`『${club.bookTitle}』 표지`} width={88} height={132} unoptimized />
      </div>
      <div className="qc-card-body">
        <span className="qc-card-title">{club.title}</span>
        <span className="qc-card-datetime">
          {formatMonthDay(club.startAt)}({weekday}) · {formatTimeOfDay(club.startAt)} · {club.venueName}
        </span>
        <span className="qc-card-reason">{club.reasonOneLine}</span>
        <div className="qc-card-meta">
          <span className="qc-card-book">『{club.bookTitle}』 {club.bookAuthor}</span>
          <StatusPill status={status} club={club} joinedCount={joinedCount} />
        </div>
      </div>
    </>
  );

  return (
    <div id={`club-${club.slug}`} className="qc-tl-item">
      <div className={`qc-card-wrap${highlighted ? " is-highlight" : ""}${isPast ? " is-past" : ""}`}>
        {isPast ? (
          <div className="qc-card">{cardInner}</div>
        ) : (
          <Link href={`/bookclub/${club.slug}`} className="qc-card qc-card-link">
            {cardInner}
          </Link>
        )}

        {needsAction && (
          <div className="qc-card-actionrow">
            <button
              type="button"
              className="qc-inline-btn"
              onClick={(e) => {
                e.preventDefault();
                setActionOpen((v) => !v);
              }}
              aria-expanded={actionOpen}
            >
              {status === "full" ? "대기자 등록" : "알림 받기"}
            </button>
          </div>
        )}
        {needsAction && actionOpen && (
          <div className="qc-card-actionform">
            <NotifyForm clubSlug={club.slug} mode={status === "full" ? "waitlist" : "notify"} />
          </div>
        )}

        {isPast && (
          <div className="qc-card-actionrow">
            {club.archiveSlug ? (
              <Link href={`/archive/${club.archiveSlug}`} className="qc-inline-btn">
                그날의 기록
              </Link>
            ) : (
              <span className="qc-inline-btn is-disabled">정리 중입니다</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
