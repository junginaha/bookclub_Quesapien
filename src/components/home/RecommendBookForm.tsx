"use client";

import { useId, useState } from "react";
import { recommendBook } from "@/lib/actions/bookclub";
import { interestCopy } from "@/lib/bookclub/interest";
import InterestFields, { EMPTY_INTEREST, interestValid, type InterestValues } from "./InterestFields";
import "./interest-form.css";

/** 함께 읽고 싶은 책 추천하기 — 책 제목·저자 + "읽고 싶어요"와 같은 신청서 형식 */
export default function RecommendBookForm() {
  const titleId = useId();
  const authorId = useId();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [values, setValues] = useState<InterestValues>(EMPTY_INTEREST);
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ kind: string; count?: number; title: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const valid = title.trim().length > 0 && interestValid(values);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await recommendBook({ title, author, ...values, website });
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
      <div className="qif-inline" role="status">
        <p className="qif-done">
          『{done.title}』 {done.kind === "joined" ? "추천을 받았어요." : "이미 추천하셨어요."}
          <br />
          {interestCopy(done.count ?? 0)}
        </p>
        <button
          type="button"
          className="qif-submit"
          onClick={() => {
            setDone(null);
            setTitle("");
            setAuthor("");
            setValues((v) => ({ ...v, memo: "" }));
          }}
        >
          다른 책도 추천하기
        </button>
      </div>
    );
  }

  return (
    <form className="qif-inline qif-form" onSubmit={handleSubmit} aria-label="함께 읽고 싶은 책 추천하기">
      <div className="qif-field">
        <label htmlFor={titleId}>책 제목</label>
        <input id={titleId} className="qif-input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} required />
      </div>
      <div className="qif-field">
        <label htmlFor={authorId}>저자 (선택)</label>
        <input id={authorId} className="qif-input" value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={60} />
      </div>
      <InterestFields values={values} onChange={setValues} />
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      <button type="submit" className="qif-submit" disabled={!valid || submitting}>
        {submitting ? "보내는 중…" : "이 책 추천하기"}
      </button>
      {error && <p className="qif-error" role="alert">{error}</p>}
    </form>
  );
}
