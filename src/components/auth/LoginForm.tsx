"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginErr) {
        if (loginErr.message.includes("Invalid login")) {
          setError("이메일 또는 비밀번호가 맞지 않아요.");
        } else if (loginErr.message.includes("Email not confirmed")) {
          setError("이메일 인증이 필요해요. 받은편지함을 확인해주세요.");
        } else {
          setError(loginErr.message);
        }
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("로그인 중 오류가 발생했어요. 다시 시도해주세요.");
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

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
          이메일
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
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <label style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
            비밀번호
          </label>
          <Link href="/signup" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>
            계정이 없으신가요?
          </Link>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••"
          required
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
        {loading ? "로그인 중…" : "로그인"}
      </button>

      <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--muted)", margin: 0, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
        처음이신가요?{" "}
        <Link href="/signup" style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>
          회원가입
        </Link>
      </p>
    </form>
  );
}
