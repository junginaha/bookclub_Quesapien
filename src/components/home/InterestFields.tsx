"use client";

import { useEffect, useId, useRef, useState } from "react";

export const METHOD_OPTIONS = [
  { value: "sms", label: "휴대폰 문자" },
  { value: "kakao", label: "카카오톡" },
  { value: "call", label: "전화" },
] as const;

export const MEMO_MAX = 500;

export type InterestValues = { name: string; method: string; phone: string; memo: string; consent: boolean };

export const EMPTY_INTEREST: InterestValues = { name: "", method: "sms", phone: "", memo: "", consent: false };

export function interestValid(v: InterestValues) {
  return v.name.trim().length > 0 && v.phone.replace(/\D/g, "").length >= 9 && v.consent && v.memo.length <= MEMO_MAX;
}

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

/** 이름 · 답변 받을 방법 · 답변 받을 전화번호 · 남기실 말(말로 입력) · [필수] 동의 */
export default function InterestFields({
  values,
  onChange,
}: {
  values: InterestValues;
  onChange: (v: InterestValues) => void;
}) {
  const ids = { name: useId(), method: useId(), phone: useId(), memo: useId(), consent: useId() };
  const set = (patch: Partial<InterestValues>) => onChange({ ...values, ...patch });

  // 말로 입력 — 브라우저가 지원할 때만 버튼을 보여준다
  const [canSpeak, setCanSpeak] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const memoRef = useRef(values.memo);
  memoRef.current = values.memo;
  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    setCanSpeak(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => recRef.current?.stop();
  }, []);
  function toggleVoice() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "ko-KR";
    rec.interimResults = false;
    rec.continuous = false;
    const base = memoRef.current;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0]?.transcript ?? "").join(" ").trim();
      if (text) onChange({ ...values, memo: (base ? base + " " : "") + text });
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  return (
    <>
      <div className="qif-field">
        <label htmlFor={ids.name}>이름</label>
        <input id={ids.name} className="qif-input" value={values.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" maxLength={80} required />
      </div>
      <div className="qif-field">
        <label htmlFor={ids.method}>답변 받을 방법</label>
        <select id={ids.method} className="qif-select" value={values.method} onChange={(e) => set({ method: e.target.value })}>
          {METHOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="qif-field">
        <label htmlFor={ids.phone}>답변 받을 전화번호</label>
        <input
          id={ids.phone}
          className="qif-input"
          value={values.phone}
          onChange={(e) => set({ phone: e.target.value })}
          placeholder="전화번호를 입력해 주세요"
          autoComplete="tel"
          inputMode="tel"
          required
        />
      </div>
      <div className="qif-field">
        <label htmlFor={ids.memo}>남기실 말 (선택)</label>
        <textarea
          id={ids.memo}
          className="qif-textarea"
          value={values.memo}
          onChange={(e) => set({ memo: e.target.value.slice(0, MEMO_MAX) })}
          placeholder="편안하게 알려주세요."
          maxLength={MEMO_MAX}
        />
      </div>
      <div className="qif-meta">
        {canSpeak && (
          <button type="button" className="qif-voice" onClick={toggleVoice} aria-pressed={listening}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0M12 17v5" />
            </svg>
            {listening ? "듣는 중… 누르면 멈춰요" : "말로 입력"}
          </button>
        )}
        <span className="qif-count">{values.memo.length.toLocaleString("ko-KR")} / {MEMO_MAX.toLocaleString("ko-KR")}자</span>
      </div>
      <label className="qif-consent" htmlFor={ids.consent}>
        <input id={ids.consent} type="checkbox" checked={values.consent} onChange={(e) => set({ consent: e.target.checked })} required />
        <span>(필수) 개인정보 수집·이용에 동의합니다.</span>
      </label>
      <p className="qif-note">
        이름·답변 방법·전화번호·남기신 말은 북토크 개설 안내에만 사용하고, 목적을 이루면 파기합니다. <a href="/privacy" target="_blank" rel="noreferrer">자세히</a>
      </p>
    </>
  );
}
