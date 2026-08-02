"use client";

import { useEffect, useRef, useState } from "react";
import type { BoardCardData } from "./types";
import {
  badgeText,
  buttonText,
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

type SubmitResult = { kind: "signup" | "wait"; position: number | null };

export default function ClubBoardCard({ club, index }: { club: BoardCardData; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [mine, setMine] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [subscribe, setSubscribe] = useState(true);

  const articleRef = useRef<HTMLElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (readMineSet().has(club.id)) setMine(true);
  }, [club.id]);

  useEffect(() => {
    if (formOpen) nameInputRef.current?.focus();
  }, [formOpen]);

  const isClosed = club.status === "closed";
  const isFull = club.status === "full";
  const badge = badgeText(club.status, club.left, club.waiting);
  const ctaLabel = buttonText(club.status);
  const fill = fillKind(club.status);

  const openForm = () => {
    if (isClosed) return;
    setExpanded(true);
    setFormOpen(true);
  };

  const toggleExpand = () => setExpanded((v) => !v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bookclub/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: club.slug, name, contact, subscribe }),
      });
      const data = (await res.json()) as { kind?: "signup" | "wait"; position?: number | null; error?: string };
      if (!res.ok || !data.kind) {
        setError(data.error ?? "신청 처리 중 오류가 발생했습니다.");
        setSubmitting(false);
        return;
      }
      setResult({ kind: data.kind, position: data.position ?? null });
      setFormOpen(false);
      persistMine(club.id);
      setMine(true);
      requestAnimationFrame(() => {
        articleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setSubmitting(false);
    }
  };

  const paragraphs = club.prose.split(/\n\n+/).filter(Boolean);
  const submitLabel = isFull ? "기다릴게요 →" : "보낼게요 →";

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

          <div className="qb-steps">
            <p className="qb-steps-title">참여는 세 걸음</p>
            <p>하나 · 신청해요</p>
            <p>둘 · 모임 전날, 질문 하나를 보내드려요</p>
            <p>셋 · 그날 아침에 오세요</p>
          </div>

          <div className="qb-subgroup">
            <p>인원에 따라 소그룹으로 나누어 이야기해요.</p>
            <p>모두가 말할 수 있는 크기로 나눕니다.</p>
          </div>

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
                <span>{club.bring || "준비물은 책, 그리고 질문 하나."}</span>
              </div>
              <div className="qb-prep-row">
                <span className="qb-prep-label">신청 마감</span>
                <span>신청은 {formatDeadline(club.closesAt)}까지 받아요</span>
              </div>
            </div>
          </div>

          <div className="qb-unfinished">
            <p>다 읽지 못하셔도 괜찮아요.</p>
            <p>밑줄 한 줄, 궁금증 하나면 충분합니다.</p>
          </div>

          {result ? (
            <div className="qb-done">
              {result.kind === "signup" ? (
                <>
                  <p>
                    {formatFullDateWeekday(club.startsAt)} {formatTimeOfDay(club.startsAt)},{" "}
                    {club.place}에서 만나요.
                  </p>
                  <p>모임 전날 질문 하나를 보내드릴게요.</p>
                </>
              ) : (
                <>
                  <p>{result.position ?? ""}번째로 기다리고 계세요.</p>
                  <p>자리가 나면 순서대로 문자를 드릴게요.</p>
                  <p>하루 안에 답을 못 받으면 다음 분께 넘어가요.</p>
                </>
              )}
            </div>
          ) : (
            <>
              {!formOpen && (
                <div className="qb-cta-row">
                  <button
                    type="button"
                    className={`qb-btn ${fill === "dim" ? "qb-btn--dim" : `qb-btn--fill-${fill}`}`}
                    disabled={isClosed}
                    onClick={openForm}
                  >
                    {ctaLabel}
                    {!isClosed && <span className="qb-arrow">→</span>}
                  </button>
                </div>
              )}

              {formOpen && (
                <form className="qb-form" onSubmit={handleSubmit}>
                  {isFull && <p className="qb-wait-note">자리가 나면 기다리신 순서대로 연락드려요.</p>}

                  <div className="qb-field">
                    <label htmlFor={`qb-name-${club.id}`}>
                      어떻게 불러드릴까요? <em>실명도 별명도 좋아요</em>
                    </label>
                    <input
                      id={`qb-name-${club.id}`}
                      ref={nameInputRef}
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={`예) ${club.nameExample}`}
                    />
                  </div>

                  <div className="qb-field">
                    <label htmlFor={`qb-contact-${club.id}`}>
                      연락받으실 곳을 알려주세요 <em>문자로 안내드려요</em>
                    </label>
                    <input
                      id={`qb-contact-${club.id}`}
                      type="tel"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="010-1234-5678 또는 name@email.com"
                    />
                  </div>

                  <label className="qb-checkbox-row">
                    <input
                      type="checkbox"
                      checked={subscribe}
                      onChange={(e) => setSubscribe(e.target.checked)}
                    />
                    다음 모임 소식도 먼저 받을게요
                  </label>

                  {error && <p style={{ color: "var(--gold)", fontSize: 13 }}>{error}</p>}

                  <div className="qb-cta-row">
                    <button
                      type="submit"
                      className={`qb-btn qb-btn--fill-${isFull ? "gold" : "ink"}`}
                      disabled={submitting}
                    >
                      {submitting ? "보내는 중…" : submitLabel}
                      <span className="qb-arrow">→</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}
