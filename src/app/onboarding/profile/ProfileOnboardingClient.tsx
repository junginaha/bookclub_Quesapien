"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentPosition } from "@/lib/geo";

const inp: React.CSSProperties = {
  width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 15,
  border: "1.5px solid var(--line-soft)", background: "rgba(255,255,255,0.7)",
  color: "var(--ink)", outline: "none", boxSizing: "border-box",
  fontFamily: "var(--font-noto-sans-kr), sans-serif", transition: "border-color .2s",
};

// M0 온보딩 3탭(카카오 로그인은 이미 완료된 뒤 이 화면) — 닉네임(필수) / 전화번호(선택, 동의 필요) / 관심 지역(선택).
// 완료 기준: 60초 내 마이페이지 도달. 그래서 단일 화면 + 최소 필드로 구성한다.
export default function ProfileOnboardingClient({
  defaultNickname,
  next,
}: {
  defaultNickname: string;
  next: string;
}) {
  const router = useRouter();
  const [nickname, setNickname] = useState(defaultNickname);
  const [phone, setPhone] = useState("");
  const [phoneConsent, setPhoneConsent] = useState(false);
  const [region, setRegion] = useState<{ lat: number; lng: number } | null>(null);
  const [regionLabel, setRegionLabel] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUseLocation = async () => {
    setGeoLoading(true);
    setError("");
    try {
      const coords = await getCurrentPosition();
      setRegion(coords);
      setRegionLabel("현재 위치 사용됨");
    } catch {
      setError("위치 정보를 가져오지 못했어요. 건너뛰어도 괜찮아요.");
    } finally {
      setGeoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nickname.trim()) { setError("닉네임을 입력해주세요."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim(),
          phone: phone.trim() || null,
          phoneConsent: Boolean(phone.trim()) && phoneConsent,
          region,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "저장에 실패했어요.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("저장 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6, fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "italic" }}>
            거의 다 왔어요
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", fontFamily: "var(--font-noto-serif-kr), Georgia, serif" }}>
            프로필을 완성해주세요
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 6, display: "block" }}>닉네임 *</label>
            <input
              type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
              placeholder="어떻게 불러드릴까요?" maxLength={20} required style={inp}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--line-soft)"; }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 6, display: "block" }}>전화번호 (선택)</label>
            <input
              type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000" style={inp}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--line-soft)"; }}
            />
            {phone.trim() && (
              <label style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 8, fontSize: 12, color: "var(--muted)", cursor: "pointer" }}>
                <input type="checkbox" checked={phoneConsent} onChange={(e) => setPhoneConsent(e.target.checked)}
                  style={{ marginTop: 2, width: 14, height: 14, flexShrink: 0, cursor: "pointer" }} />
                <span>(선택) 모임 연락 목적으로 전화번호 수집·이용에 동의합니다.</span>
              </label>
            )}
          </div>

          <div>
            <label style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 6, display: "block" }}>관심 지역 (선택)</label>
            <button
              type="button" onClick={handleUseLocation} disabled={geoLoading}
              style={{
                width: "100%", padding: "11px 0", borderRadius: 10, fontSize: 13.5,
                background: region ? "rgba(94,70,50,0.08)" : "white",
                border: "1.5px solid var(--line)", color: region ? "var(--accent)" : "var(--ink-soft)",
                cursor: geoLoading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-noto-sans-kr), sans-serif",
              }}
            >
              {geoLoading ? "위치 확인 중…" : regionLabel || "내 근처 북클럽을 위해 현재 위치 사용"}
            </button>
          </div>

          {error && (
            <div style={{ padding: "9px 12px", borderRadius: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p style={{ fontSize: 13, color: "#EF4444", margin: 0 }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading || !nickname.trim()}
            style={{
              padding: "12px 0", borderRadius: 10, fontSize: 15, fontWeight: 600,
              background: loading || !nickname.trim() ? "var(--line-soft)" : "var(--ink)",
              color: loading || !nickname.trim() ? "var(--muted)" : "var(--cream-on-dark)",
              border: "none", cursor: loading || !nickname.trim() ? "not-allowed" : "pointer",
              fontFamily: "var(--font-noto-serif-kr), Georgia, serif", transition: "all .2s",
            }}>
            {loading ? "저장 중…" : "완료"}
          </button>
        </form>
      </div>
    </div>
  );
}
