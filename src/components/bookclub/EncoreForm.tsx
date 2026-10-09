"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { ENCORE_THRESHOLD } from "@/lib/bookclub/selectors";
import styles from "./encore-form.module.css";

type Channel = "email" | "sms" | "call";
const CHANNELS: Array<{ value: Channel; label: string }> = [
  { value: "email", label: "이메일" },
  { value: "sms", label: "문자" },
  { value: "call", label: "전화" },
];
const DONE_KEY = (slug: string) => `qs_encore_${slug}`;

/**
 * "다시 함께 읽어요" 신청 폼 — 홈 섹션·북클럽 상세 공용.
 * 실제 저장 API(/api/bookclub/encore)만 사용하고, 성공 응답의 count만 화면에 반영한다.
 */
export default function EncoreForm({
  slug,
  bookTitle,
  onCount,
  compact = false,
}: {
  slug: string;
  bookTitle: string;
  onCount?: (count: number) => void;
  compact?: boolean;
}) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [channel, setChannel] = useState<Channel>("sms");
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem(DONE_KEY(slug)) === "1") setDone(true); } catch { /* storage 차단 */ }
  }, [slug]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage(""); setIsError(false);
    try {
      const res = await fetch("/api/bookclub/encore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubSlug: slug, notifyChannel: channel, contactValue: contact, name, privacyConsent: consent }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "신청을 저장하지 못했어요.");
      setDone(true); setOpen(false); setMessage(json.message ?? "신청이 접수되었습니다.");
      if (typeof json.count === "number") onCount?.(json.count);
      try { localStorage.setItem(DONE_KEY(slug), "1"); } catch { /* storage 차단 */ }
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "네트워크 오류가 발생했어요.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className={styles.done} role="status">
        {message || "함께 읽기 신청을 남기셨어요."}
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" className={`${styles.trigger}${compact ? ` ${styles.compact}` : ""}`} onClick={() => setOpen(true)} aria-expanded={false}>
        다시 함께 읽기 신청
      </button>
    );
  }

  const isEmail = channel === "email";
  return (
    <form className={styles.form} onSubmit={submit} aria-label={`『${bookTitle}』 다시 함께 읽기 신청`}>
      <fieldset className={styles.channels}>
        <legend>{ENCORE_THRESHOLD}명이 모이면 어떻게 알려드릴까요?</legend>
        <div className={styles.channelRow}>
          {CHANNELS.map((c) => (
            <label key={c.value} className={styles.channel}>
              <input type="radio" name={`${uid}-channel`} value={c.value} checked={channel === c.value} onChange={() => setChannel(c.value)} />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className={styles.field}>
        <span>{isEmail ? "이메일" : "휴대전화"}</span>
        <input
          type={isEmail ? "email" : "tel"}
          inputMode={isEmail ? "email" : "tel"}
          autoComplete={isEmail ? "email" : "tel"}
          required
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={isEmail ? "you@email.com" : "010-1234-5678"}
          maxLength={254}
        />
      </label>
      <label className={styles.field}>
        <span>이름 <small>(선택)</small></span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="name" />
      </label>
      <label className={styles.consent}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
        <span>재개설 안내를 위한 연락처 수집·이용에 동의합니다. 안내 후 파기합니다.</span>
      </label>
      {message && <p className={isError ? styles.error : styles.done} role={isError ? "alert" : "status"}>{message}</p>}
      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={() => setOpen(false)}>닫기</button>
        <button type="submit" className={styles.submit} disabled={busy || !consent || !contact.trim()}>
          {busy ? "보내는 중…" : "신청 보내기"}
        </button>
      </div>
    </form>
  );
}
