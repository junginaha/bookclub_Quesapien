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
            책 제목과 저자, 책 소개를 알려주세요. 책의 핵심 주제와 사상가의 관점을 연결해
            대화 시작부터 심화 토론과 마무리까지 질문 초안 10개를 구성합니다. 질문을 모임에 맞게 다듬고 복사해 활용하세요.
          </p>
        </header>

        <DiscussionGenerator variant="giants" />
      </div>
    </div>
  );
}
