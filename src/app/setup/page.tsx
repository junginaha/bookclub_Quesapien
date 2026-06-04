"use client";

import { useState } from "react";
import Link from "next/link";

const ADMIN_EMAIL = "junginaha@gmail.com";
const ADMIN_PASSWORD = "QSAdmin2026!#";

export default function SetupPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"create" | "reset">("create");

  const handleCreate = async () => {
    setStatus("loading");
    setMessage("");
    try {
      // 1단계: 계정 생성 시도
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: "절대자" }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };

      if (res.status === 409) {
        // 이미 존재 → 비밀번호 재설정 시도
        setMode("reset");
        const res2 = await fetch("/api/admin/setup", { method: "POST" });
        const data2 = await res2.json() as { ok?: boolean; error?: string; message?: string };
        if (res2.ok) {
          setStatus("done");
          setMessage("비밀번호가 재설정됐습니다.");
        } else {
          setStatus("error");
          setMessage(data2.error ?? "비밀번호 재설정 실패. 아래 방법을 시도해주세요.");
        }
        return;
      }

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "계정 생성 실패");
        return;
      }

      setStatus("done");
      setMessage("계정이 성공적으로 생성됐습니다!");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "네트워크 오류");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#1C1F26",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 24px",
    }}>
      <div style={{
        width: "100%", maxWidth: 440,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 20, padding: "40px 36px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 32, fontFamily: "Georgia, serif", color: "#B08A4A", marginBottom: 8 }}>?!</div>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: "#ECE3CF", fontFamily: "Georgia, serif", marginBottom: 4 }}>
            관리자 계정 설정
          </h1>
          <p style={{ fontSize: 13, color: "rgba(236,227,207,0.45)" }}>
            질문하는 사람들 · 절대자 계정 생성
          </p>
        </div>

        {/* 계정 정보 */}
        <div style={{
          background: "rgba(176,138,74,0.1)", border: "1px solid rgba(176,138,74,0.3)",
          borderRadius: 12, padding: "18px 20px", marginBottom: 24,
        }}>
          <p style={{ fontSize: 11.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B08A4A", marginBottom: 12 }}>
            관리자 계정 정보
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "이메일", value: ADMIN_EMAIL },
              { label: "비밀번호", value: ADMIN_PASSWORD },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "rgba(236,227,207,0.5)" }}>{label}</span>
                <code style={{
                  fontSize: 13, color: "#ECE3CF", background: "rgba(0,0,0,0.3)",
                  padding: "3px 10px", borderRadius: 6, letterSpacing: "0.03em",
                  userSelect: "all",
                }}>
                  {value}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* 결과 메시지 */}
        {message && (
          <div style={{
            padding: "12px 16px", borderRadius: 10, marginBottom: 16,
            background: status === "done" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
            border: `1px solid ${status === "done" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
          }}>
            <p style={{ fontSize: 13.5, color: status === "done" ? "#6EE7B7" : "#FCA5A5", margin: 0 }}>
              {status === "done" ? "✓ " : "⚠ "}{message}
            </p>
          </div>
        )}

        {/* 버튼 */}
        {status !== "done" && (
          <button
            onClick={handleCreate}
            disabled={status === "loading"}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, fontSize: 15,
              fontWeight: 600, border: "none", cursor: status === "loading" ? "not-allowed" : "pointer",
              background: status === "loading" ? "rgba(255,255,255,0.1)" : "#B08A4A",
              color: "white", transition: "all 0.2s", marginBottom: 12,
            }}
          >
            {status === "loading" ? "처리 중…" : mode === "reset" ? "비밀번호 재설정" : "관리자 계정 생성"}
          </button>
        )}

        {/* 성공 시 로그인 링크 */}
        {status === "done" && (
          <Link
            href="/login"
            style={{
              display: "block", width: "100%", padding: "14px", borderRadius: 12,
              fontSize: 15, fontWeight: 600, textAlign: "center",
              background: "#B08A4A", color: "white", textDecoration: "none",
              marginBottom: 12,
            }}
          >
            로그인하러 가기 →
          </Link>
        )}

        {/* 이미 로그인 되어있다면 */}
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <Link href="/admin" style={{ fontSize: 12.5, color: "rgba(176,138,74,0.6)", textDecoration: "none" }}>
            관리자 페이지 바로가기
          </Link>
        </div>

        {/* 수동 안내 */}
        {status === "error" && (
          <div style={{
            marginTop: 20, padding: "14px 16px", borderRadius: 10,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <p style={{ fontSize: 12, color: "rgba(236,227,207,0.4)", lineHeight: 1.7, margin: 0 }}>
              자동 생성이 안 된다면:<br />
              1. <a href="/signup" style={{ color: "#B08A4A" }}>/signup</a> 에서 직접 가입<br />
              2. 이메일: {ADMIN_EMAIL}<br />
              3. 비밀번호: {ADMIN_PASSWORD}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
