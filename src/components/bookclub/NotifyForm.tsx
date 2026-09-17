"use client";

import { useId, useState } from "react";
import { joinBookClubWaitlist } from "@/lib/actions/bookclub";
import { Button } from "@/components/ui/button";

/** bookclub_waitlist 저장용 폼 — 대기자 등록/알림 신청(clubSlug=null이면 전체 알림). */
export default function NotifyForm({
  clubSlug,
  mode,
}: {
  clubSlug: string | null;
  mode: "notify" | "waitlist";
}) {
  const nameId = useId();
  const phoneId = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ kind: "joined" | "duplicate" } | { error: string } | null>(null);

  const valid = name.trim().length > 0 && phone.trim().length >= 9;

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
      setResult({ kind: res.kind });
      if (res.kind !== "duplicate") {
        setName("");
        setPhone("");
      }
    } finally {
      setSubmitting(false);
    }
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
      aria-label={mode === "waitlist" ? "대기자 등록" : "알림 받기"}
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
        {submitting ? "확인 중…" : mode === "waitlist" ? "대기자로 등록" : "알림 받기"}
      </Button>
      {result && "error" in result && <p className="qc-notify-status" style={{ color: "#9B4A2E" }}>{result.error}</p>}
    </form>
  );
}
