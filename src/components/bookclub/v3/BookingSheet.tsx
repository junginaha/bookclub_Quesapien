"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import type { BookClubSession } from "@/lib/bookclub/types";
import { seatsLeft } from "@/lib/bookclub/types";
import { dateKey, feeLabel, formatMonthDay, formatTimeOfDay, formatWeekdayFull, seatNotice, seatKind } from "@/lib/bookclub/selectors";
import { applyToBookClub } from "@/lib/actions/bookclub";
import type { Viewer } from "@/lib/viewer";
import { DoodleFace } from "@/components/common/Doodle";

/**
 * 예약 바텀시트 (MASTER_v3.md §5) — 로그인 사용자 전용.
 * 이름·전화는 프로필에서 가져와 미리 채운다. 비어 있으면 그때만 묻는다.
 * 완료 화면은 풀스크린 테라코타 — "다정함"의 핵심 장면.
 */

declare global {
  interface Window {
    PayApp?: {
      setDefault: (key: string, value: string) => void;
      setParam: (key: string, value: string) => void;
      payrequest: () => void;
    };
  }
}

type Done = { kind: "confirmed" | "just_filled_waitlisted" | "duplicate" };

function icsFor(s: BookClubSession) {
  const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const body = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Qsapiens//Bookclub//KO", "BEGIN:VEVENT",
    `UID:${s.slug}@qsapiens.com`, `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(s.startsAt)}`, `DTEND:${fmt(s.endsAt)}`,
    `SUMMARY:${esc(`${s.bookTitle} 북클럽 · 질문하는 사람들`)}`,
    `LOCATION:${esc([s.venue.name, s.venue.address].filter(Boolean).join(" · "))}`,
    `DESCRIPTION:${esc(s.leadQuestion || s.title)}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
}

export default function BookingSheet({
  session,
  viewer,
  open,
  onClose,
  onBooked,
}: {
  session: BookClubSession;
  viewer: Viewer;
  open: boolean;
  onClose: () => void;
  onBooked?: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const nameId = useId();
  const phoneId = useId();
  const consentId = useId();
  const [name, setName] = useState(viewer.name);
  const [phone, setPhone] = useState(viewer.phone);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  const fee = session.fee;
  const feeText = session.feeLabelOverride ?? feeLabel(fee);
  const valid = name.trim().length > 0 && phone.replace(/\D/g, "").length >= 9 && consent;
  const left = seatsLeft(session);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await applyToBookClub({ clubSlug: session.slug, name, phone, email: viewer.email, note: "", website });
      if (!res.ok) { setError(res.error); return; }
      setDone({ kind: res.kind });
      onBooked?.();
    } finally {
      setSubmitting(false);
    }
  }

  function pay() {
    if (!window.PayApp || fee <= 0) return;
    window.PayApp.setDefault("userid", "onedaybooks");
    window.PayApp.setDefault("shopname", "질문하는 사람들");
    window.PayApp.setParam("goodname", session.title);
    window.PayApp.setParam("price", String(fee));
    window.PayApp.setParam("recvphone", phone.replace(/\D/g, ""));
    window.PayApp.setParam("memo", "북클럽 참여비");
    window.PayApp.setParam("var1", session.slug);
    window.PayApp.setParam("smsuse", "n");
    window.PayApp.setParam("redirectpay", "1");
    window.PayApp.setParam("skip_cstpage", "y");
    window.PayApp.setParam("openpaytype", "card,kakaopay,naverpay,tosspay,applepay,rbank");
    window.PayApp.payrequest();
  }

  const when = `${formatMonthDay(session.startsAt)} ${formatWeekdayFull(session.startsAt)}`;
  const firstName = name.trim() || viewer.name;
  // 카드 번호·도장 날짜는 모임 날짜에서 그대로 끌어온다(임의 번호를 만들지 않는다).
  const cardDate = dateKey(session.startsAt);
  const cardNo = cardDate.replace(/-/g, "");
  const stampDate = cardDate.replace(/-/g, ".");
  const waitlisted = done?.kind === "just_filled_waitlisted";
  const stampLabel = waitlisted ? "대기 접수" : "예약 완료";
  const place = session.venue.nearestStation || session.venue.address || session.venue.detail || "자세한 위치는 모임 전에 안내드려요";

  return (
    <dialog ref={ref} className={`qv3 qv3-sheet${done ? " is-done" : ""}`} onClose={onClose} aria-labelledby="qv3-sheet-title">
      {done ? (
        <div className="qv3-done">
          <button type="button" className="qv3-done-close" aria-label="닫기" onClick={onClose}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <div className="qv3-done-body">
            <span className="qv3-done-kicker">Card Issued</span>
            {done.kind === "confirmed" && (
              <>
                <h2 id="qv3-sheet-title">{firstName}님,<br />{when}에 뵙겠습니다.</h2>
                <p>책은 어디까지 읽어오셔도 괜찮아요.<br />질문 하나와 편한 신발이면 충분합니다.</p>
              </>
            )}
            {done.kind === "just_filled_waitlisted" && (
              <>
                <h2 id="qv3-sheet-title">{firstName}님, 방금 자리가 다 차서<br />대기로 모셨어요.</h2>
                <p>자리가 나는 대로 가장 먼저 알려드릴게요.</p>
              </>
            )}
            {done.kind === "duplicate" && (
              <>
                <h2 id="qv3-sheet-title">{firstName}님,<br />이미 예약돼 있어요.</h2>
                <p>{when}에 뵙겠습니다. 두 번 예약하신 마음, 잘 받았어요.</p>
              </>
            )}
            <div className="qv3-libcard">
              <span className="qv3-libcard-punch" aria-hidden="true" />
              <span className="qv3-libcard-no">NO. {cardNo}</span>
              <b className="qv3-libcard-title">{session.bookTitle}</b>
              <span className="qv3-libcard-sub">{session.author} · {when} {formatTimeOfDay(session.startsAt)}</span>
              <div className="qv3-libcard-row">
                <span className="qv3-libcard-label" aria-hidden="true">BORROWER</span>
                <span className="qv3-libcard-name">{firstName}</span>
              </div>
              <div className="qv3-libcard-place">{session.venue.name} · {place}</div>
              <div className="qv3-stamp" role="img" aria-label={`${stampLabel} ${stampDate}`}>
                <span className="qv3-stamp-brand" aria-hidden="true">QSAPIENS</span>
                <b aria-hidden="true">{stampLabel}</b>
                <i aria-hidden="true" />
                <span className="qv3-stamp-date" aria-hidden="true">{stampDate}</span>
              </div>
            </div>
          </div>
          <div className="qv3-done-actions">
            {fee > 0 && done.kind === "confirmed" && (
              <>
                <Script src="https://lite.payapp.kr/public/api/v2/payapp-lite.js" strategy="afterInteractive" />
                <button type="button" className="qv3-done-primary" onClick={pay}>참여비 {fee.toLocaleString("ko-KR")}원 결제하기</button>
                <small className="qv3-done-note">카드 · 카카오페이 · 네이버페이 · 토스페이 · 애플페이 · 계좌이체 · 결제 전까지 자리는 임시로 잡아둬요</small>
              </>
            )}
            {fee <= 0 || done.kind !== "confirmed" ? (
              <a className="qv3-done-primary" href={icsFor(session)} download={`${session.slug}.ics`}>캘린더에 추가</a>
            ) : (
              <a className="qv3-done-secondary" href={icsFor(session)} download={`${session.slug}.ics`}>캘린더에 추가</a>
            )}
            <Link href="/guide" className="qv3-done-link">처음 오시나요? 안내 보기</Link>
          </div>
        </div>
      ) : (
        <form className="qv3-sheet-form" onSubmit={submit} aria-label="예약하기">
          <span className="qv3-sheet-handle" aria-hidden="true" />
          <div className="qv3-sheet-head">
            <h2 id="qv3-sheet-title">{when} · {formatTimeOfDay(session.startsAt)}</h2>
            <p>{session.venue.name} · <DoodleFace kind={left > 0 ? seatKind(session) : "full"} />{left > 0 ? ` ${seatNotice(session)}` : " 대기 접수"} · {feeText}</p>
          </div>

          <div className="qv3-field">
            <label htmlFor={nameId}>이름</label>
            <div className="qv3-input-row">
              <input id={nameId} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
              {viewer.name && name === viewer.name && <span className="qv3-chip">이미 알고 있었어요</span>}
            </div>
          </div>
          <div className="qv3-field">
            <label htmlFor={phoneId}>휴대전화 <small>모임 안내용</small></label>
            <div className="qv3-input-row">
              <input id={phoneId} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" placeholder="010-0000-0000" required />
              {viewer.phone && phone === viewer.phone && <span className="qv3-chip">이미 알고 있었어요</span>}
            </div>
          </div>
          <label className="qv3-consent" htmlFor={consentId}>
            <input id={consentId} type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
            <span>
              <b>[필수]</b> 이름·휴대전화를 모임 안내{fee > 0 ? "와 결제·환불 확인" : ""} 목적으로 수집·이용합니다. 목적을 이루면 파기합니다.{" "}
              <a href="/privacy" target="_blank" rel="noreferrer">자세히</a>
              {fee > 0 ? <> · <a href="/terms#refund" target="_blank" rel="noreferrer">환불 규정</a></> : null}
            </span>
          </label>
          <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />

          <button type="submit" className="qv3-cta" disabled={!valid || submitting}>
            {submitting ? "확인 중…" : left > 0 ? "예약 완료" : "대기 신청"}
          </button>
          {error && <p className="qv3-error" role="alert">{error}</p>}
          <p className="qv3-sheet-foot">{fee > 0 ? "예약 후 결제로 이어져요 · 환불은 3일 전 전액, 전날까지 50%" : "못 오시게 되면 미리 알려주세요. 다음에 또 뵈어요"}</p>
          <button type="button" className="qv3-sheet-cancel" onClick={onClose}>조금 더 생각해볼게요</button>
        </form>
      )}
    </dialog>
  );
}
