"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const match = password && confirm && password === confirm;
  const valid = password.length >= 8 && match;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("비밀번호는 8자 이상이어야 해요."); return; }
    if (!match) { setError("비밀번호가 일치하지 않아요."); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) { setError(err.message); return; }
      setDone(true);
      setTimeout(() => router.push("/"), 2500);
    } catch {
      setError("오류가 발생했어요. 링크가 만료되었을 수 있어요.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <CheckCircle size={28} style={{ color: "#10B981" }} />
        </div>
        <p style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 17, color: "var(--ink)", marginBottom: 10, fontWeight: 500 }}>
          비밀번호가 변경됐어요
        </p>
        <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.7 }}>
          잠시 후 홈으로 이동합니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
          새 비밀번호 <span style={{ opacity: 0.5 }}>(8자 이상)</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPw ? "text" : "password"}
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" required minLength={8}
            style={{
              width: "100%", padding: "12px 44px 12px 16px", borderRadius: 10, fontSize: 15,
              border: "1.5px solid var(--line-soft)", background: "rgba(255,255,255,0.7)",
              color: "var(--ink)", outline: "none", boxSizing: "border-box",
              fontFamily: "var(--font-noto-sans-kr), sans-serif", transition: "border-color .2s ease",
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--line-soft)"; }}
          />
          <button type="button" onClick={() => setShowPw(!showPw)}
            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 0, display: "flex" }}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
          비밀번호 확인
        </label>
        <input
          type={showPw ? "text" : "password"}
          value={confirm} onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••" required
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 15,
            border: `1.5px solid ${confirm ? (match ? "#10B981" : "#EF4444") : "var(--line-soft)"}`,
            background: "rgba(255,255,255,0.7)", color: "var(--ink)", outline: "none",
            boxSizing: "border-box", fontFamily: "var(--font-noto-sans-kr), sans-serif",
            transition: "border-color .2s ease",
          }}
        />
        {confirm && !match && (
          <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4, marginBottom: 0 }}>비밀번호가 일치하지 않아요.</p>
        )}
      </div>

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p style={{ fontSize: 13, color: "#EF4444", margin: 0 }}>{error}</p>
        </div>
      )}

      <button
        type="submit" disabled={loading || !valid}
        style={{
          padding: "13px 0", borderRadius: 9999, fontSize: 15, fontWeight: 600,
          background: loading || !valid ? "var(--line-soft)" : "var(--ink)",
          color: loading || !valid ? "var(--muted)" : "var(--cream-on-dark)",
          border: "none", cursor: loading || !valid ? "not-allowed" : "pointer",
          fontFamily: "var(--font-noto-serif-kr), Georgia, serif", transition: "all .2s ease",
        }}
      >
        {loading ? "변경 중…" : "비밀번호 변경"}
      </button>
    </form>
  );
}
