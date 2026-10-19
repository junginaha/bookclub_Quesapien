"use client";

import { useId, useState } from "react";
import { joinBookClubWaitlist } from "@/lib/actions/bookclub";
import { Button } from "@/components/ui/button";
import { INTEREST_THRESHOLD, interestCopy } from "@/lib/bookclub/interest";

/** bookclub_waitlist 저장용 폼 — 대기자 등록/알림 신청(clubSlug=null이면 전체 알림). */
export default function NotifyForm({
  clubSlug,
  mode,
}: {
  clubSlug: string | null;
  mode: "notify" | "waitlist" | "interest";
}) {
  const nameId = useId();
  const phoneId = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const consentId = useId();
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ kind: "joined" | "duplicate"; count?: number } | { error: string } | null>(null);

  const valid = name.trim().length > 0 && phone.trim().length >= 9 && (mode !== "interest" || consent);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await joinBookClubWaitlist({ clubSlug, name, phone, website });
      if (!res.ok) {
        setResult({ error: res.error });
        return;
      }
      setResult({ kind: res.kind, count: res.count });
      if (res.kind !== "duplicate") {
        setName("");
        setPhone("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (result && "kind" in result && mode === "interest") {
    return (
      <p className="qc-notify-status">
        {result.kind === "joined" ? "등록했어요. " : "이미 등록하셨어요. "}
        {result.count != null ? interestCopy(result.count) : `${INTEREST_THRESHOLD}명이 모이면 북토크를 열고 알려드려요`}
      </p>
    );
  }

  if (result && "kind" in result) {
    return (
      <p className="qc-notify-status">
        {result.kind === "joined"
          ? mode === "waitlist"
            ? "대기자로 등록했어요. 자리가 나면 안내드릴게요."
            : "알림을 등록했어요."
          : "이미 등록하셨어요."}
      </p>
    );
  }

  return (
    <form
      className="qc-notify-form"
      onSubmit={handleSubmit}
      aria-label={mode === "waitlist" ? "대기자 등록" : mode === "interest" ? "읽고 싶어요 등록" : "알림 받기"}
      data-club-slug={clubSlug ?? "all"}
    >
      <div>
        <label htmlFor={nameId}>이름</label>
        <input id={nameId} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </div>
      <div>
        <label htmlFor={phoneId}>휴대전화</label>
        <input id={phoneId} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" />
      </div>
      {mode === "interest" && <ConsentField id={consentId} checked={consent} onChange={setConsent} />}
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      <Button type="submit" variant="outline" className="w-full" disabled={!valid || submitting} aria-disabled={!valid || submitting}>
        {submitting ? "확인 중…" : mode === "waitlist" ? "대기자로 등록" : mode === "interest" ? "모임 열리면 알림 받기" : "알림 받기"}
      </Button>
      {result && "error" in result && <p className="qc-notify-status" style={{ color: "#9B4A2E" }}>{result.error}</p>}
    </form>
  );
}

/** [필수] 개인정보 동의 — "함께 읽고 싶은 책" 등록용(이름·휴대전화를 모임 개설 연락에만 사용). */
export function ConsentField({ id, checked, onChange }: { id: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="qd-consent">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} required />
      <label htmlFor={id}>
        <strong>[필수] 개인정보 수집·이용 동의</strong> — 이름·휴대전화를 이 책 북토크 개설 연락에만 사용하고, 목적 달성 후 파기합니다. <a href="/privacy" target="_blank" rel="noreferrer">자세히</a>
      </label>
    </div>
  );
}
