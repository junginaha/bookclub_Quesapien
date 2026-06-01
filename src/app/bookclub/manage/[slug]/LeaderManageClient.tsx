"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink, ArrowLeft, Save } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function LeaderManageClient({ club, isAdmin }: { club: any; isAdmin: boolean }) {
  const [joinUrl, setJoinUrl] = useState<string>(club.join_url ?? "");
  const [hostIntro, setHostIntro] = useState<string>(club.host_intro ?? "");
  const [maxParticipants, setMaxParticipants] = useState<number>(club.max_participants ?? 8);
  const [currentParticipants, setCurrentParticipants] = useState<number>(club.current_participants ?? 0);
  const [status, setStatus] = useState<string>(club.status ?? "active");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError("");
    try {
      const res = await fetch(`/api/book-clubs/${club.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          join_url: joinUrl.trim() || null,
          host_intro: hostIntro.trim() || null,
          max_participants: maxParticipants,
          current_participants: currentParticipants,
          status,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "저장 실패"); }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    if (joinUrl) {
      navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 9, fontSize: 14,
    border: "1px solid var(--line-soft)", background: "rgba(255,255,255,0.7)",
    color: "var(--ink)", outline: "none", fontFamily: "var(--font-noto-sans-kr), sans-serif",
    boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px clamp(20px, 4vw, 48px) 120px" }}>

      {/* 헤더 */}
      <Link href={`/bookclub/${club.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)", textDecoration: "none", marginBottom: 32 }}>
        <ArrowLeft size={14} /> {club.title}으로 돌아가기
      </Link>

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>
          리더 관리 {isAdmin && <span style={{ color: "var(--accent)" }}>· 관리자</span>}
        </div>
        <h1 style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 28, fontWeight: 400, color: "var(--ink)", lineHeight: 1.3 }}>
          {club.title}
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

        {/* 잼잼링크 — 결제/신청 링크 */}
        <section style={{ padding: "28px", borderRadius: 16, border: "1px solid var(--line-soft)", background: "rgba(255,255,255,0.5)" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>
            결제·신청 링크 (잼잼링크)
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>
            잼잼링크에서 생성한 결제 URL을 붙여넣으세요. 참여자가 &ldquo;참여하기&rdquo;를 누르면 이 링크로 이동해요.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="url"
              value={joinUrl}
              onChange={(e) => setJoinUrl(e.target.value)}
              placeholder="https://jamjamlink.com/... 링크를 붙여넣어 주세요"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="button"
              onClick={copyLink}
              disabled={!joinUrl}
              title="링크 복사"
              style={{
                padding: "10px 14px", borderRadius: 9, flexShrink: 0,
                background: copied ? "var(--accent)" : "var(--bg-soft)",
                color: copied ? "white" : "var(--muted)",
                border: "1px solid var(--line-soft)", cursor: joinUrl ? "pointer" : "not-allowed",
                transition: "all .2s ease", display: "flex", alignItems: "center", gap: 5, fontSize: 13,
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "복사됨" : "복사"}
            </button>
            {joinUrl && (
              <a
                href={joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="링크 열기"
                style={{
                  padding: "10px 14px", borderRadius: 9, flexShrink: 0,
                  background: "var(--bg-soft)", color: "var(--muted)",
                  border: "1px solid var(--line-soft)", display: "flex", alignItems: "center", gap: 5, fontSize: 13,
                  textDecoration: "none", transition: "background .2s ease",
                }}
              >
                <ExternalLink size={14} /> 확인
              </a>
            )}
          </div>
          {joinUrl && (
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>
              참여자는 이 링크로 이동하며, 결제 및 신청은 잼잼링크에서 처리돼요.
            </p>
          )}
          {!joinUrl && (
            <p style={{ fontSize: 12, color: "#F59E0B", marginTop: 10 }}>
              링크가 없으면 참여자에게 &ldquo;신청 링크 준비 중이에요.&rdquo;가 표시돼요.
            </p>
          )}
        </section>

        {/* 리더 소개 */}
        <section style={{ padding: "28px", borderRadius: 16, border: "1px solid var(--line-soft)", background: "rgba(255,255,255,0.5)" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>
            리더 소개
          </div>
          <textarea
            value={hostIntro}
            onChange={(e) => setHostIntro(e.target.value)}
            placeholder="참여자들에게 보여질 리더 소개를 적어주세요."
            rows={3}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}
          />
        </section>

        {/* 모집 현황 */}
        <section style={{ padding: "28px", borderRadius: 16, border: "1px solid var(--line-soft)", background: "rgba(255,255,255,0.5)" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>
            모집 현황
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>최대 인원</label>
              <input type="number" min={1} max={50} value={maxParticipants} onChange={(e) => setMaxParticipants(Number(e.target.value))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>현재 신청</label>
              <input type="number" min={0} value={currentParticipants} onChange={(e) => setCurrentParticipants(Number(e.target.value))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>모집 상태</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...inputStyle }}>
                <option value="active">모집 중</option>
                <option value="upcoming">오픈 예정</option>
                <option value="closed">마감</option>
              </select>
            </div>
          </div>
        </section>

        {/* 저장 */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "13px 32px", borderRadius: 9999, fontSize: 14.5, fontWeight: 500,
              background: "var(--ink)", color: "var(--cream-on-dark)",
              border: "none", cursor: saving ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
              transition: "opacity .2s", opacity: saving ? 0.6 : 1,
            }}
          >
            <Save size={15} />
            {saving ? "저장 중…" : "저장하기"}
          </button>
          {saved && <span style={{ fontSize: 13.5, color: "var(--accent)", fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>저장됐어요.</span>}
          {error && <span style={{ fontSize: 13, color: "#EF4444" }}>{error}</span>}
        </div>

      </div>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
