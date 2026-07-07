"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import PrivacyConsentGate from "./PrivacyConsentGate";

const inp: React.CSSProperties = {
  width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 15,
  border: "1.5px solid var(--line-soft)", background: "rgba(255,255,255,0.7)",
  color: "var(--ink)", outline: "none", boxSizing: "border-box",
  fontFamily: "var(--font-noto-sans-kr), sans-serif", transition: "border-color .2s",
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 1.5C4.31 1.5.5 4.51.5 8.22c0 2.4 1.58 4.5 3.96 5.7-.17.63-.63 2.31-.72 2.67-.11.44.16.44.34.32.14-.09 2.25-1.53 3.16-2.15.55.08 1.13.12 1.76.12 4.69 0 8.5-3.01 8.5-6.72S13.69 1.5 9 1.5z"
        fill="#000000"
        fillOpacity="0.85"
      />
    </svg>
  );
}

export default function SignupForm() {
  const [tab, setTab] = useState<"google" | "email">("google");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [error, setError] = useState("");
  const [consented, setConsented] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const pwStrength = !password ? null
    : password.length < 6 ? "weak"
    : password.length < 8 ? "fair"
    : "strong";

  const handleGoogle = async () => {
    if (!consented) { setError("개인정보처리방침 및 이용약관에 동의해주세요."); return; }
    setGoogleLoading(true);
    setError("");
    const supabase = createClient();
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?consent=1` },
    });
    if (oauthErr) {
      setError("Google 로그인을 사용할 수 없어요. 이메일로 가입해주세요.");
      setGoogleLoading(false);
    }
  };

  const handleKakao = async () => {
    if (!consented) { setError("개인정보처리방침 및 이용약관에 동의해주세요."); return; }
    setKakaoLoading(true);
    setError("");
    const supabase = createClient();
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${window.location.origin}/auth/callback?consent=1` },
    });
    if (oauthErr) {
      setError("카카오 로그인을 사용할 수 없어요. Supabase 대시보드에서 카카오 공급자를 활성화해주세요.");
      setKakaoLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!consented) { setError("개인정보처리방침 및 이용약관에 동의해주세요."); return; }
    if (password.length < 8) { setError("비밀번호는 8자 이상이어야 해요."); return; }
    setLoading(true);
    try {
      // 서버 API로 즉시 가입 (이메일 확인 불필요)
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, consent: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "가입에 실패했어요.");
        return;
      }
      // 즉시 로그인
      const supabase = createClient();
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      });
      if (loginErr) { setError("가입은 됐어요. 이제 로그인해주세요."); router.push("/login"); return; }
      // 신규 가입은 프로필 온보딩(닉네임/전화번호/관심지역)부터 — Kakao/Google 흐름과 동일하게 맞춘다
      router.push(`/onboarding/profile?next=${encodeURIComponent(next.startsWith("/") ? next : "/")}&nickname=${encodeURIComponent(name || email.split("@")[0])}`);
      router.refresh();
    } catch {
      setError("가입 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  const oauthDisabled = !consented;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PrivacyConsentGate checked={consented} onChange={setConsented} />

      {/* 카카오 버튼 — Quesapience 2.0 M0 기본 가입 수단 */}
      <button
        onClick={handleKakao}
        disabled={kakaoLoading || oauthDisabled}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          width: "100%", padding: "12px 0", borderRadius: 10, fontSize: 15,
          background: "#FEE500", border: "1.5px solid #FEE500",
          cursor: kakaoLoading || oauthDisabled ? "not-allowed" : "pointer",
          color: "rgba(0,0,0,0.85)", fontFamily: "var(--font-noto-sans-kr), sans-serif",
          fontWeight: 600, transition: "box-shadow .2s, filter .2s",
          boxShadow: "0 1px 4px rgba(0,0,0,.06)",
          opacity: kakaoLoading || oauthDisabled ? 0.5 : 1,
        }}
        onMouseEnter={(e) => { if (!oauthDisabled) (e.currentTarget as HTMLElement).style.filter = "brightness(0.96)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = "none"; }}
      >
        <KakaoIcon />
        {kakaoLoading ? "연결 중…" : "카카오로 계속하기"}
      </button>

      {/* 구글 버튼 (항상 표시) */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading || oauthDisabled}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          width: "100%", padding: "12px 0", borderRadius: 10, fontSize: 15,
          background: "white", border: "1.5px solid var(--line)",
          cursor: googleLoading || oauthDisabled ? "not-allowed" : "pointer",
          color: "var(--ink)", fontFamily: "var(--font-noto-sans-kr), sans-serif",
          fontWeight: 500, transition: "box-shadow .2s, border-color .2s",
          boxShadow: "0 1px 4px rgba(0,0,0,.06)",
          opacity: googleLoading || oauthDisabled ? 0.5 : 1,
        }}
        onMouseEnter={(e) => { if (!oauthDisabled) { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,.12)"; (e.currentTarget as HTMLElement).style.borderColor = "#ccc"; } }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,.06)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; }}
      >
        <GoogleIcon />
        {googleLoading ? "연결 중…" : "Google로 계속하기"}
      </button>

      {/* 구분선 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: "var(--line-soft)" }} />
        <span style={{ fontSize: 12, color: "var(--muted)" }}>또는 이메일로</span>
        <div style={{ flex: 1, height: 1, background: "var(--line-soft)" }} />
      </div>

      {/* 이메일 폼 */}
      {tab === "google" ? (
        <button
          onClick={() => setTab("email")}
          style={{ fontSize: 13.5, color: "var(--ink-soft)", background: "none", border: "1px solid var(--line-soft)", borderRadius: 10, padding: "10px 0", cursor: "pointer", fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}
        >
          이메일로 가입하기
        </button>
      ) : (
        <form onSubmit={handleEmailSignup} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="닉네임 (선택, 나중에 변경 가능)" maxLength={20} style={inp}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--line-soft)"; }}
          />
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일" required style={inp}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--line-soft)"; }}
          />
          <div style={{ position: "relative" }}>
            <input
              type={showPw ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 (8자 이상)" required minLength={8}
              style={{ ...inp, paddingRight: 44 }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--line-soft)"; }}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 0, display: "flex" }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {pwStrength && (
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {["weak","fair","strong"].map((l, i) => (
                <div key={l} style={{ flex: 1, height: 3, borderRadius: 99, transition: "background .2s",
                  background: pwStrength === "weak" && i === 0 ? "#EF4444"
                    : pwStrength === "fair" && i <= 1 ? "#F59E0B"
                    : pwStrength === "strong" ? "#10B981"
                    : "var(--line-soft)" }} />
              ))}
              <span style={{ fontSize: 11, color: pwStrength === "weak" ? "#EF4444" : pwStrength === "fair" ? "#F59E0B" : "#10B981", minWidth: 28, textAlign: "right" }}>
                {pwStrength === "weak" ? "약함" : pwStrength === "fair" ? "보통" : "강함"}
              </span>
            </div>
          )}

          {error && (
            <div style={{ padding: "9px 12px", borderRadius: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p style={{ fontSize: 13, color: "#EF4444", margin: 0 }}>{error}</p>
              {error.includes("이미 가입") && (
                <Link href="/login" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", display: "block", marginTop: 4 }}>→ 로그인하러 가기</Link>
              )}
            </div>
          )}

          <button type="submit" disabled={loading || !email || password.length < 8 || oauthDisabled}
            style={{
              padding: "12px 0", borderRadius: 10, fontSize: 15, fontWeight: 600,
              background: loading || !email || password.length < 8 || oauthDisabled ? "var(--line-soft)" : "var(--ink)",
              color: loading || !email || password.length < 8 || oauthDisabled ? "var(--muted)" : "var(--cream-on-dark)",
              border: "none", cursor: loading || !email || password.length < 8 || oauthDisabled ? "not-allowed" : "pointer",
              fontFamily: "var(--font-noto-serif-kr), Georgia, serif", transition: "all .2s",
            }}>
            {loading ? "가입 중…" : "시작하기"}
          </button>
        </form>
      )}

      <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--muted)", margin: 0, fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
        이미 계정이 있으신가요?{" "}
        <Link href="/login" style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>로그인</Link>
      </p>
    </div>
  );
}
