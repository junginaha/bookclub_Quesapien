"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { BookClubSession } from "@/lib/bookclub/types";
import { seatsLeft } from "@/lib/bookclub/types";
import { formatMonthDay, formatWeekdayFull, getStatus } from "@/lib/bookclub/selectors";
import HoverReveal from "./HoverReveal";

// 1x1 회색 blur — 원격 표지 이미지는 next/image가 자동으로 blurDataURL을
// 생성해줄 수 없어(정적 import가 아님) 공용 placeholder를 직접 준다.
const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

// 표지가 없거나 로드에 실패했을 때 대체하는 책 아이콘(고정 SVG, 이미지 생성 없음).
function BookFallbackIcon({ background }: { background: string }) {
  return (
    <div className="lp-cc-fallback" style={{ background }} aria-hidden="true">
      <svg viewBox="0 0 48 48" width="34" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 8h13a5 5 0 0 1 5 5v27a4 4 0 0 0-4-4H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z"
          stroke="rgba(255,255,255,0.75)" strokeWidth="1.6" strokeLinejoin="round"
        />
        <path
          d="M38 8H25v32a4 4 0 0 1 4-4h9a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z"
          stroke="rgba(255,255,255,0.45)" strokeWidth="1.6" strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// 표지가 없는 세션의 대체 배경색. 실제 표지가 생기기 전까지 카드마다
// 다른 색으로 구분되게 한다(2차 지시 대응 당시 결정 유지).
const FLAT_COLORS = ["#1B2536", "#8B5E3C", "#5C6B3A", "#4A5568", "#6B4A3A"];
function flatColorFor(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return FLAT_COLORS[hash % FLAT_COLORS.length];
}

/**
 * 홈 전용 북클럽 표지 그리드 — chosecommune.com 방식(Phase 3 재지시로 sternberg
 * 방식 대체). 이미지가 주인공: 표지를 크게, 제목·날짜만 이미지 아래 항상
 * 보이고, 나머지 정보(저자·요약·잔여석)는 hover(desktop)/tap(touch) 시
 * HoverReveal이 부드럽게 펼친다. 그림자·라운드·그라디언트 없음.
 */
function BookCoverCard({ session }: { session: BookClubSession }) {
  const [imgFailed, setImgFailed] = useState(false);
  const status = getStatus(session);
  const seats = seatsLeft(session);
  const showFallback = !session.coverUrl || imgFailed;

  const seatLabel = status === "past" ? "지난 모임" : status === "full" ? "마감" : `${seats}자리 남음`;
  const summaryLine = session.summary.split("\n").find((l) => l.trim()) ?? "";

  return (
    <article className="lp-cc-card">
      <div className="lp-cc-cover">
        {showFallback ? (
          <BookFallbackIcon background={flatColorFor(session.slug)} />
        ) : (
          <Image
            src={session.coverUrl!}
            alt={`${session.bookTitle} 표지`}
            fill
            sizes="(min-width: 1440px) 20vw, (min-width: 1024px) 28vw, (min-width: 768px) 45vw, 45vw"
            style={{ objectFit: "cover" }}
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            onError={() => setImgFailed(true)}
          />
        )}
      </div>

      <HoverReveal
        className="lp-cc-face"
        summary={
          <>
            <h3 className="lp-cc-title">{session.bookTitle}</h3>
            <p className="lp-cc-meta">{formatMonthDay(session.startsAt)} {formatWeekdayFull(session.startsAt)}</p>
          </>
        }
        detail={
          <>
            <p className="lp-cc-author">{session.author}</p>
            {summaryLine && <p className="lp-cc-summary">{summaryLine}</p>}
            <p className="lp-cc-seats">{seatLabel}</p>
            <Link href={`/bookclub/${session.slug}`} className="lp-underline-cta lp-cc-link">
              자세히 보기 →
            </Link>
          </>
        }
      />
    </article>
  );
}

export default function BookCoverGrid({ sessions }: { sessions: BookClubSession[] }) {
  if (sessions.length === 0) return null;
  return (
    <div className="lp-cc-grid">
      {sessions.map((s) => (
        <BookCoverCard key={s.slug} session={s} />
      ))}
    </div>
  );
}
