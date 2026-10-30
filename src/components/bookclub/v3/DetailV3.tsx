"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchPalette from "@/components/common/SearchPalette";
import { useRouter, useSearchParams } from "next/navigation";
import type { BookClubSession, SessionStatus } from "@/lib/bookclub/types";
import { isWaitlistFull } from "@/lib/bookclub/types";
import { feeLabel, formatMonthDay, formatTimeOfDay, formatTimeRange, formatWeekdayFull, seatNotice, seatKind, daysUntilStart, IMMINENT_DAYS } from "@/lib/bookclub/selectors";
import type { Viewer } from "@/lib/viewer";
import BookCoverImage from "@/components/home/BookCoverImage";
import { DoodleFace, DoodleRule } from "@/components/common/Doodle";
import NotifyForm from "@/components/bookclub/NotifyForm";
import BookingSheet from "./BookingSheet";
import "@/components/home/v3/home-v3.css";
import "./detail-v3.css";

/**
 * 북클럽 상세 v3 (MASTER_v3.md §4).
 * 질문 1개(히어로) → 책 → 일시·장소·인원 → 질문 5개(1개 공개) → 진행 방식 → 지난 기록 → 고정 CTA.
 * 예약은 로그인 필수(카카오·구글): 미로그인이면 /login?next=…&book=1 로 보내고, 돌아오면 시트가 자동으로 열린다.
 */
