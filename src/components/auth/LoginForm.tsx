"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 15,
  border: "1.5px solid var(--line-soft)", background: "rgba(255,255,255,0.7)",
  color: "var(--ink)", outline: "none", boxSizing: "border-box",
  fontFamily: "var(--font-noto-sans-kr), sans-serif",
  transition: "border-color .2s ease",
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setNeedsVerify(false);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (loginErr) {
        if (loginErr.message.includes("Invalid login credentials") || loginErr.message.includes("invalid_credentials")) {
          setError("이메일 또는 비밀번호가 맞지 않아요.");
        } else if (loginErr.message.includes("Email not confirmed") || loginErr.message.includes("email_not_confirmed")) {
          setNeedsVerify(true);
        } else if (loginErr.message.includes("Too many")) {
          setError("잠시 후 다시 시도해주세요. (로그인 시도 횟수 초과)");
        } else {
          setError(loginErr.message);
        }
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("로그인 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const supabase = createClient();
      await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setResent(true);
    } catch { /* ignore */ } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 콜백 에러 메시지 */}
      {callbackError === "auth_callback_error" && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p style={{ fontSize: 13, color: "#EF4444", margin: 0 }}>
            인증 링크가 만료됐거나 유효하지 않아요. 다시 로그인해주세요.
          </p>
        </div>
      )}

      <div>
        <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
          이메일
        </label>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="hello@example.com" required style={inputStyle}
          autoComplete="email"
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--line-soft)"; }}
        />
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "baseline" }}>
          <label style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
            비밀번호
          </label>
          <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none", transition: "color .15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
          >
            비밀번호를 잊으셨나요?
          </Link>
        </div>
        <div style={{ position: "relative" }}>
          <input
            type={showPw ? "text" : "password"}
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" required style={{ ...inputStyle, paddingRight: 44 }}
            autoComplete="current-password"
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--line-soft)"; }}
          />
          <button
            type="button" onClick={() => setShowPw(!showPw)}
            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 0, display: "flex" }}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* 이메일 미인증 안내 */}
      {needsVerify && (
        <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(176,138,74,0.08)", border: "1px solid rgba(176,138,74,0.25)" }}>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 8px" }}>
            이메일 인증이 필요해요. 받은편지함을 확인해주세요.
          </p>
          {resent ? (
            <p style={{ fontSize: 12.5, color: "var(--accent)", margin: 0 }}>✓ 인증 메일을 재전송했어요.</p>
          ) : (
            <button
              type="button" onClick={handleResendVerification} disabled={resending}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <RefreshCw size={12} style={{ animation: resending ? "spin 1s linear infinite" : "none" }} />
              {resending ? "재전송 중…" : "인증 메일 재전송"}
            </button>
          )}
        </div>
      )}

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p style={{ fontSize: 13, color: "#EF4444", margin: 0 }}>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !email || !password}
        style={{
          padding: "13px 0", borderRadius: 9999, fontSize: 15, fontWeight: 600,
          background: loading || !email || !password ? "var(--line-soft)" : "var(--ink)",
          color: loading || !email || !password ? "var(--muted)" : "var(--cream-on-dark)",
          border: "none", cursor: loading || !email || !password ? "not-allowed" : "pointer",
          fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
          transition: "all .2s ease", marginTop: 4,
        }}
      >
        {loading ? "로그인 중…" : "로그인"}
      </button>

      <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--muted)", margin: 0, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
        처음이신가요?{" "}
        <Link href="/signup" style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>
          함께하기
        </Link>
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
