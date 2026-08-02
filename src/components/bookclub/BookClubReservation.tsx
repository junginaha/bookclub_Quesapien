"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { CalendarDays, Check, MapPin, X } from "lucide-react";
import styles from "./BookClubReservation.module.css";

export interface ReservationEvent {
  slug: string;
  bookTitle: string;
  startsAt: string;
  place: string;
  status?: "open" | "closing" | "full" | "closed" | "done";
  nameExample?: string;
}

interface ReservationResult {
  kind: "signup" | "wait";
  position: number | null;
  duplicate?: boolean;
  cancelToken: string;
}

interface StoredReservation extends ReservationResult {
  bookTitle: string;
  startsAt: string;
  place: string;
}

interface Props {
  event: ReservationEvent;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  disabled?: boolean;
  onReserved?: (result: ReservationResult) => void;
  onCanceled?: () => void;
}

type Readiness = "idle" | "checking" | "ready" | "unavailable";

function storageKey(slug: string) {
  return `qb-reservation-v1:${slug}`;
}

function readStored(event: ReservationEvent): StoredReservation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(event.slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredReservation;
    return parsed.cancelToken ? parsed : null;
  } catch {
    return null;
  }
}

function writeStored(event: ReservationEvent, result: ReservationResult) {
  try {
    window.localStorage.setItem(
      storageKey(event.slug),
      JSON.stringify({ ...result, bookTitle: event.bookTitle, startsAt: event.startsAt, place: event.place })
    );
  } catch {
    // 저장소를 쓸 수 없어도 서버 예약은 이미 완료된 상태다.
  }
}

function formatEventDate(input: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(input));
}