export default function DetailV3({
  session,
  status,
  viewer,
  nextSessions,
}: {
  session: BookClubSession;
  status: SessionStatus;
  viewer: Viewer | null;
  nextSessions: BookClubSession[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [sheet, setSheet] = useState(false);
  const [copied, setCopied] = useState(false);

  const past = status === "past";
  const full = status === "full";
  const closed = isWaitlistFull(session);
  const feeText = session.feeLabelOverride ?? feeLabel(session.fee);
  // "마감 임박"은 실제로 임박했을 때만. 그 전에는 "모집 중".
  const soon = !past && daysUntilStart(session) <= IMMINENT_DAYS;
  const bookPath = `/bookclub/${session.slug}`;
  const loginHref = `/login?next=${encodeURIComponent(`${bookPath}?book=1`)}`;

  // 로그인에서 돌아오면 자동으로 예약 시트 열기
  useEffect(() => {
    if (params.get("book") === "1" && viewer && !past && !closed) {
      setSheet(true);
      router.replace(bookPath, { scroll: false });
    }
  }, [params, viewer, past, closed, router, bookPath]);

  async function share() {
    const url = `${window.location.origin}${bookPath}`;
    const text = session.leadQuestion || session.title;
    try {
      if (navigator.share) { await navigator.share({ title: text, url }); return; }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* 사용자가 취소 */ }
  }

  const questions = session.agendaPreview;
  const headline = session.leadQuestion || questions[0] || session.title;
  const hiddenQ = Math.max(0, (questions.length > 0 ? Math.max(questions.length, 5) : 5) - 1);
  const firstDiffers = Boolean(questions[0]) && questions[0] !== headline;

  return (
    <div className="qv3 qv3-detail">
      <header className="qv3-detail-top">
        <Link href="/" aria-label="홈으로" className="qv3-icon-btn qv3-icon-btn--ghost">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
        </Link>
        <SearchPalette variant="icon" triggerClassName="qv3-icon-btn qv3-icon-btn--ghost" />
        <button type="button" onClick={share} aria-label="공유하기" className="qv3-icon-btn qv3-icon-btn--ghost">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3v12" /><path d="M8 7l4-4 4 4" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></svg>
        </button>
        {copied && <span className="qv3-toast" role="status">링크를 복사했어요. 좋은 사람에게 보내주세요.</span>}
      </header>

      <main className="qv3-wrap qv3-detail-main">
        <section className="qv3-detail-hero">
          <span className={`qv3-kicker${past ? "" : " qv3-kicker--soon"}`}>
            <DoodleFace kind={seatKind(session)} />{past ? " 지난 북클럽" : closed ? " 정원·대기 모두 마감" : full ? " 자리는 다 찼지만, 대기는 받아요" : soon ? " 마감 임박" : " 모집 중"}
          </span>
          <h1 className="qv3-detail-q">{headline}</h1>
          <div className="qv3-detail-book">
            <div className="qv3-detail-cover">
              <BookCoverImage title={session.bookTitle} author={session.author} coverUrl={session.coverUrl} isbn={session.isbn} />
            </div>
            <div>
              <div className="qv3-detail-book-title">{session.bookTitle}</div>
              <div className="qv3-detail-book-author">{session.author}</div>
            </div>
          </div>
        </section>

        <section className="qv3-detail-facts" aria-label="일시와 장소">
          <div className="qv3-fact">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
            <div><b>{formatMonthDay(session.startsAt)} {formatWeekdayFull(session.startsAt)}</b><span>{formatTimeRange(session.startsAt, session.endsAt)}</span></div>
          </div>
          <div className="qv3-fact">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
            <div>
              <b>{session.venue.name}</b>
              <span>{[session.venue.detail, session.venue.nearestStation || session.venue.address].filter(Boolean).join(" · ") || "자세한 위치는 예약 후 안내드려요"}</span>
            </div>
          </div>
          <div className="qv3-fact">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.5c3 0 5.5 2 5.5 5.5" /></svg>
            <div><b>{past ? `정원 ${session.capacity}명` : seatNotice(session)}</b><span>{feeText}</span></div>
          </div>
        </section>

        <section className="qv3-detail-section" aria-labelledby="dq-title">
          <h2 id="dq-title">이 모임의 질문</h2>
          <DoodleRule />
          <p className="qv3-detail-lead">첫 질문만 미리 보여드려요. 나머지는 그날의 재미로 남겨둡니다.</p>
          <ol className="qv3-qlist">
            {firstDiffers ? (
              <li className="qv3-qitem"><span className="qv3-qnum">1</span><span>{questions[0]}</span></li>
            ) : (
              <li className="qv3-qitem"><span className="qv3-qnum">1</span><span>위의 질문으로 시작해요. 이미 반은 읽은 셈이에요.</span></li>
            )}
            {hiddenQ > 0 && (
              <li className="qv3-qitem qv3-qitem--hidden"><span className="qv3-qnum">2–{hiddenQ + 1}</span><span>나머지는 모임에서 함께 열어요. 스포일러 금지.</span></li>
            )}
          </ol>
        </section>

        <section className="qv3-detail-section" aria-labelledby="how-title">
          <h2 id="how-title">이렇게 진행해요</h2>
          <DoodleRule />
          {session.program?.length ? (
            <ol className="qv3-program">
              {session.program.map((part) => (
                <li key={part.title}>
                  <span className="qv3-program-time">{part.time}</span>
                  <strong className="qv3-program-title">{part.title}</strong>
                  {part.body && <span className="qv3-program-body">{part.body}</span>}
                </li>
              ))}
            </ol>
          ) : (
            <ol className="qv3-how">
              <li>질문 하나로 가볍게 문을 열어요.</li>
              <li>말하고 싶은 만큼만 말해요. 듣기만 해도 충분히 참여한 거예요.</li>
              <li>끝날 땐 각자 질문 하나씩 주머니에 넣고 돌아가요.</li>
            </ol>
          )}
          {session.summary && <p className="qv3-detail-summary">{session.summary}</p>}
        </section>

        {past && (
          <section className="qv3-detail-section" aria-labelledby="rec-title">
            <h2 id="rec-title">지난 기록</h2>
            {session.archiveSlug ? (
              <Link href={`/archive/${session.archiveSlug}`} className="qv3-record">그날의 기록 보기 →</Link>
            ) : (
              <p className="qv3-detail-summary">공개할 기록을 정리하고 있어요.</p>
            )}
          </section>
        )}

        {nextSessions.length > 0 && (
          <section className="qv3-detail-section" aria-labelledby="next-title">
            <h2 id="next-title">{past ? "지금 열리는 북클럽" : "다른 북클럽도 열려 있어요"}</h2>
            <div className="qv3-next-list">
              {nextSessions.map((s) => (
                <Link key={s.slug} href={`/bookclub/${s.slug}`} className="qv3-next-item">
                  <span className="qv3-next-q">{s.leadQuestion || s.title}</span>
                  <span className="qv3-next-meta">{s.bookTitle} · {formatMonthDay(s.startsAt)} {formatWeekdayFull(s.startsAt).replace("요일", "")} {formatTimeOfDay(s.startsAt)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="qv3-detail-cta">
        <div className="qv3-wrap">
          {past ? (
            <Link href="/#encore" className="qv3-cta qv3-cta--block">이 책, 다시 열고 싶어요</Link>
          ) : closed ? (
            <Link href="/bookclub" className="qv3-cta qv3-cta--block qv3-cta--ink">다른 북클럽 보기</Link>
          ) : !viewer ? (
            <Link href={loginHref} className="qv3-cta qv3-cta--block">{full ? "대기 신청" : "예약하기"}<span className="qv3-cta-sub"> · {full ? "자리가 나면 알려드려요" : soon ? "마감 임박" : "모집 중"}</span></Link>
          ) : full ? (
            <details className="qv3-waitlist">
              <summary className="qv3-cta qv3-cta--block">대기 신청<span className="qv3-cta-sub"> · 자리가 나면 알려드려요</span></summary>
              <div className="qv3-waitlist-body"><NotifyForm clubSlug={session.slug} mode="waitlist" /></div>
            </details>
          ) : (
            <button type="button" className="qv3-cta qv3-cta--block" onClick={() => setSheet(true)}>예약하기<span className="qv3-cta-sub"> · {soon ? "마감 임박" : "모집 중"}</span></button>
          )}
        </div>
      </div>

      {viewer && !past && !closed && (
        <BookingSheet session={session} viewer={viewer} open={sheet} onClose={() => setSheet(false)} onBooked={() => router.refresh()} />
      )}
    </div>
  );
}
