import type { Metadata } from "next";
import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";
import { QIMark } from "@/components/common/QIMark";

export const metadata: Metadata = {
  title: "함께하기 — 질문하는 사람들",
  description: "질문하는 사람들과 함께하세요. 책·질문·대화로 이어지는 지적 커뮤니티.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* ?! 로고 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <QIMark size="lg" />
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
                fontSize: 16, fontWeight: 500, color: "var(--ink)", letterSpacing: "0.03em",
              }}>
                질문하는 사람들
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3, letterSpacing: "0.04em" }}>
                미래혁신형 북클럽
              </div>
            </div>
          </Link>

          <h1 style={{
            fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
            fontSize: 22, fontWeight: 400, color: "var(--ink)",
            marginTop: 28, marginBottom: 6, textAlign: "center",
          }}>
            좋은 질문은 좋은 사람을<br />데려옵니다.
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", textAlign: "center" }}>
            지금 함께하세요.
          </p>
        </div>

        {/* 폼 카드 */}
        <div style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--line-soft)",
          borderRadius: 20,
          padding: "32px 28px",
          boxShadow: "0 8px 40px -16px rgba(28,31,38,.12)",
        }}>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
