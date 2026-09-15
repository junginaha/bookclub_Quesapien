"use client";

import Link from "next/link";
import Image from "next/image";
import type { BookClub, ClubStatus } from "@/lib/bookclubs";
import { formatMonthDay, formatWeekdayFull, formatTimeRange, feeLabel, remainingSeats } from "@/lib/bookclubs";
import StatusPill from "@/components/bookclub/StatusPill";
import ApplyForm from "@/components/bookclub/ApplyForm";
import NotifyForm from "@/components/bookclub/NotifyForm";
import VenueMap from "@/components/bookclub/VenueMap";
import "@/components/bookclub/bookclub.css";

function ogFallback(title: string, sub: string) {
  const p = new URLSearchParams({ title, sub });
  return `/og?${p.toString()}`;
}

export default function DetailClient({
  club,
  status,
  joinedCount,
  nextClubs,
}: {
  club: BookClub;
  status: ClubStatus;
  joinedCount: number;
  nextClubs: { club: BookClub; status: ClubStatus; joinedCount: number }[];
}) {
  const cover = club.bookCover || ogFallback(club.bookTitle, club.bookAuthor);
  const isPast = status === "past";

  return (
    <div className="qd-body">
      <aside className="qd-side">
        <div className="qd-cover">
          <Image src={cover} alt={`『${club.bookTitle}』 표지`} width={340} height={510} unoptimized priority />
        </div>
        <div>
          <div className="qd-book-title">『{club.bookTitle}』</div>
          <div className="qd-book-author">{club.bookAuthor}</div>
        </div>
        {club.handedBy.length > 0 && (
          <div className="qd-handed-by">{club.handedBy.map((h) => h.name).join(", ")}님이 건넸어요</div>
        )}
        <hr className="qd-divider" />
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
        <p className="qd-eyebrow">BOOK CLUB</p>
        <h1 className="qd-title">{club.title}</h1>
        <p className="qd-reason">{club.reasonFull}</p>

        <div className="qd-block">
          <div className="qd-block-label">일시</div>
          <div className="qd-block-main">{formatMonthDay(club.startAt)} {formatWeekdayFull(club.startAt)}</div>
          <div className="qd-block-sub">{formatTimeRange(club.startAt, club.endAt)}</div>
        </div>

        <div className="qd-block">
          <div className="qd-block-label">장소</div>
          <div className="qd-block-main">{club.venueName}</div>
          <div className="qd-block-sub">{club.address}</div>
        </div>

        {club.questions.length > 0 && (
          <div className="qd-questions">
            <div className="qd-questions-title">이번 질문</div>
            {club.questions.slice(0, 3).map((q, i) => (
              <p className="qd-question" key={i}>{q}</p>
            ))}
          </div>
        )}

        {isPast ? (
          <div className="qd-apply">
            <div className="qd-apply-title">지난 모임이에요</div>
            <p className="qd-apply-sub">이날의 이야기를 기록으로 남겨두었어요.</p>
            {club.archiveSlug ? (
              <Link href={`/archive/${club.archiveSlug}`} className="qd-archive-link">그날의 기록 보기</Link>
            ) : (
              <span className="qd-archive-link is-disabled">정리 중입니다</span>
            )}
          </div>
        ) : (
          <div className="qd-apply" id="apply">
            <div className="qd-apply-title">
              {status === "tentative" ? "책을 고르는 중이에요" : status === "full" ? "이번 모임은 마감됐어요" : "함께해요"}
            </div>
            <p className="qd-apply-sub">
              {status === "tentative" && "책이 정해지면 가장 먼저 알려드릴게요."}
              {status === "full" && `${club.venueName} · 대기자로 등록하면 자리가 나는 대로 안내해 드려요.`}
              {(status === "open" || status === "almost_full") && (
                <>
                  {formatMonthDay(club.startAt)} {formatWeekdayFull(club.startAt)} · {feeLabel(club.fee)}
                  {status === "almost_full" && ` · ${remainingSeats(club, joinedCount)}자리 남음`}
                </>
              )}
            </p>
            {status === "tentative" || status === "full" ? (
              <NotifyForm clubSlug={club.slug} mode={status === "full" ? "waitlist" : "notify"} />
            ) : (
              <ApplyForm clubSlug={club.slug} />
            )}
          </div>
        )}

        <VenueMap lat={club.lat} lng={club.lng} label={club.venueName} />

        {nextClubs.length > 0 && (
          <div className="qd-next">
            <div className="qd-next-title">다른 책도 건네지고 있습니다</div>
            <div className="qd-next-grid">
              {nextClubs.map((n) => {
                const nCover = n.club.bookCover || ogFallback(n.club.bookTitle, n.club.bookAuthor);
                return (
                  <Link href={`/bookclub/${n.club.slug}`} className="qd-next-card" key={n.club.slug}>
                    <div className="qd-next-cover">
                      <Image src={nCover} alt={`『${n.club.bookTitle}』 표지`} width={160} height={240} unoptimized />
                    </div>
                    <div className="qd-next-title2">『{n.club.bookTitle}』</div>
                    <div style={{ marginTop: 4 }}>
                      <StatusPill status={n.status} club={n.club} joinedCount={n.joinedCount} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
