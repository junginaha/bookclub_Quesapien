"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { JOURNEY_SLUG, type InterestKind } from "@/lib/journey/hitchhiker";
import styles from "./journey.module.css";

type Channel = "email" | "sms" | "call";
const CHANNELS: Array<{ value: Channel; label: string }> = [
  { value: "sms", label: "문자" },
  { value: "email", label: "이메일" },
  { value: "call", label: "전화" },
];
const KIND_LABEL: Record<InterestKind, string> = {
  journey: "독서여행 참여 의향",
  quiet: "조용히 읽는 모임 관심",
};

export default function JourneyInterest({ scheduleConfirmed, quietOpen }: { scheduleConfirmed: boolean; quietOpen: boolean }) {
  const uid = useId();
  const [counts, setCounts] = useState<Record<InterestKind, number> | null>(null);
  const [kind, setKind] = useState<InterestKind>("journey");
  const [channel, setChannel] = useState<Channel>("sms");
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  const [statusContact, setStatusContact] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>("");

  useEffect(() => {
    let alive = true;
    fetch(`/api/reading-journey/interest?journey=${JOURNEY_SLUG}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (alive && j?.counts) setCounts(j.counts); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // 공지 CTA(#join, data-kind)로 들어오면 해당 종류를 미리 선택.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement | null)?.closest?.("a[data-kind]") as HTMLAnchorElement | null;
      const k = a?.dataset.kind as InterestKind | undefined;
      if (k === "journey" || (k === "quiet" && quietOpen)) setKind(k);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [quietOpen]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/reading-journey/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", journey: JOURNEY_SLUG, kind, notifyChannel: channel, contactValue: contact, name, privacyConsent: consent, website }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "저장하지 못했어요.");
      setMsg({ text: j.message ?? "접수되었습니다.", error: false });
      if (typeof j.count === "number") setCounts((c) => (c ? { ...c, [kind]: j.count } : c));
      setContact(""); setName(""); setConsent(false);
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "네트워크 오류가 발생했어요.", error: true });
    } finally {
      setBusy(false);
    }
  }

  async function checkStatus(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (statusBusy) return;
    setStatusBusy(true); setStatusMsg("");
    try {
      const res = await fetch("/api/reading-journey/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", journey: JOURNEY_SLUG, contactValue: statusContact }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "확인하지 못했어요.");
      setStatusMsg(
        j.found
          ? (j.items as Array<{ kind: InterestKind; label: string }>).map((it) => `${KIND_LABEL[it.kind]}: ${it.label}`).join("\n")
          : "이 연락처로 남긴 기록이 없어요."
      );
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "네트워크 오류가 발생했어요.");
    } finally {
      setStatusBusy(false);
    }
  }

  const isEmail = channel === "email";
  return (
    <div className={styles.join}>
      <div className={styles.joinState}>
        <p className={styles.joinStatus}>
          {scheduleConfirmed ? "정식 신청을 받고 있어요." : "지금은 참여 의향을 받고 있어요. 일시·장소·참가비가 확정되면 정식 신청을 엽니다."}
        </p>
        {counts && (
          <p className={styles.counts} aria-live="polite">
            참여 의향 <strong>{counts.journey}명</strong>
            {quietOpen && <> · 조용히 읽는 모임 관심 <strong>{counts.quiet}명</strong></>}
          </p>
        )}
      </div>

      <form className={styles.form} onSubmit={submit}>
        {quietOpen && (
          <fieldset className={styles.choice}>
            <legend>무엇을 남길까요?</legend>
            <div className={styles.choiceRow2}>
              {(["journey", "quiet"] as InterestKind[]).map((k) => (
                <label key={k}>
                  <input type="radio" name={`${uid}-kind`} checked={kind === k} onChange={() => setKind(k)} />
                  <span>{KIND_LABEL[k]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <fieldset className={styles.choice}>
          <legend>일정이 정해지면 어떻게 알려드릴까요?</legend>
          <div className={styles.choiceRow3}>
            {CHANNELS.map((c) => (
              <label key={c.value}>
                <input type="radio" name={`${uid}-ch`} checked={channel === c.value} onChange={() => setChannel(c.value)} />
                <span>{c.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className={styles.field}>
          <span>{isEmail ? "이메일" : "휴대전화"}</span>
          <input type={isEmail ? "email" : "tel"} inputMode={isEmail ? "email" : "tel"} autoComplete={isEmail ? "email" : "tel"} required maxLength={254}
            value={contact} onChange={(e) => setContact(e.target.value)} placeholder={isEmail ? "you@email.com" : "010-1234-5678"} />
        </label>
        <label className={styles.field}>
          <span>이름 <small>(선택)</small></span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="name" />
        </label>
        <input className={styles.hp} tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} name="website" />
        <label className={styles.consent}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
          <span>일정 안내를 위한 연락처 수집·이용에 동의합니다. 독서여행 종료 후 파기합니다.</span>
        </label>
        {msg && <p className={msg.error ? styles.error : styles.ok} role={msg.error ? "alert" : "status"}>{msg.text}</p>}
        <button className={styles.submit} type="submit" disabled={busy || !consent || !contact.trim()}>
          {busy ? "보내는 중…" : kind === "quiet" ? "조용히 읽는 모임에 관심 표시" : "독서여행 참여 의향 남기기"}
        </button>
      </form>

      <details className={styles.statusBox}>
        <summary>내 신청 상태 확인</summary>
        <form onSubmit={checkStatus} className={styles.statusForm}>
          <label className={styles.field}>
            <span>남기신 이메일 또는 휴대전화</span>
            <input value={statusContact} onChange={(e) => setStatusContact(e.target.value)} required maxLength={254} />
          </label>
          <button className={styles.secondary} type="submit" disabled={statusBusy || !statusContact.trim()}>
            {statusBusy ? "확인 중…" : "확인"}
          </button>
          {statusMsg && <p className={styles.ok} role="status">{statusMsg}</p>}
        </form>
      </details>
    </div>
  );
}
