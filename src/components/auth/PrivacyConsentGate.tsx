"use client";

import Link from "next/link";

// D1.5 ① 법적 필수 — 가입 시 개인정보 수집·이용 동의 체크박스.
// 전화번호는 별도(선택) 동의 항목이며 온보딩(/onboarding/profile)에서 처리한다.
// 이 게이트는 "가입" 시점의 필수 동의(개인정보처리방침·이용약관)만 다룬다.
export default function PrivacyConsentGate({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        fontSize: 12.5,
        color: "var(--muted)",
        cursor: "pointer",
        lineHeight: 1.5,
        fontFamily: "var(--font-noto-sans-kr), sans-serif",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 2, width: 15, height: 15, flexShrink: 0, cursor: "pointer" }}
      />
      <span>
        (필수){" "}
        <Link href="/privacy" target="_blank" style={{ color: "var(--accent)", textDecoration: "underline" }}>
          개인정보처리방침
        </Link>
        {" "}및{" "}
        <Link href="/terms" target="_blank" style={{ color: "var(--accent)", textDecoration: "underline" }}>
          이용약관
        </Link>
        에 동의합니다.
      </span>
    </label>
  );
}
