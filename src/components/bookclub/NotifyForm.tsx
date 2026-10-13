"use client";

import { useId, useState } from "react";
import { joinBookClubWaitlist } from "@/lib/actions/bookclub";
import { Button } from "@/components/ui/button";

/** bookclub_waitlist 저장용 폼 — 대기자 등록/알림 신청(clubSlug=null이면 전체 알림). */
export default function NotifyForm({
  clubSlug,
  mode,
  genreInterest,
  onJoined,
}: {
  clubSlug: string | null;
  mode: "notify" | "waitlist" | "encore" | "request";
  /** 있으면 "다른 ○○ 북클럽도 알려주세요" 선택 체크를 보여주고, 체크 시 장르 알림에도 등록한다. */
  genreInterest?: { key: string; label: string };
  onJoined?: () => void;
}) {
  const nameId = useId();
  const phoneId = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [alsoGenre, setAlsoGenre] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ kind: "joined" | "duplicate" } | { error: string } | null>(null);

  const valid = name.trim().length > 0 && phone.trim().length >= 9;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await joinBookClubWaitlist({ clubSlug, name, phone, website });
      if (!res.ok) {
        setResult({ error: res.error });
        return;
      }
      setResult({ kind: res.kind });
      if (res.kind === "joined") onJoined?.();
      if (genreInterest && alsoGenre) {
        await joinBookClubWaitlist({ clubSlug: genreInterest.key, name, phone, website });
      }
      if (res.kind !== "duplicate") {
        setName("");
        setPhone("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (result && "kind" in result) {
    return (
      <p className="qc-notify-status">
        {result.kind === "joined"
          ? mode === "encore"
            ? "대기 명단에 올렸어요. 5명이 모이면 일정을 안내드릴게요."
            : mode === "request"
              ? "요청을 받았어요. 같은 책을 원하는 분이 5명 모이면 북클럽을 엽니다."
            : mode === "waitlist"
              ? "대기자로 등록했어요. 자리가 나면 안내드릴게요."
              : "알림을 등록했어요."
          : "이미 등록하셨어요."}
      </p>
    );
  }

  return (
    <form
      className="qc-notify-form"
      onSubmit={handleSubmit}
      aria-label={mode === "request" ? "책 요청하기" : mode === "encore" ? "함께 기다리기" : mode === "waitlist" ? "대기자 등록" : "알림 받기"}
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
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      {genreInterest && (
        <label style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: 12 }}>
          <input type="checkbox" checked={alsoGenre} onChange={(e) => setAlsoGenre(e.target.checked)} style={{ marginTop: 2, width: "auto" }} />
          다른 {genreInterest.label} 북클럽이 열려도 알려주세요
        </label>
      )}
      {(mode === "encore" || mode === "request") && (
        <p style={{ margin: 0, fontSize: 11, color: "var(--muted)" }}>모임 안내 연락에만 사용합니다.</p>
      )}
      <Button type="submit" variant="outline" className="w-full" disabled={!valid || submitting} aria-disabled={!valid || submitting}>
        {submitting ? "확인 중…" : mode === "encore" ? "대기 명단에 올리기" : mode === "request" ? "이 책 요청하기" : mode === "waitlist" ? "대기자로 등록" : "알림 받기"}
      </Button>
      {result && "error" in result && <p className="qc-notify-status" style={{ color: "#9B4A2E" }}>{result.error}</p>}
    </form>
  );
}
