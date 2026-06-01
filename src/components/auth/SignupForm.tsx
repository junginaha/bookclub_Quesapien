"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 해요."); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signupErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name: name.trim() || email.split("@")[0] },
        },
      });

      if (signupErr) {
        if (signupErr.message.includes("already registered")) {
          setError("이미 가입된 이메일이에요. 로그인해 주세요.");
        } else {
          setError(signupErr.message);
        }
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/"), 2000);
    } catch {
      setError("가입 중 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 15,
    border: "1.5px solid var(--line-soft)", background: "rgba(255,255,255,0.7)",
    color: "var(--ink)", outline: "none", boxSizing: "border-box",
    fontFamily: "var(--font-noto-sans-kr), sans-serif",
    transition: "border-color .2s ease",
  };

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>✦</div>
        <p style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 18, color: "var(--ink)", marginBottom: 8 }}>
          환영해요.
        </p>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          이메일 확인 후 로그인해 주세요.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
          닉네임 <span style={{ opacity: 0.5 }}>(선택)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="익명도 괜찮아요"
          maxLength={20}
          style={inputStyle}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--line-soft)"; }}
        />
      </div>

      <div>
        <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
          이메일 *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="hello@example.com"
          required
          style={inputStyle}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--line-soft)"; }}
        />
      </div>

      <div>
        <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
          비밀번호 * <span style={{ opacity: 0.5 }}>(6자 이상)</span>
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••"
          required
          minLength={6}
          style={inputStyle}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--line-soft)"; }}
        />
      </div>

      {error && (
        <p style={{ fontSize: 13, color: "#EF4444", margin: 0 }}>{error}</p>
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
        {loading ? "가입 중…" : "시작하기"}
      </button>

      <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--muted)", margin: 0, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
        이미 계정이 있으신가요?{" "}
        <Link href="/login" style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>
          로그인
        </Link>
      </p>
    </form>
  );
}
