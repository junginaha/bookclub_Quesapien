"use client";

import DiscussionGenerator from "@/components/discussion/DiscussionGenerator";

export default function GiantsClient() {
  return (
    <div style={{
      minHeight: "76vh",
      background: "linear-gradient(180deg, #102d50 0%, #0a223e 100%)",
      padding: "72px 0 110px",
    }}>
      <div style={{
        width: "min(860px, calc(100% - 32px))",
        margin: "0 auto",
      }}>
        <header style={{ textAlign: "center", marginBottom: 34, color: "#f5f8fb" }}>
          <p style={{
            margin: "0 0 10px",
            color: "rgba(207,232,250,.58)",
            fontSize: 10,
            letterSpacing: ".18em",
            fontWeight: 700,
          }}>
            ON THE SHOULDERS OF GIANTS
          </p>
          <h1 style={{
            margin: 0,
            fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
            fontSize: "clamp(28px, 4.8vw, 48px)",
            lineHeight: 1.3,
            fontWeight: 500,
          }}>
            북토크의 완성은 좋은 질문
          </h1>
          <p style={{
            margin: "12px auto 0",
            maxWidth: 520,
            color: "rgba(226,239,249,.66)",
            fontSize: 14,
            lineHeight: 1.7,
          }}>
            책과 저자를 입력하고 난이도를 고르세요. 서지정보와 웹 출처에서 책의 숨은 배경을 먼저 교차 검증한 뒤,\n            그 맥락에서만 나올 수 있는 질문을 만듭니다.
          </p>
        </header>

        <DiscussionGenerator variant="giants" />
      </div>
    </div>
  );
}
