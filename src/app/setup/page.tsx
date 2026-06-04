"use client";

import { useState } from "react";
import Link from "next/link";

const ADMIN_EMAIL = "junginaha@gmail.com";
const ADMIN_PASSWORD = "QSAdmin2026!#";

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 16, padding: "28px 28px",
  marginBottom: 16,
};

const btn = (color: string): React.CSSProperties => ({
  width: "100%", padding: "12px", borderRadius: 10, fontSize: 14,
  fontWeight: 600, border: "none", cursor: "pointer",
  background: color, color: "white", transition: "opacity 0.2s",
  marginBottom: 8,
});

export default function SetupPage() {
  const [accountStatus, setAccountStatus] = useState<"idle"|"loading"|"done"|"error">("idle");
  const [accountMsg, setAccountMsg] = useState("");
  const [cleanStatus, setCleanStatus] = useState<"idle"|"loading"|"done"|"error">("idle");
  const [cleanMsg, setCleanMsg] = useState("");
  const [dedupStatus, setDedupStatus] = useState<"idle"|"loading"|"done"|"error">("idle");
  const [dedupMsg, setDedupMsg] = useState("");

  // ── 관리자 계정 생성/재설정 ──────────────────────────────────
  const handleAccount = async () => {
    setAccountStatus("loading"); setAccountMsg("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: "절대자" }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (res.status === 409) {
        // 이미 존재 → 비밀번호 재설정
        const r2 = await fetch("/api/admin/setup", { method: "POST" });
        const d2 = await r2.json() as { ok?: boolean; error?: string };
        if (d2.ok) { setAccountStatus("done"); setAccountMsg("비밀번호가 재설정됐어요."); }
        else { setAccountStatus("error"); setAccountMsg(d2.error ?? "재설정 실패"); }
        return;
      }
      if (!res.ok) { setAccountStatus("error"); setAccountMsg(data.error ?? "생성 실패"); return; }
      setAccountStatus("done"); setAccountMsg("계정이 생성됐어요!");
    } catch (e) {
      setAccountStatus("error"); setAccountMsg(e instanceof Error ? e.message : "오류");
    }
  };

  // ── 스팸 데이터 정리 ─────────────────────────────────────────
  const handleCleanup = async () => {
    setCleanStatus("loading"); setCleanMsg("");
    try {
      const res = await fetch("/api/admin/cleanup");
      const data = await res.json() as { message?: string; deleted?: number; error?: string };
      if (!res.ok) { setCleanStatus("error"); setCleanMsg(data.error ?? "실패"); return; }
      setCleanStatus("done"); setCleanMsg(data.message ?? `${data.deleted}개 삭제 완료`);
    } catch { setCleanStatus("error"); setCleanMsg("네트워크 오류"); }
  };

  // ── 중복 정리 ────────────────────────────────────────────────
  const handleDedup = async () => {
    setDedupStatus("loading"); setDedupMsg("");
    try {
      const [r1, r2] = await Promise.all([
        fetch("/api/admin", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({action:"dedup_answers", id:"_"}) }),
        fetch("/api/admin", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({action:"dedup_questions", id:"_"}) }),
      ]);
      const d1 = await r1.json() as { deleted?: number; error?: string };
      const d2 = await r2.json() as { deleted?: number; error?: string };
      if (d1.error || d2.error) { setDedupStatus("error"); setDedupMsg(d1.error ?? d2.error ?? "실패"); return; }
      setDedupStatus("done"); setDedupMsg(`중복 답변 ${d1.deleted}개, 중복 질문 ${d2.deleted}개 삭제됐어요.`);
    } catch { setDedupStatus("error"); setDedupMsg("네트워크 오류"); }
  };

  const StatusBadge = ({ s, msg }: { s: string; msg: string }) => msg ? (
    <p style={{ fontSize: 13, marginTop: 6, marginBottom: 2, padding: "8px 12px", borderRadius: 8,
      background: s==="done"?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)",
      color: s==="done"?"#6EE7B7":"#FCA5A5", border: `1px solid ${s==="done"?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)"}`
    }}>
      {s==="done"?"✓ ":"⚠ "}{msg}
    </p>
  ) : null;

  return (
    <div style={{ minHeight:"100vh", background:"#14181F", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
      <div style={{ width:"100%", maxWidth:460 }}>

        {/* 헤더 */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:28, fontFamily:"Georgia, serif", color:"#B08A4A", marginBottom:6 }}>?!</div>
          <h1 style={{ fontSize:18, fontWeight:500, color:"#ECE3CF", margin:0 }}>관리자 설정 · 절대자</h1>
        </div>

        {/* 1. 계정 생성 */}
        <div style={card}>
          <p style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"#B08A4A", marginBottom:12 }}>
            Step 1 — 관리자 계정
          </p>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14, padding:"10px 14px", background:"rgba(0,0,0,0.25)", borderRadius:8 }}>
            <span style={{ fontSize:12, color:"rgba(236,227,207,0.4)" }}>이메일</span>
            <code style={{ fontSize:12, color:"#ECE3CF", userSelect:"all" }}>{ADMIN_EMAIL}</code>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14, padding:"10px 14px", background:"rgba(0,0,0,0.25)", borderRadius:8 }}>
            <span style={{ fontSize:12, color:"rgba(236,227,206,0.4)" }}>비밀번호</span>
            <code style={{ fontSize:12, color:"#ECE3CF", userSelect:"all" }}>{ADMIN_PASSWORD}</code>
          </div>
          <button style={btn("#B08A4A")} onClick={handleAccount} disabled={accountStatus==="loading"}>
            {accountStatus==="loading" ? "처리 중…" : accountStatus==="done" ? "✓ 완료" : "계정 생성 / 비밀번호 재설정"}
          </button>
          <StatusBadge s={accountStatus} msg={accountMsg} />
          {accountStatus==="done" && (
            <Link href="/login" style={{ display:"block", textAlign:"center", fontSize:13, color:"#B08A4A", marginTop:8 }}>
              → 로그인 페이지로
            </Link>
          )}
        </div>

        {/* 2. 스팸 삭제 */}
        <div style={card}>
          <p style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"#EF4444", marginBottom:8 }}>
            Step 2 — 스팸 데이터 삭제
          </p>
          <p style={{ fontSize:12, color:"rgba(236,227,207,0.4)", lineHeight:1.6, marginBottom:12 }}>
            박상현, 에겐남, 캐나다 법률, ICT교육, 상공회의소, 에스트로겐 등 잘못된 데이터 삭제
          </p>
          <button style={btn("#EF4444")} onClick={handleCleanup} disabled={cleanStatus==="loading"}>
            {cleanStatus==="loading" ? "삭제 중…" : cleanStatus==="done" ? "✓ 삭제 완료" : "스팸 데이터 전체 삭제"}
          </button>
          <StatusBadge s={cleanStatus} msg={cleanMsg} />
        </div>

        {/* 3. 중복 제거 */}
        <div style={card}>
          <p style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"#8B5CF6", marginBottom:8 }}>
            Step 3 — 중복 제거
          </p>
          <p style={{ fontSize:12, color:"rgba(236,227,207,0.4)", lineHeight:1.6, marginBottom:12 }}>
            같은 내용의 중복 질문·답변 자동 정리 (최초 1개 유지)
          </p>
          <button style={btn("#8B5CF6")} onClick={handleDedup} disabled={dedupStatus==="loading"}>
            {dedupStatus==="loading" ? "정리 중…" : dedupStatus==="done" ? "✓ 완료" : "중복 질문·답변 정리"}
          </button>
          <StatusBadge s={dedupStatus} msg={dedupMsg} />
        </div>

        {/* 관리자 페이지 링크 */}
        <div style={{ textAlign:"center", marginTop:8 }}>
          <Link href="/admin" style={{ fontSize:13, color:"rgba(176,138,74,0.6)", textDecoration:"none" }}>
            관리자 페이지 열기 →
          </Link>
        </div>

      </div>
    </div>
  );
}
