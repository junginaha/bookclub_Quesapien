"use client";

import { useEffect, useRef, useState } from "react";
import { registerInterest } from "@/lib/actions/bookclub";
import { interestCopy } from "@/lib/bookclub/interest";
import InterestFields, { EMPTY_INTEREST, interestValid, type InterestValues } from "./InterestFields";
import "./interest-form.css";

/** "읽고 싶어요" 신청서 — 모달. 제목은 책 이름(협업 문구 없음). */
export default function InterestDialog({
  clubSlug,
  bookTitle,
  open,
  onClose,
  onDone,
}: {
  clubSlug: string;
  bookTitle: string;
  open: boolean;
  onClose: () => void;
  onDone?: (count?: number) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<InterestValues>(EMPTY_INTEREST);
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ kind: string; count?: number } | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!interestValid(values) || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await registerInterest({ clubSlug, ...values, website });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDone({ kind: res.kind, count: res.count });
      onDone?.(res.count);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog ref={ref} className="qif-dialog" onClose={onClose} aria-labelledby={`qif-title-${clubSlug}`}>
      <div className="qif-inner">
        <div className="qif-head">
          <h2 className="qif-title" id={`qif-title-${clubSlug}`}>『{bookTitle}』</h2>
          <button type="button" className="qif-close" onClick={onClose} aria-label="닫기">×</button>
        </div>
        {done ? (
          <>
            <p className="qif-done">
              {done.kind === "duplicate" ? "이미 신청하셨어요. 남기신 내용은 새로 고쳐 두었어요." : "신청을 받았어요."}
              <br />
              {interestCopy(done.count ?? 0)}
            </p>
            <button type="button" className="qif-submit" onClick={onClose}>닫기</button>
          </>
        ) : (
          <>
            <p className="qif-lead">이 책을 함께 읽고 싶으시면 남겨주세요. 책친구들이 모이면 알려드려요.</p>
            <form className="qif-form" onSubmit={submit}>
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
              <button type="submit" className="qif-submit" disabled={!interestValid(values) || submitting}>
                {submitting ? "보내는 중…" : "신청하기"}
              </button>
              {error && <p className="qif-error" role="alert">{error}</p>}
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}
