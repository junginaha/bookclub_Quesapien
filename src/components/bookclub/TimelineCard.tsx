"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { BookClub, ClubStatus } from "@/lib/bookclubs";
import { formatTimeOfDay } from "@/lib/bookclubs";
import StatusPill from "./StatusPill";
import NotifyForm from "./NotifyForm";

function ogFallback(title: string, sub: string) {
  const p = new URLSearchParams({ title, sub });
  return `/og?${p.toString()}`;
}

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

  const cardInner = (
    <>
      <div className="qc-card-body">
        <span className="qc-card-time">{formatTimeOfDay(club.startAt)} · {club.title}</span>
        <span className="qc-card-reason">{club.reasonOneLine}</span>
        <span className="qc-card-book">『{club.bookTitle}』 {club.bookAuthor}</span>
        <div className="qc-card-meta">
          <span>{club.venueName}</span>
          <StatusPill status={status} club={club} joinedCount={joinedCount} />
        </div>
      </div>
      <div className="qc-card-cover">
        <Image src={cover} alt={`『${club.bookTitle}』 표지`} width={88} height={132} unoptimized />
      </div>
    </>
  );

  return (
    <div
      id={`club-${club.slug}`}
      className={`qc-tl-item${isPast ? " is-past" : ""}`}
    >
      {status === "full" || status === "tentative" ? (
        <div className={`qc-card${highlighted ? " is-highlight" : ""}`} style={{ flexDirection: "column", alignItems: "stretch" }}>
          <Link href={`/bookclub/${club.slug}`} className="qc-card" style={{ border: "none", padding: 0 }}>
            {cardInner}
          </Link>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
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
          {actionOpen && (
            <div style={{ marginTop: 8 }}>
              <NotifyForm clubSlug={club.slug} mode={status === "full" ? "waitlist" : "notify"} />
            </div>
          )}
        </div>
      ) : isPast ? (
        <div className={`qc-card is-past${highlighted ? " is-highlight" : ""}`} style={{ flexDirection: "column", alignItems: "stretch" }}>
          <div style={{ display: "flex", gap: 16 }}>{cardInner}</div>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
            {club.archiveSlug ? (
              <Link href={`/archive/${club.archiveSlug}`} className="qc-inline-btn">그날의 기록</Link>
            ) : (
              <span className="qc-inline-btn" aria-disabled="true" style={{ color: "var(--muted-2)", textDecoration: "none", cursor: "default" }}>
                정리 중입니다
              </span>
            )}
          </div>
        </div>
      ) : (
        <Link href={`/bookclub/${club.slug}`} className={`qc-card${highlighted ? " is-highlight" : ""}`}>
          {cardInner}
        </Link>
      )}
    </div>
  );
}
