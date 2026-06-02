import type { Metadata } from "next";
import Link from "next/link";
import { QIMark } from "@/components/common/QIMark";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "비밀번호 재설정 — 질문하는 사람들",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <QIMark size="lg" />
            <div style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>
              질문하는 사람들
            </div>
          </Link>
          <h1 style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 22, fontWeight: 400, color: "var(--ink)", margin: 0, textAlign: "center" }}>
            새 비밀번호 설정
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 8, textAlign: "center" }}>
            8자 이상의 새 비밀번호를 입력해주세요.
          </p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid var(--line-soft)", borderRadius: 20, padding: "32px 28px", boxShadow: "0 8px 40px -16px rgba(28,31,38,.12)" }}>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
