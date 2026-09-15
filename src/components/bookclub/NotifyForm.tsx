"use client";

import { useId, useState } from "react";

/**
 * bookclub_waitlist 저장용 폼(클럽 단위 대기자 등록/알림 신청, clubSlug=null이면
 * "새 모임 열릴 때 안내"). 구조(A·B) 단계 전용 자리표시 — 실제 서버 액션 연결은
 * C 단계 승인 후 진행한다. 지금은 버튼을 비활성화해 저장되지 않았음을 명확히 한다.
 */
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

  const valid = name.trim().length > 0 && phone.trim().length >= 9;

  return (
    <form
      className="qc-notify-form"
      onSubmit={(e) => e.preventDefault()}
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
      <button type="submit" className="qc-notify-btn" disabled={!valid} aria-disabled={!valid}>
        {mode === "waitlist" ? "대기자로 등록" : "알림 받기"}
      </button>
      <p className="qc-notify-status">저장 연결은 다음 단계에서 진행됩니다.</p>
    </form>
  );
}