export default function BookClubReservation({
  event,
  className,
  style,
  label,
  disabled = false,
  onReserved,
  onCanceled,
}: Props) {
  const titleId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [readiness, setReadiness] = useState<Readiness>("idle");
  const [availability, setAvailability] = useState<"signup" | "wait">(
    event.status === "full" ? "wait" : "signup"
  );
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [subscribe, setSubscribe] = useState(false);
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<StoredReservation | null>(null);

  const checkReadiness = useCallback(async () => {
    const stored = readStored(event);
    if (stored) {
      setResult(stored);
      setReadiness("ready");
      return;
    }

    setReadiness("checking");
    setError("");
    try {
      const response = await fetch(`/api/bookclub/signup?slug=${encodeURIComponent(event.slug)}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        ready?: boolean;
        accepting?: boolean;
        mode?: "signup" | "wait";
        error?: string;
      };
      if (!response.ok || !data.ready || !data.accepting) {
        setReadiness("unavailable");
        setError(data.error ?? "현재 이 모임의 예약을 받을 수 없습니다.");
        return;
      }
      setAvailability(data.mode ?? "signup");
      setReadiness("ready");
      requestAnimationFrame(() => nameRef.current?.focus());
    } catch {
      setReadiness("unavailable");
      setError("예약 시스템에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }, [event]);

  useEffect(() => {
    if (!open) return;
    void checkReadiness();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [checkReadiness, open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || readiness !== "ready") return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/bookclub/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: event.slug,
          name,
          contact,
          privacyAccepted,
          subscribe,
          website,
        }),
      });
      const data = (await response.json()) as Partial<ReservationResult> & { error?: string };
      if (!response.ok || !data.kind || !data.cancelToken) {
        setError(data.error ?? "예약을 처리하지 못했습니다. 다시 시도해 주세요.");
        return;
      }
      const next: ReservationResult = {
        kind: data.kind,
        position: data.position ?? null,
        duplicate: data.duplicate,
        cancelToken: data.cancelToken,
      };
      const stored: StoredReservation = {
        ...next,
        bookTitle: event.bookTitle,
        startsAt: event.startsAt,
        place: event.place,
      };
      writeStored(event, next);
      setResult(stored);
      setAvailability(next.kind);
      onReserved?.(next);
    } catch {
      setError("네트워크 오류가 발생했습니다. 예약 여부를 다시 확인해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!result || canceling) return;
    if (!window.confirm("이 북클럽 예약을 취소할까요?")) return;
    setCanceling(true);
    setError("");
    try {
      const response = await fetch("/api/bookclub/signup", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelToken: result.cancelToken }),
      });
      const data = (await response.json()) as { canceled?: boolean; error?: string };
      if (!response.ok || !data.canceled) {
        setError(data.error ?? "예약을 취소하지 못했습니다.");
        return;
      }
      window.localStorage.removeItem(storageKey(event.slug));
      setResult(null);
      setName("");
      setContact("");
      setPrivacyAccepted(false);
      setSubscribe(false);
      onCanceled?.();
      await checkReadiness();
    } catch {
      setError("네트워크 오류로 취소하지 못했습니다.");
    } finally {
      setCanceling(false);
    }
  };

  const isClosed = disabled || event.status === "closed" || event.status === "done";
  const buttonLabel = label ?? (event.status === "full" ? "대기 예약하기" : "참여 예약하기");

  return (
    <>
      <button
        type="button"
        className={className ?? styles.trigger}
        style={style}
        disabled={isClosed}
        onClick={() => setOpen(true)}
      >
        {isClosed ? "예약 마감" : buttonLabel}
      </button>

      {open && (
        <div className={styles.overlay} role="presentation" onMouseDown={() => setOpen(false)}>
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="예약 창 닫기">
              <X size={18} aria-hidden="true" />
            </button>

            <div className={styles.heading}>
              <p>BOOK CLUB RESERVATION</p>
              <h2 id={titleId}>『{event.bookTitle}』</h2>
              <div className={styles.eventMeta}>
                <span><CalendarDays size={15} aria-hidden="true" />{formatEventDate(event.startsAt)}</span>
                <span><MapPin size={15} aria-hidden="true" />{event.place}</span>
              </div>
            </div>

            {result ? (
              <div className={styles.success}>
                <span className={styles.successIcon}><Check size={22} aria-hidden="true" /></span>
                <h3>{result.kind === "signup" ? "예약이 확정되었습니다." : "대기 예약이 접수되었습니다."}</h3>
                <p>
                  {result.duplicate
                    ? "이미 접수된 예약을 확인했습니다. 새 예약이 추가되지는 않았어요."
                    : result.kind === "signup"
                      ? `${formatEventDate(result.startsAt)}, ${result.place}에서 만나요.`
                      : `현재 대기 ${result.position ?? ""}번입니다. 자리가 생기면 순서대로 확정됩니다.`}
                </p>
                <p className={styles.keepNote}>이 브라우저에서 예약을 다시 열면 확인하거나 취소할 수 있어요.</p>
                {error && <p className={styles.error} role="alert">{error}</p>}
                <div className={styles.successActions}>
                  <button type="button" className={styles.secondaryButton} onClick={handleCancel} disabled={canceling}>
                    {canceling ? "취소 처리 중…" : "예약 취소"}
                  </button>
                  <button type="button" className={styles.primaryButton} onClick={() => setOpen(false)}>확인</button>
                </div>
              </div>
            ) : readiness === "checking" || readiness === "idle" ? (
              <div className={styles.loading} aria-live="polite"><span />예약 가능 여부를 확인하고 있어요.</div>
            ) : readiness === "unavailable" ? (
              <div className={styles.unavailable}>
                <h3>지금은 예약을 열 수 없습니다.</h3>
                <p>{error}</p>
                <button type="button" className={styles.secondaryButton} onClick={checkReadiness}>다시 확인</button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                {availability === "wait" && (
                  <p className={styles.waitNotice}>정원이 찼습니다. 지금 접수하면 대기 순서에 등록됩니다.</p>
                )}

                <label className={styles.field}>
                  <span>이름</span>
                  <input
                    ref={nameRef}
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    minLength={1}
                    maxLength={40}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={`예) ${event.nameExample ?? "지민"}`}
                  />
                </label>

                <label className={styles.field}>
                  <span>연락처</span>
                  <input
                    type="text"
                    name="contact"
                    autoComplete="email tel"
                    inputMode="email"
                    required
                    maxLength={120}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="010-1234-5678 또는 name@email.com"
                  />
                  <small>예약 확인에 사용할 휴대전화 번호 또는 이메일을 입력해 주세요.</small>
                </label>

                <label className={styles.honeypot} aria-hidden="true">
                  웹사이트
                  <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </label>

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    required
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  />
                  <span>
                    예약 처리와 모임 안내를 위한 이름·연락처 수집에 동의합니다. <Link href="/privacy" target="_blank">개인정보처리방침</Link>
                  </span>
                </label>

                <label className={styles.checkbox}>
                  <input type="checkbox" checked={subscribe} onChange={(e) => setSubscribe(e.target.checked)} />
                  <span>다음 북클럽 소식도 받아볼게요. <em>선택</em></span>
                </label>

                {error && <p className={styles.error} role="alert">{error}</p>}

                <button type="submit" className={styles.submit} disabled={submitting || !privacyAccepted}>
                  {submitting ? "예약 처리 중…" : availability === "wait" ? "대기 예약 확정" : "예약 확정"}
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
