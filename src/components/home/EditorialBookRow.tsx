"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { BookClubSession } from "@/lib/bookclub/types";
import { seatsLeft } from "@/lib/bookclub/types";
import { formatMonthDay, formatWeekdayFull, getStatus } from "@/lib/bookclub/selectors";

// 실제 표지 이미지가 없는 세션의 대체 배경. OG 소셜 공유 이미지(가로형, 큰
// 텍스트 포함)를 세로 카드로 크롭하면 글자가 잘리고 옆 카드와 겹쳐 보이는
// 문제가 있어(2차 지시 대응 중 실제 스크린샷으로 확인) 단색 배경으로 바꿨다.
const FLAT_COLORS = ["#1B2536", "#8B5E3C", "#5C6B3A", "#4A5568", "#6B4A3A"];
function flatColorFor(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return FLAT_COLORS[hash % FLAT_COLORS.length];
}

/**
 * 홈 전용 북클럽 카드 — sternberg-press.com 상호작용(작업지시서, 2차 지시).
 * 기본: 표지 + 제목 + 날짜 한 줄만 보인다. hover(desktop)/tap(touch) 시
 * 저자·요약·잔여석이 카드 위에 오버레이로 나타난다. 페이지 이동은 오버레이
 * 안의 실제 링크를 눌러야만 일어난다(카드 자체는 링크가 아님).
 *
 * 오버레이는 opacity/pointer-events로만 감췄다 켰다 한다 — display:none이나
 * aria-hidden을 쓰지 않아 화면 낭독기는 hover 상태와 무관하게 항상 읽는다.
 */
function EditorialBookCard({ session }: { session: BookClubSession }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const status = getStatus(session);
  const seats = seatsLeft(session);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onOutside);
    return () => document.removeEventListener("pointerdown", onOutside);
  }, [open]);

  const seatLabel = status === "past" ? "지난 모임" : status === "full" ? "마감" : `${seats}자리 남음`;
  const summaryLine = session.summary.split("\n").find((l) => l.trim()) ?? "";

  return (
    <article
      ref={ref}
      className={`lp-ecard${open ? " is-open" : ""}`}
      tabIndex={0}
      onPointerDown={(e) => {
        if (e.pointerType === "touch" || e.pointerType === "pen") {
          e.stopPropagation();
          setOpen((v) => !v);
        }
      }}
    >
      <div className="lp-ecard-cover">
        {session.coverUrl ? (
          <Image src={session.coverUrl} alt="" fill unoptimized sizes="280px" style={{ objectFit: "cover" }} />
        ) : (
          <div className="lp-ecard-cover-flat" style={{ background: flatColorFor(session.slug) }} aria-hidden="true" />
        )}
      </div>

      <div className="lp-ecard-face">
        <h3 className="lp-ecard-title">{session.bookTitle}</h3>
        <p className="lp-ecard-line">{formatMonthDay(session.startsAt)} {formatWeekdayFull(session.startsAt)}</p>
      </div>

      <div className="lp-ecard-overlay">
        <p className="lp-ecard-author">{session.author}</p>
        <p className="lp-ecard-summary">{summaryLine}</p>
        <p className="lp-ecard-seats">{seatLabel}</p>
        <Link href={`/bookclub/${session.slug}`} className="lp-underline-cta lp-ecard-link">
          자세히 보기 →
        </Link>
      </div>
    </article>
  );
}

export default function EditorialBookRow({ sessions }: { sessions: BookClubSession[] }) {
  if (sessions.length === 0) return null;
  return (
    <div className="lp-ecard-row">
      {sessions.map((s) => (
        <EditorialBookCard key={s.slug} session={s} />
      ))}
    </div>
  );
}
