"use client";

import { useId } from "react";
import VoiceDictation from "@/components/common/VoiceDictation";

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
        {/* 알아들은 말은 기존 글 뒤에 붙인다 — 적어둔 것을 지우지 않는다. */}
        <VoiceDictation onText={(text) => set({ memo: (values.memo ? `${values.memo} ${text}` : text).slice(0, MEMO_MAX) })} />
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
