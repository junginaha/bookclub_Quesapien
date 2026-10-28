"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BookClubSession } from "@/lib/bookclub/types";
import { formatMonthDay, formatTimeOfDay, formatWeekdayFull, isPast } from "@/lib/bookclub/selectors";
import { cancelMyReservation, type MyReservation } from "@/lib/actions/my-bookclub";
import { logoutAction } from "@/lib/actions/auth";
import { DoodleBook } from "@/components/common/Doodle";
import "@/components/home/v3/home-v3.css";
import "./clubs-v3.css";
import "./my-v3.css";

/**
 * 내 북클럽 v3 (MASTER_v3.md §1 /me) — 예약·대기·기다리는 북클럽·지난 모임, 1탭 취소.
 * 비어 있으면 "가까운 곳부터 볼까요?"로 바로 연결(거절 없는 화면).
 */
export default function MyClubsV3({
  name,
  phone,
  reservations,
  sessions,
}: {
  name: string;
  phone: string;
  reservations: MyReservation[];
  sessions: BookClubSession[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const bySlug = new Map(sessions.map((s) => [s.slug, s]));
  const rows = reservations
    .map((r) => ({ r, s: bySlug.get(r.slug) }))
    .filter((x): x is { r: MyReservation; s: BookClubSession } => Boolean(x.s));
  const upcoming = rows.filter(({ r, s }) => !isPast(s) && r.kind !== "interest").sort((a, b) => Date.parse(a.s.startsAt) - Date.parse(b.s.startsAt));
  const waiting = rows.filter(({ r }) => r.kind === "interest");
  const past = rows.filter(({ r, s }) => isPast(s) && r.kind === "confirmed").sort((a, b) => Date.parse(b.s.startsAt) - Date.parse(a.s.startsAt));

  function cancel(slug: string) {
    start(async () => {
      const res = await cancelMyReservation(slug);
      setConfirmSlug(null);
      setMsg(res.ok ? "괜찮아요. 다음에 또 뵈어요." : res.error);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="qv3 qv3-my">
      <header className="qv3-clubs-top">
        <Link href="/" aria-label="홈으로" className="qv3-icon-btn qv3-icon-btn--ghost">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
        </Link>
        <h1 className="qv3-my-title">내 북클럽</h1>
        <span style={{ width: 44 }} aria-hidden="true" />
      </header>

      <main className="qv3-wrap qv3-my-main">
        <section className="qv3-my-hello">
          <h2>{name}님, 안녕하세요.</h2>
          <p>{upcoming.length > 0 ? `다가오는 북클럽이 ${upcoming.length}개. 책갈피 꽂아두셨죠?` : "아직 예약한 북클럽이 없어요. 가까운 곳부터 구경해볼까요?"}</p>
          {!phone && <p className="qv3-my-note">휴대전화를 등록하면 예약이 여기에 모여요. <Link href={`/onboarding/profile?next=${encodeURIComponent("/mypage")}`}>등록하기</Link></p>}
        </section>

        {msg && <p className="qv3-my-msg" role="status">{msg}</p>}

        {upcoming.length > 0 ? (
          <section className="qv3-detail-section" aria-labelledby="my-up">
            <h2 id="my-up">다가오는 북클럽</h2>
            <div className="qv3-my-list">
              {upcoming.map(({ r, s }) => (
                <article key={r.slug} className="qv3-card">
                  <span className={`qv3-chip ${r.kind === "confirmed" ? "qv3-chip--sage" : ""}`}>{r.kind === "confirmed" ? "예약 완료" : "대기 중"}</span>
                  <Link href={`/bookclub/${s.slug}`} className="qv3-q">{s.leadQuestion || s.title}</Link>
                  <span className="qv3-book">{s.bookTitle} · {s.author}</span>
                  <span className="qv3-meta">
                    <span>{formatMonthDay(s.startsAt)} {formatWeekdayFull(s.startsAt)} · {formatTimeOfDay(s.startsAt)}</span>
                    <span className="m2">{s.venue.name}{s.venue.nearestStation ? ` · ${s.venue.nearestStation}` : ""}</span>
                  </span>
                  {r.kind === "confirmed" && (
                    confirmSlug === s.slug ? (
                      <div className="qv3-my-confirm">
                        <span>정말 취소할까요? 자리는 다른 분께 갈 거예요.</span>
                        <div>
                          <button type="button" className="qv3-btn" disabled={pending} onClick={() => cancel(s.slug)}>{pending ? "처리 중…" : "네, 취소할게요"}</button>
                          <button type="button" className="qv3-link-btn" onClick={() => setConfirmSlug(null)}>아니요</button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" className="qv3-link-btn qv3-my-cancel" onClick={() => setConfirmSlug(s.slug)}>예약 취소</button>
                    )
                  )}
                </article>
              ))}
            </div>
          </section>
        ) : (
          <div className="qv3-empty">
            <DoodleBook />
            <strong>책장이 아직 비어 있어요.</strong>
            <p>첫 북클럽은 질문 하나면 충분해요. 가까운 곳부터 볼까요?</p>
            <div className="qv3-empty-actions">
              <Link href="/bookclub?view=map" className="qv3-cta">내 근처 찾기</Link>
              <Link href="/bookclub" className="qv3-btn">전체 보기</Link>
            </div>
          </div>
        )}

        {waiting.length > 0 && (
          <section className="qv3-detail-section" aria-labelledby="my-wait">
            <h2 id="my-wait">함께 열기로 한 북클럽</h2>
            <div className="qv3-my-list">
              {waiting.map(({ s }) => (
                <Link key={s.slug} href="/#encore" className="qv3-next-item">
                  <span className="qv3-next-q">{s.bookTitle}</span>
                  <span className="qv3-next-meta">5명이 모이면 날짜를 함께 정해요</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section className="qv3-detail-section" aria-labelledby="my-past">
            <h2 id="my-past">함께 읽었던 책</h2>
            <div className="qv3-my-list">
              {past.map(({ s }) => (
                <Link key={s.slug} href={`/bookclub/${s.slug}`} className="qv3-next-item">
                  <span className="qv3-next-q">{s.bookTitle}</span>
                  <span className="qv3-next-meta">{formatMonthDay(s.startsAt)} · {s.venue.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="qv3-my-account" aria-label="계정">
          <Link href={`/onboarding/profile?next=${encodeURIComponent("/mypage")}`} className="qv3-my-row">프로필 수정 <span>이름 · 휴대전화 · 관심 지역</span></Link>
          <form action={logoutAction}><button type="submit" className="qv3-my-row qv3-my-row--btn">로그아웃</button></form>
          <Link href="/mypage/legacy" className="qv3-my-row qv3-my-row--quiet">질문 DNA · 후기 · 탈퇴</Link>
        </section>
      </main>
    </div>
  );
}
