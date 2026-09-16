"use client";

import Link from "next/link";
import Image from "next/image";
import type { BookClubSession, SessionStatus } from "@/lib/bookclub/types";
import { seatsLeft } from "@/lib/bookclub/types";
import { feeLabel, formatMonthDay, formatTimeRange, formatWeekdayFull } from "@/lib/bookclub/selectors";
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
  session,
  status,
  nextSessions,
}: {
  session: BookClubSession;
  status: SessionStatus;
  nextSessions: { session: BookClubSession; status: SessionStatus }[];
}) {
  const cover = session.coverUrl || ogFallback(session.bookTitle, session.author);
  const isPast = status === "past";

  return (
    <div className="qd-body">
      <aside className="qd-side">
        <div className="qd-cover">
          <Image src={cover} alt={`『${session.bookTitle}』 표지`} width={340} height={510} unoptimized priority />
        </div>
        <div>
          <div className="qd-book-title">『{session.bookTitle}』</div>
          <div className="qd-book-author">{session.author}</div>
        </div>
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
        <h1 className="qd-title">{session.title}</h1>
        <p className="qd-reason">{session.summary}</p>

        <div className="qd-block">
          <div className="qd-block-label">일시</div>
          <div className="qd-block-main">{formatMonthDay(session.startsAt)} {formatWeekdayFull(session.startsAt)}</div>
          <div className="qd-block-sub">{formatTimeRange(session.startsAt, session.endsAt)}</div>
        </div>

        <div className="qd-block">
          <div className="qd-block-label">장소</div>
          <div className="qd-block-main">
            {session.venue.name}{session.venue.detail ? ` · ${session.venue.detail}` : ""}
          </div>
          <div className="qd-block-sub">{session.venue.address}</div>
          {session.venue.nearestStation && <div className="qd-block-sub">{session.venue.nearestStation}</div>}
        </div>

        {session.agendaPreview.length > 0 && (
          <div className="qd-questions">
            <div className="qd-questions-title">이번 발제 미리보기</div>
            {session.agendaPreview.slice(0, 3).map((q, i) => (
              <p className="qd-question" key={i}>{q}</p>
            ))}
          </div>
        )}

        {isPast ? (
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
          <div className="qd-apply" id="apply">
            <div className="qd-apply-title">
              {status === "full" ? "이번 모임은 마감됐어요" : "함께해요"}
            </div>
            <p className="qd-apply-sub">
              {status === "full"
                ? `${session.venue.name} · 대기자로 등록하면 자리가 나는 대로 안내해 드려요.`
                : `${formatMonthDay(session.startsAt)} ${formatWeekdayFull(session.startsAt)} · ${feeLabel(session.fee)} · ${seatsLeft(session)}자리 남음`}
            </p>
            {status === "full" ? (
              <NotifyForm clubSlug={session.slug} mode="waitlist" />
            ) : (
              <ApplyForm clubSlug={session.slug} />
            )}
          </div>
        )}

        <VenueMap lat={session.venue.lat} lng={session.venue.lng} label={session.venue.name} />

        {nextSessions.length > 0 && (
          <div className="qd-next">
            <div className="qd-next-title">다른 책도 건네지고 있습니다</div>
            <div className="qd-next-grid">
              {nextSessions.map((n) => {
                const nCover = n.session.coverUrl || ogFallback(n.session.bookTitle, n.session.author);
                return (
                  <Link href={`/bookclub/${n.session.slug}`} className="qd-next-card" key={n.session.slug}>
                    <div className="qd-next-cover">
                      <Image src={nCover} alt={`『${n.session.bookTitle}』 표지`} width={160} height={240} unoptimized />
                    </div>
                    <div className="qd-next-title2">『{n.session.bookTitle}』</div>
                    <div style={{ marginTop: 4 }}>
                      <StatusPill status={n.status} session={n.session} />
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
