"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

// 이 폼에서만 쓰는 선택지 — 구 lib/bookclub.ts(Phase 1에서 제거)에 있던 것을 이관.
const AREA_OPTIONS = ["강남·서초", "마포·홍대", "종로·광화문", "성수·건대", "온라인", "지역 무관"] as const;
const TIME_OPTIONS = ["평일 저녁", "토요일 오전", "토요일 오후", "일요일 오전", "일요일 오후", "시간 무관"] as const;
const INTENT_OPTIONS = ["일정이 맞으면 참여", "우선 알림 희망", "가격 확인 후 결정"] as const;

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
        <Button type="button" variant="ghost" disabled={saving} onClick={cancel}>
          앵콜 요청 완료 · 취소
        </Button>
        {copy && <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "pre-line" }}>{copy}</span>}
      </div>
    );
  }

  if (currentUser) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
        <Button type="button" variant="primary" disabled={saving} onClick={() => submit()}>
          {saving ? "요청 중…" : "앵콜 요청"}
        </Button>
        {error && <span style={{ fontSize: 12, color: "#EF4444" }}>{error}</span>}
      </div>
    );
  }

  if (!formOpen) {
    return (
      <Button type="button" variant="primary" onClick={() => setFormOpen(true)}>
        앵콜 요청
      </Button>
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
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Button type="button" variant="text" size="sm" onClick={() => setFormOpen(false)}>취소</Button>
        <Button type="submit" variant="primary" disabled={saving || !consent || !contactValue.trim()}>
          {saving ? "요청 중…" : "앵콜 요청 보내기"}
        </Button>
      </div>
    </form>
  );
}
