"use client";

import DiscussionGenerator from "@/components/discussion/DiscussionGenerator";

export default function GiantsClient() {
  return (
    <div style={{
      minHeight: "76vh",
      background: "#f4efe5",
      padding: "clamp(48px, 7vw, 84px) 0 110px",
    }}>
      <div style={{
        width: "min(860px, calc(100% - 28px))",
        margin: "0 auto",
      }}>
        <header style={{ marginBottom: 30, color: "#252b32" }}>
          <p style={{
            margin: "0 0 9px",
            color: "#8b735c",
            fontSize: 10,
            letterSpacing: ".16em",
            fontWeight: 700,
          }}>
            ON THE SHOULDERS OF GIANTS
          </p>
          <h1 style={{
            margin: 0,
            maxWidth: 620,
            fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
            fontSize: "clamp(29px, 4.8vw, 48px)",
            lineHeight: 1.28,
            fontWeight: 500,
            letterSpacing: "-.025em",
          }}>
            북토크의 완성은<br />좋은 질문입니다.
          </h1>
          <p style={{
            margin: "13px 0 0",
            maxWidth: 600,
            color: "#6f6861",
            fontSize: 13.5,
            lineHeight: 1.75,
            wordBreak: "keep-all",
          }}>
            책과 저자, 난이도만 고르세요. 책을 확인하고 숨은 배경을 찾아 출처를 대조한 뒤,
            그 책에서만 나올 수 있는 질문 10개를 만듭니다.
          </p>
        </header>

        <DiscussionGenerator variant="giants" />
      </div>
    </div>
  );
}
