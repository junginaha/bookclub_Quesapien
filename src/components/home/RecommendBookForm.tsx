"use client";

import { useId, useState } from "react";
import { recommendBook } from "@/lib/actions/bookclub";
import { INTEREST_THRESHOLD, interestCopy } from "@/lib/bookclub/interest";
import { ConsentField } from "@/components/bookclub/NotifyForm";
import { Button } from "@/components/ui/button";

/** 함께 읽고 싶은 책 추천하기 — 같은 책을 고른 사람이 5명 모이면 운영자가 연락한다. */
export default function RecommendBookForm() {
  const ids = { title: useId(), author: useId(), name: useId(), phone: useId(), consent: useId() };
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ kind: "joined" | "duplicate"; count?: number; title: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const valid = title.trim().length > 0 && name.trim().length > 0 && phone.trim().length >= 9 && consent;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await recommendBook({ title, author, name, phone, website });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDone({ kind: res.kind, count: res.count, title: title.trim() });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="qc-notify-form" role="status">
        <p className="qc-notify-status">
          『{done.title}』 {done.kind === "joined" ? "추천을 받았어요." : "이미 추천하셨어요."}{" "}
          {done.count != null ? interestCopy(done.count) : `같은 책을 고른 분이 ${INTEREST_THRESHOLD}명이 되면 연락드릴게요.`}
        </p>
        <button
          type="button"
          className="qc-notify-btn is-outline"
          onClick={() => {
            setDone(null);
            setTitle("");
            setAuthor("");
          }}
        >
          다른 책도 추천하기
        </button>
      </div>
    );
  }

  return (
    <form className="qc-notify-form" onSubmit={handleSubmit} aria-label="함께 읽고 싶은 책 추천하기">
      <div>
        <label htmlFor={ids.title}>책 제목 (필수)</label>
        <input id={ids.title} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} required />
      </div>
      <div>
        <label htmlFor={ids.author}>저자</label>
        <input id={ids.author} value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={60} />
      </div>
      <div>
        <label htmlFor={ids.name}>이름</label>
        <input id={ids.name} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
      </div>
      <div>
        <label htmlFor={ids.phone}>휴대전화</label>
        <input id={ids.phone} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" required />
      </div>
      <ConsentField id={ids.consent} checked={consent} onChange={setConsent} />
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      <Button type="submit" className="w-full" disabled={!valid || submitting} aria-disabled={!valid || submitting}>
        {submitting ? "확인 중…" : "이 책 추천하기"}
      </Button>
      {error && <p className="qc-notify-status" style={{ color: "#9B4A2E" }}>{error}</p>}
    </form>
  );
}
