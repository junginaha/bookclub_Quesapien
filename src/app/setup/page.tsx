"use client";

import { useState } from "react";
import Link from "next/link";

const ADMIN_EMAIL = "junginaha@gmail.com";

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
  const [forceStatus, setForceStatus] = useState<"idle"|"loading"|"done"|"error">("idle");
  const [forceMsg, setForceMsg] = useState("");

  // ── 관리자 계정 생성/재설정 ──────────────────────────────────
  // EMERGENCY HOTFIX(docs/PROJECT_AUDIT.md 참고): 이 페이지가 하드코딩된 비밀번호로
  // 공개 /api/auth/signup을 자동 호출하던 방식은 보안 취약점이었다(누구나 브라우저
  // 번들에서 비밀번호를 읽어 동일 계정을 직접 생성/탈취할 수 있었음). 이제 계정
  // 부트스트랩/재설정은 서버에서 x-admin-key(SUPABASE_SERVICE_ROLE_KEY)를 아는
  // 사람만 curl 등으로 /api/admin/setup을 호출해야 한다 — 브라우저 버튼으로는
  // 안전하게 재현할 수 없으므로 의도적으로 제거했다.
  const handleAccount = () => {
    setAccountStatus("error");
    setAccountMsg("보안 강화로 이 버튼은 비활성화됐어요. 서버에서 x-admin-key 헤더로 /api/admin/setup을 직접 호출하세요.");
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

  // ── 강제 삭제 (ilike DB 검색) ────────────────────────────────
  const handleForceDelete = async () => {
    setForceStatus("loading"); setForceMsg("");
    try {
      const res = await fetch("/api/admin/force-delete");
      const data = await res.json() as { ok?: boolean; message?: string; deleted_count?: number; error?: string };
      if (!res.ok) { setForceStatus("error"); setForceMsg(data.error ?? "실패"); return; }
      setForceStatus("done"); setForceMsg(data.message ?? `${data.deleted_count}건 삭제 완료`);
    } catch { setForceStatus("error"); setForceMsg("네트워크 오류"); }
  };

  // ── 중복 정리 ────────────────────────────────────────────────
  const handleDedup = async () => {
    setDedupStatus("loading"); setDedupMsg("");
    try {
      // /api/admin/cleanup POST — 서비스 롤, 인증 불필요
      const res = await fetch("/api/admin/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json() as { ok?: boolean; message?: string; answersDeleted?: number; questionsDeleted?: number; error?: string };
      if (!res.ok || data.error) { setDedupStatus("error"); setDedupMsg(data.error ?? "실패"); return; }
      setDedupStatus("done");
      setDedupMsg(data.message ?? `중복 답변 ${data.answersDeleted}개, 중복 질문 ${data.questionsDeleted}개 삭제됐어요.`);
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
          <p style={{ fontSize:12, color:"rgba(236,227,207,0.5)", lineHeight:1.7, marginBottom:14, padding:"10px 14px", background:"rgba(0,0,0,0.25)", borderRadius:8 }}>
            보안 강화로 비밀번호는 이 페이지에 표시되지 않습니다. 서버에서
            <code style={{ margin: "0 4px" }}>ADMIN_BOOTSTRAP_PASSWORD</code>
            환경변수를 임시로 설정한 뒤, <code style={{ margin: "0 4px" }}>x-admin-key</code> 헤더(서비스 롤 키)를 포함해
            <code style={{ margin: "0 4px" }}>/api/admin/setup</code>을 직접 호출하세요.
          </p>
          <button style={btn("#B08A4A")} onClick={handleAccount} disabled={accountStatus==="loading"}>
            {accountStatus==="loading" ? "처리 중…" : accountStatus==="done" ? "✓ 완료" : "계정 생성 / 비밀번호 재설정 안내 보기"}
          </button>
          <StatusBadge s={accountStatus} msg={accountMsg} />
          {accountStatus==="done" && (
            <Link href="/login" style={{ display:"block", textAlign:"center", fontSize:13, color:"#B08A4A", marginTop:8 }}>
              → 로그인 페이지로
            </Link>
          )}
        </div>

        {/* 0. 강제 즉시 삭제 (최우선) */}
        <div style={{ ...card, border: "1px solid rgba(239,68,68,0.5)", background: "rgba(239,68,68,0.06)" }}>
          <p style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"#EF4444", marginBottom:8 }}>
            ⚡ 강제 즉시 삭제 (DB ilike 검색)
          </p>
          <p style={{ fontSize:12, color:"rgba(236,227,207,0.4)", lineHeight:1.6, marginBottom:12 }}>
            박상현·에겐남 포함 내용, 캐나다 법률, ICT교육, 상공회의소, 에스트로겐, 사랑이란... 등<br/>
            <strong style={{ color:"rgba(239,68,68,0.8)" }}>질문·답변 테이블 모두 ilike로 즉시 삭제</strong>
          </p>
          <button style={{ ...btn("#EF4444"), fontWeight:700, fontSize:15 }} onClick={handleForceDelete} disabled={forceStatus==="loading"}>
            {forceStatus==="loading" ? "삭제 중…" : forceStatus==="done" ? "✓ 삭제 완료" : "⚡ 지금 즉시 강제 삭제"}
          </button>
          <StatusBadge s={forceStatus} msg={forceMsg} />
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

        {/* 전체 한번에 실행 */}
        <div style={{ ...card, background: "rgba(176,138,74,0.08)", border: "1px solid rgba(176,138,74,0.25)" }}>
          <p style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"#B08A4A", marginBottom:8 }}>
            🚀 전체 한번에 실행
          </p>
          <button
            style={btn("#B08A4A")}
            onClick={async () => {
              await handleAccount();
              await handleForceDelete();
              await handleCleanup();
              await handleDedup();
            }}
          >
            계정 생성 + 스팸 삭제 + 중복 정리 한번에
          </button>
        </div>

        {/* 관리자 페이지 / 사이트 링크 */}
        <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:8 }}>
          <Link href="/admin" style={{ fontSize:13, color:"rgba(176,138,74,0.7)", textDecoration:"none" }}>관리자 페이지 →</Link>
          <Link href="/" style={{ fontSize:13, color:"rgba(236,227,207,0.4)", textDecoration:"none" }}>메인으로 →</Link>
          <Link href="/questions" style={{ fontSize:13, color:"rgba(236,227,207,0.4)", textDecoration:"none" }}>질문 페이지 →</Link>
        </div>

      </div>
    </div>
  );
}
