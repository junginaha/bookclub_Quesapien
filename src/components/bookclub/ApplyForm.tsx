"use client";

import { useId, useState } from "react";
import { applyToBookClub } from "@/lib/actions/bookclub";
import { Button } from "@/components/ui/button";

/**
 * bookclub_applications 저장용 신청 폼. 서버(apply_to_bookclub RPC)가 정원을
 * 다시 세고 원자적으로 확정/대기 여부를 정한다 — 클라이언트 숫자로 판단하지 않는다.
 */
export default function ApplyForm({ clubSlug }: { clubSlug: string }) {
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const noteId = useId();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState(""); // 허니팟
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<
    { kind: "confirmed" | "just_filled_waitlisted" | "duplicate" } | { error: string } | null
  >(null);

  const valid = name.trim().length > 0 && phone.trim().length >= 9;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await applyToBookClub({ clubSlug, name, phone, email, note, website });
      if (!res.ok) {
        setResult({ error: res.error });
        return;
      }
      setResult({ kind: res.kind });
      if (res.kind !== "duplicate") {
        setName("");
        setPhone("");
        setEmail("");
        setNote("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (result && "kind" in result) {
    if (result.kind === "confirmed") {
      return <p className="qd-form-msg">자리를 확인했어요. 신청이 완료됐어요.</p>;
    }
    if (result.kind === "just_filled_waitlisted") {
      return <p className="qd-form-msg">방금 마감되었어요. 대기자로 등록해 드렸어요, 자리가 나면 안내드릴게요.</p>;
    }
    if (result.kind === "duplicate") {
      return <p className="qd-form-msg">이미 신청하셨어요.</p>;
    }
  }

  return (
    <form className="qd-form" onSubmit={handleSubmit} data-club-slug={clubSlug} aria-label="참가 신청">
      <div className="qd-field">
        <label htmlFor={nameId}>이름</label>
        <input id={nameId} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
      </div>
      <div className="qd-field">
        <label htmlFor={phoneId}>휴대전화</label>
        <input id={phoneId} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" required />
      </div>
      <div className="qd-field">
        <label htmlFor={emailId}>이메일 (선택)</label>
        <input id={emailId} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </div>
      <div className="qd-field">
        <label htmlFor={noteId}>전하고 싶은 말 (선택)</label>
        <textarea id={noteId} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
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
      <Button
        type="submit"
        variant="primary"
        className="self-start max-[480px]:self-stretch max-[480px]:w-full"
        disabled={!valid || submitting}
        aria-disabled={!valid || submitting}
      >
        {submitting ? "확인 중…" : "자리 보기"}
      </Button>
      {result && "error" in result && <p className="qd-form-msg is-error">{result.error}</p>}
    </form>
  );
}
