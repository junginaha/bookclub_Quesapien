import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import { QIMark } from "@/components/common/QIMark";

export const metadata: Metadata = {
  title: "로그인",
  description: "질문하는 사람들에 로그인하고 오늘의 질문과 북토크에 참여하세요.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
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
            다시 만나서 반가워요.
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", textAlign: "center" }}>
            오늘의 질문이 기다리고 있어요.
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
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
