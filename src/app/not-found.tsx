import Link from "next/link";
import type { Metadata } from "next";
import { QIMark } from "@/components/common/QIMark";

export const metadata: Metadata = {
  title: "404 — 페이지를 찾을 수 없습니다",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      textAlign: "center",
    }}>
      {/* ?! 로고 */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
        <QIMark size="xl" />
      </div>

      <div style={{
        fontSize: 11.5,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: "var(--muted)",
        fontFamily: '"EB Garamond", Georgia, serif',
        fontStyle: "italic",
        marginBottom: 16,
      }}>
        404 — Not Found
      </div>

      <h1 style={{
        fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
        fontSize: "clamp(24px, 4vw, 36px)",
        fontWeight: 400,
        color: "var(--ink)",
        marginBottom: 12,
        lineHeight: 1.3,
      }}>
        페이지를 찾을 수 없습니다.
      </h1>

      <p style={{
        fontSize: 15,
        color: "var(--muted)",
        lineHeight: 1.75,
        maxWidth: 400,
        marginBottom: 40,
      }}>
        요청하신 페이지가 삭제되었거나 주소가 변경되었습니다.<br />
        좋은 질문은 여전히 아래에 있습니다.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          style={{
            padding: "12px 24px",
            borderRadius: 9999,
            background: "var(--ink)",
            color: "var(--cream-on-dark)",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          홈으로
        </Link>
        <Link
          href="/questions"
          style={{
            padding: "12px 24px",
            borderRadius: 9999,
            border: "1px solid var(--line)",
            color: "var(--ink-soft)",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          질문 탐색
        </Link>
        <Link
          href="/bookclub"
          style={{
            padding: "12px 24px",
            borderRadius: 9999,
            border: "1px solid var(--line)",
            color: "var(--ink-soft)",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          북클럽 보기
        </Link>
      </div>
    </div>
  );
}
