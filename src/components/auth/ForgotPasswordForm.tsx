"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/auth/callback?type=recovery&next=/reset-password` }
      );
      if (err) { setError(err.message); return; }
      setDone(true);
    } catch {
      setError("요청 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(94,70,50,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Mail size={24} style={{ color: "var(--accent)" }} />
        </div>
        <p style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 17, color: "var(--ink)", marginBottom: 10, fontWeight: 500 }}>
          이메일을 확인해주세요
        </p>
        <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.7, marginBottom: 24 }}>
          <strong style={{ color: "var(--ink)" }}>{email}</strong>로<br />
          비밀번호 재설정 링크를 보냈어요.<br />
          링크는 1시간 동안 유효해요.
        </p>
        <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 16 }}>스팸함도 확인해보세요.</p>
        <Link href="/login" style={{ fontSize: 13.5, color: "var(--accent)", textDecoration: "none", fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
          ← 로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, lineHeight: 1.65, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
        가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드려요.
      </p>

      <div>
        <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
          이메일
        </label>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="가입한 이메일 주소" required autoComplete="email"
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 15,
            border: "1.5px solid var(--line-soft)", background: "rgba(255,255,255,0.7)",
            color: "var(--ink)", outline: "none", boxSizing: "border-box",
            fontFamily: "var(--font-noto-sans-kr), sans-serif", transition: "border-color .2s ease",
          }}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--line-soft)"; }}
        />
      </div>

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p style={{ fontSize: 13, color: "#EF4444", margin: 0 }}>{error}</p>
        </div>
      )}

      <button
        type="submit" disabled={loading || !email}
        style={{
          padding: "13px 0", borderRadius: 9999, fontSize: 15, fontWeight: 600,
          background: loading || !email ? "var(--line-soft)" : "var(--ink)",
          color: loading || !email ? "var(--muted)" : "var(--cream-on-dark)",
          border: "none", cursor: loading || !email ? "not-allowed" : "pointer",
          fontFamily: "var(--font-noto-serif-kr), Georgia, serif", transition: "all .2s ease",
        }}
      >
        {loading ? "전송 중…" : "재설정 링크 보내기"}
      </button>

      <Link href="/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 13.5, color: "var(--muted)", textDecoration: "none", fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
        <ArrowLeft size={14} /> 로그인으로 돌아가기
      </Link>
    </form>
  );
}
