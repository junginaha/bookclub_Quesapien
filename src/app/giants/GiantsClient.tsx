"use client";

import DiscussionGenerator from "@/components/discussion/DiscussionGenerator";

export default function GiantsClient() {
  return (
    <div style={{
      minHeight: "70vh",
      background: "linear-gradient(135deg, var(--bg-ink) 0%, #2D3748 100%)",
      position: "relative",
      overflow: "hidden",
      padding: "80px 0 120px",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 50% at 90% 50%, rgba(176,138,74,0.12), transparent 60%)",
      }} />
      <div style={{
        maxWidth: 640, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)",
        position: "relative", textAlign: "center",
      }}>
        <div style={{
          fontSize: 11.5, letterSpacing: "0.28em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)", fontFamily: '"EB Garamond", Georgia, serif',
          fontStyle: "normal", marginBottom: 24,
        }}>
          On the Shoulders of Giants — 거인의 어깨
        </div>
        <h1 style={{
          fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
          fontSize: "clamp(26px, 4.4vw, 46px)",
          fontWeight: 400,
          lineHeight: 1.35,
          color: "rgba(255,255,255,0.95)",
          marginBottom: 16,
        }}>
          책이나 문장을 남겨보세요.<br />
          위대한 사유자들의 <span style={{ color: "var(--gold)", fontWeight: 600 }}>시선</span>으로
          발제 10개를 만들어드릴게요.
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: 48 }}>
          니체, 칸트, 소크라테스, 도스토옙스키의 통찰을 빌려,<br />
          단순한 감상이 아니라 서로 다른 대답이 나올 수밖에 없는 질문을 만듭니다.
        </p>

        <DiscussionGenerator variant="giants" />
      </div>
    </div>
  );
}
