"use client";

import { useEffect, useRef, useState } from "react";
import type { BoardCardData } from "./types";
import BookClubReservation from "@/components/bookclub/BookClubReservation";
import {
  badgeText,
  fillKind,
  formatCardDate,
  formatDeadline,
  formatFullDateWeekday,
  formatTimeOfDay,
} from "@/lib/bookclubBoard";

const MINE_STORAGE_KEY = "qb-board-mine-v1";

function readMineSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(MINE_STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function persistMine(id: string) {
  try {
    const set = readMineSet();
    set.add(id);
    window.localStorage.setItem(MINE_STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* localStorage 불가 환경 — 접힘 표시만 이번 세션에서 못 남을 뿐, 신청 자체는 이미 완료됨 */
  }
}

function clearMine(id: string) {
  try {
    const set = readMineSet();
    set.delete(id);
    window.localStorage.setItem(MINE_STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* 시각적 표시만 남을 수 있으며 서버 취소 결과에는 영향이 없다. */
  }
}

type SubmitResult = { kind: "signup" | "wait"; position: number | null };

export default function ClubBoardCard({ club, index }: { club: BoardCardData; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [mine, setMine] = useState(false);

  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (readMineSet().has(club.id)) setMine(true);
  }, [club.id]);

  const isClosed = club.status === "closed";
  const isFull = club.status === "full";
  const badge = badgeText(club.status, club.left, club.waiting);
  const fill = fillKind(club.status);

  const toggleExpand = () => setExpanded((v) => !v);

  const handleReserved = (next: SubmitResult) => {
    setResult(next);
    persistMine(club.id);
    setMine(true);
    requestAnimationFrame(() => {
      articleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const handleCanceled = () => {
    setResult(null);
    clearMine(club.id);
    setMine(false);
  };

  const paragraphs = club.prose.split(/\n\n+/).filter(Boolean);
  return (
    <article
      ref={articleRef}
      className={`qb-club${mine ? " mine" : ""}`}
      style={{ "--qb-delay": `${index * 70}ms` } as React.CSSProperties}
    >
      <div className="qb-club-top">
        <div className="qb-meta-row">
          <span className="qb-date">
            {formatCardDate(club.startsAt)} · {formatTimeOfDay(club.startsAt)}
          </span>
          {badge && <span className="qb-badge">{badge}</span>}
        </div>
        <div className="qb-place">{club.place}</div>
        {club.ask && <p className="qb-ask">{club.ask}</p>}
        <div className="qb-book-title">『{club.bookTitle}』</div>
        {club.bookAuthor && <div className="qb-book-author">{club.bookAuthor}</div>}
      </div>

      {/* DOM 순서상 자세히 버튼(footer)이 펼침 영역보다 먼저 오도록 배치한다 —
          Tab 포커스는 CSS order가 아니라 DOM 순서를 따르므로, 이렇게 해야
          "자세히 → 신청 → 폼" 순서로 Tab만으로 도달할 수 있다. 시각적 순서는
          .qb-club-footer{order:2}/.qb-expand{order:1}로 명세와 동일하게 유지한다. */}
      <div className="qb-club-footer">
        <div className="qb-host">
          <span className="qb-avatar">?!</span>
          <span className="qb-host-name">질문하는 사람들</span>
        </div>
        <button type="button" className="qb-btn qb-btn--outline" onClick={toggleExpand}>
          {expanded ? "접기" : "자세히"}
          <span className="qb-arrow">{expanded ? "↑" : "↓"}</span>
        </button>
      </div>

      {expanded && (
        <div className="qb-expand">
          {paragraphs.length > 0 && (
            <div className="qb-prose">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          {club.questions.length > 0 && (
            <div>
              <p className="qb-section-title">이 질문들로 시작해요</p>
              <ol className="qb-questions-list">
                {club.questions.map((q, i) => (
                  <li key={i}>
                    <span className="qb-q-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="qb-q-text">{q}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {club.who.length > 0 && (
            <div>
              <p className="qb-section-title">이런 분을 기다려요</p>
              <ul className="qb-who-list">
                {club.who.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="qb-section-title">준비</p>
            <div className="qb-prep">
              {club.price != null && (
                <div className="qb-prep-row">
                  <span className="qb-prep-label">참가비</span>
                  <span>
                    {club.price.toLocaleString("ko-KR")}원 — {club.priceNote || "커피와 대화, 전부 포함"}
                  </span>
                </div>
              )}
              <div className="qb-prep-row">
                <span className="qb-prep-label">준비물</span>
                <span>{club.bring || "책, 그리고 질문 하나"}</span>
              </div>
              <div className="qb-prep-row">
                <span className="qb-prep-label">신청 마감</span>
                <span>신청은 {formatDeadline(club.closesAt)}까지 받아요</span>
              </div>
            </div>
          </div>

          {result && (
            <div className="qb-done">
              {result.kind === "signup" ? (
                <>
                  <p>예약이 확정됐어요.</p>
                  <p>{formatFullDateWeekday(club.startsAt)} {formatTimeOfDay(club.startsAt)}, {club.place}에서 만나요.</p>
                </>
              ) : (
                <>
                  <p>대기 {result.position ?? ""}번으로 접수됐어요.</p>
                  <p>자리가 생기면 순서대로 확정됩니다.</p>
                </>
              )}
            </div>
          )}
          <div className="qb-cta-row">
            <BookClubReservation
              event={{
                slug: club.slug,
                bookTitle: club.bookTitle,
                startsAt: club.startsAt,
                place: club.place,
                status: club.status,
                nameExample: club.nameExample,
              }}
              className={`qb-btn ${fill === "dim" ? "qb-btn--dim" : `qb-btn--fill-${fill}`}`}
              label={result ? "예약 확인·취소" : isFull ? "대기 예약하기" : "참여 예약하기"}
              disabled={isClosed}
              onReserved={handleReserved}
              onCanceled={handleCanceled}
            />
          </div>
        </div>
      )}
    </article>
  );
}
