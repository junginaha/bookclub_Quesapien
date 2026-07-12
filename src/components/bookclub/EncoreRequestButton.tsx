"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { AREA_OPTIONS, TIME_OPTIONS, INTENT_OPTIONS } from "@/lib/bookclub";

interface Props {
  clubSlug: string;
  initialRequested?: boolean;
}

const GUEST_KEY = (slug: string) => `encore_requested_${slug}`;

export default function EncoreRequestButton({ clubSlug, initialRequested = false }: Props) {
  const currentUser = useAppStore((s) => s.currentUser);
  const [requested, setRequested] = useState(() => {
    if (initialRequested) return true;
    if (typeof window !== "undefined") return localStorage.getItem(GUEST_KEY(clubSlug)) === "1";
    return false;
  });
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copy, setCopy] = useState<string>("");

  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email");
  const [contactValue, setContactValue] = useState("");
  const [consent, setConsent] = useState(false);
  const [preferredArea, setPreferredArea] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [participationIntent, setParticipationIntent] = useState("");

  const submit = async (extra?: Record<string, unknown>) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/bookclub/encore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubSlug, ...extra }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "앵콜 요청에 실패했어요.");
        setSaving(false);
        return;
      }
      setRequested(true);
      setFormOpen(false);
      setCopy(json.message ?? "앵콜 요청이 접수되었습니다.\n새 일정이 열리면 가장 먼저 알려드릴게요.");
      if (!currentUser) localStorage.setItem(GUEST_KEY(clubSlug), "1");
    } catch {
      setError("네트워크 오류가 발생했어요.");
    }
    setSaving(false);
  };

  const cancel = async () => {
    setSaving(true);
    try {
      await fetch("/api/bookclub/encore", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubSlug, contactValue: currentUser ? undefined : contactValue }),
      });
      setRequested(false);
      setCopy("");
      if (!currentUser) localStorage.removeItem(GUEST_KEY(clubSlug));
    } catch {
      setError("취소에 실패했어요.");
    }
    setSaving(false);
  };

  if (requested) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
        <button
          type="button"
          disabled={saving}
          onClick={cancel}
          className="btn-pill-neu"
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          앵콜 요청 완료 · 취소
        </button>
        {copy && <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "pre-line" }}>{copy}</span>}
      </div>
    );
  }

  if (currentUser) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
        <button
          type="button"
          disabled={saving}
          onClick={() => submit()}
          className="btn-pill-neu btn-pill-neu-accent"
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          {saving ? "요청 중…" : "앵콜 요청"}
        </button>
        {error && <span style={{ fontSize: 12, color: "#EF4444" }}>{error}</span>}
      </div>
    );
  }

  if (!formOpen) {
    return (
      <button type="button" onClick={() => setFormOpen(true)} className="btn-pill-neu btn-pill-neu-accent">
        앵콜 요청
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!consent || !contactValue.trim()) return;
        submit({ contactMethod, contactValue, privacyConsent: consent, preferredArea, preferredTime, participationIntent });
      }}
      style={{
        display: "flex", flexDirection: "column", gap: 8,
        padding: 16, borderRadius: 12, border: "1px solid var(--line-soft)",
        background: "var(--bg-soft)", maxWidth: 320,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: "flex", gap: 8 }}>
        <label style={{ fontSize: 12.5, display: "flex", alignItems: "center", gap: 4 }}>
          <input type="radio" name={`cm-${clubSlug}`} checked={contactMethod === "email"} onChange={() => setContactMethod("email")} /> 이메일
        </label>
        <label style={{ fontSize: 12.5, display: "flex", alignItems: "center", gap: 4 }}>
          <input type="radio" name={`cm-${clubSlug}`} checked={contactMethod === "phone"} onChange={() => setContactMethod("phone")} /> 전화번호
        </label>
      </div>
      <input
        type={contactMethod === "email" ? "email" : "tel"}
        required
        value={contactValue}
        onChange={(e) => setContactValue(e.target.value)}
        placeholder={contactMethod === "email" ? "you@email.com" : "010-0000-0000"}
        style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13 }}
      />
      <select value={preferredArea} onChange={(e) => setPreferredArea(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13 }}>
        <option value="">선호 지역 (선택)</option>
        {AREA_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      <select value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13 }}>
        <option value="">선호 시간 (선택)</option>
        {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <select value={participationIntent} onChange={(e) => setParticipationIntent(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13 }}>
        <option value="">참여 의향 (선택)</option>
        {INTENT_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
      </select>
      <label style={{ fontSize: 11.5, color: "var(--muted)", display: "flex", gap: 6, alignItems: "flex-start" }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2 }} />
        개인정보 수집·이용에 동의합니다.
      </label>
      {error && <span style={{ fontSize: 12, color: "#EF4444" }}>{error}</span>}
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={() => setFormOpen(false)} style={{ fontSize: 12.5, color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}>취소</button>
        <button type="submit" disabled={saving || !consent || !contactValue.trim()} className="btn-pill-neu btn-pill-neu-accent" style={{ opacity: (!consent || !contactValue.trim()) ? 0.5 : 1 }}>
          {saving ? "요청 중…" : "앵콜 요청 보내기"}
        </button>
      </div>
    </form>
  );
}
