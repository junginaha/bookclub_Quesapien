"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 15,
  border: "1.5px solid var(--line-soft)", background: "rgba(255,255,255,0.7)",
  color: "var(--ink)", outline: "none", boxSizing: "border-box",
  fontFamily: "var(--font-noto-sans-kr), sans-serif",
  transition: "border-color .2s ease",
};

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  const pwStrength = password.length === 0 ? null
    : password.length < 6 ? "weak"
    : password.length < 8 ? "ok"
    : "strong";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("비밀번호는 8자 이상이어야 해요."); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error: signupErr } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: { name: name.trim() || email.split("@")[0] },
        },
      });

      if (signupErr) {
        if (signupErr.message.includes("already registered") || signupErr.message.includes("already been registered")) {
          setError("이미 가입된 이메일이에요.");
        } else if (signupErr.message.includes("weak_password")) {
          setError("더 강한 비밀번호를 사용해주세요.");
        } else {
          setError(signupErr.message);
        }
        return;
      }
      setDone(true);
    } catch {
      setError("가입 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
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

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "rgba(94,70,50,0.08)", display: "flex",
          alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
        }}>
          <Mail size={24} style={{ color: "var(--accent)" }} />
        </div>
        <p style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 17, color: "var(--ink)", marginBottom: 10, fontWeight: 500 }}>
          이메일을 확인해주세요
        </p>
        <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.7, marginBottom: 24 }}>
          <strong style={{ color: "var(--ink)" }}>{email}</strong>로<br />
          인증 링크를 보냈어요. 클릭하면 바로 시작할 수 있어요.
        </p>
        <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 12 }}>
          메일이 오지 않으면 스팸함을 확인하거나
        </p>
        {resent ? (
          <p style={{ fontSize: 13, color: "var(--accent)" }}>✓ 재전송됐어요.</p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, color: "var(--accent)", background: "none",
              border: "1px solid var(--line)", borderRadius: 9999,
              padding: "7px 16px", cursor: "pointer", transition: "all .2s",
            }}
          >
            <RefreshCw size={13} style={{ animation: resending ? "spin 1s linear infinite" : "none" }} />
            {resending ? "재전송 중…" : "인증 메일 재전송"}
          </button>
        )}
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 24 }}>
          이미 인증 완료하셨나요?{" "}
          <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>
            로그인
          </Link>
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
          닉네임 <span style={{ opacity: 0.5 }}>(선택 · 나중에 변경 가능)</span>
        </label>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="익명도 괜찮아요" maxLength={20} style={inputStyle}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--line-soft)"; }}
        />
      </div>

      <div>
        <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
          이메일 *
        </label>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="hello@example.com" required style={inputStyle}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--line-soft)"; }}
        />
      </div>

      <div>
        <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
          비밀번호 * <span style={{ opacity: 0.5 }}>(8자 이상)</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPw ? "text" : "password"}
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" required minLength={8}
            style={{ ...inputStyle, paddingRight: 44 }}
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
        {/* 비밀번호 강도 표시 */}
        {pwStrength && (
          <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
            {["weak", "ok", "strong"].map((level, i) => (
              <div key={level} style={{
                flex: 1, height: 3, borderRadius: 99,
                background: pwStrength === "weak" && i === 0 ? "#EF4444"
                  : pwStrength === "ok" && i <= 1 ? "#F59E0B"
                  : pwStrength === "strong" ? "#10B981"
                  : "var(--line-soft)",
                transition: "background .2s",
              }} />
            ))}
            <span style={{ fontSize: 11, color: pwStrength === "weak" ? "#EF4444" : pwStrength === "ok" ? "#F59E0B" : "#10B981", marginLeft: 4, minWidth: 30 }}>
              {pwStrength === "weak" ? "약함" : pwStrength === "ok" ? "보통" : "강함"}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p style={{ fontSize: 13, color: "#EF4444", margin: 0 }}>{error}</p>
          {error.includes("이미 가입") && (
            <Link href="/login" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", display: "block", marginTop: 4 }}>
              → 로그인하러 가기
            </Link>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !email || !password || password.length < 8}
        style={{
          padding: "13px 0", borderRadius: 9999, fontSize: 15, fontWeight: 600,
          background: loading || !email || password.length < 8 ? "var(--line-soft)" : "var(--ink)",
          color: loading || !email || password.length < 8 ? "var(--muted)" : "var(--cream-on-dark)",
          border: "none", cursor: loading || !email || password.length < 8 ? "not-allowed" : "pointer",
          fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
          transition: "all .2s ease", marginTop: 4,
        }}
      >
        {loading ? "가입 중…" : "시작하기"}
      </button>

      <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
        가입하면{" "}
        <span style={{ color: "var(--ink-soft)" }}>개인정보 처리방침</span>에 동의하는 것으로 간주됩니다.
      </p>

      <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--muted)", margin: 0, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
        이미 계정이 있으신가요?{" "}
        <Link href="/login" style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>
          로그인
        </Link>
      </p>
    </form>
  );
}
