"use client";

import { useId, useState } from "react";

/**
 * bookclub_applications 저장용 신청 폼. 구조(A·B) 단계 전용 — 실제 서버 액션
 * (정원 재검증·중복 방지 포함)은 C 단계 승인 후 연결한다. 지금은 입력·검증만
 * 동작하고 제출은 비활성화해 저장되지 않았음을 명확히 알린다.
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

  const valid = name.trim().length > 0 && phone.trim().length >= 9;

  return (
    <form className="qd-form" onSubmit={(e) => e.preventDefault()} data-club-slug={clubSlug} aria-label="참가 신청">
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
      <button type="submit" className="qd-submit" disabled={!valid} aria-disabled={!valid}>
        자리 보기
      </button>
      <p className="qd-form-msg">저장 연결은 다음 단계에서 진행됩니다.</p>
    </form>
  );
}
