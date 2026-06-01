"use client";

/**
 * QIMark — ?! 상징 로고 컴포넌트
 * 헤더, 로그인/회원가입 페이지, 404 등 상징적인 위치에 사용
 */

interface QIMarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
}

const SIZES = {
  sm:  { container: 32, q: 18, bang: 14, radius: 8 },
  md:  { container: 48, q: 26, bang: 20, radius: 12 },
  lg:  { container: 72, q: 40, bang: 30, radius: 18 },
  xl:  { container: 96, q: 52, bang: 40, radius: 24 },
};

export function QIMark({ size = "md", animate = true }: QIMarkProps) {
  const s = SIZES[size];

  return (
    <div style={{
      width: s.container, height: s.container,
      borderRadius: s.radius,
      background: "var(--bg-ink, #14181F)",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative",
      boxShadow: "0 4px 20px -8px rgba(28,31,38,0.4)",
      flexShrink: 0,
    }}>
      {/* 배경 글로우 */}
      <div style={{
        position: "absolute", inset: -2,
        borderRadius: s.radius + 2,
        background: "radial-gradient(circle at 40% 40%, rgba(176,138,74,0.15), transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "baseline", gap: 1, position: "relative" }}>
        <span style={{
          color: "var(--accent, #5E4632)",
          fontFamily: '"EB Garamond", Georgia, serif',
          fontStyle: "normal",
          fontSize: s.q,
          lineHeight: 1,
          animation: animate ? "markBreathe 3.8s ease-in-out infinite" : "none",
          transformOrigin: "center",
          display: "inline-block",
        }}>?</span>
        <span style={{
          color: "rgba(255,255,255,0.85)",
          fontFamily: '"EB Garamond", Georgia, serif',
          fontStyle: "normal",
          fontSize: s.bang,
          lineHeight: 1,
          animation: animate ? "markBob 2.6s ease-in-out infinite" : "none",
          transformOrigin: "center",
          display: "inline-block",
        }}>!</span>
      </div>
    </div>
  );
}
