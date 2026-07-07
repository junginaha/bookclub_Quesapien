import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "이용약관",
  description: "질문하는 사람들의 이용약관입니다.",
  path: "/terms",
  noIndex: true,
});

// D1.5① 법적 필수 — 카카오 로그인 검수 제출물이기도 하다.
// 골격만 코드로 구현되어 있으며, 조항 내용은 운영자가 확정해야 한다(TBD).
export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1" style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px 96px" }}>
        <h1 style={{
          fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
          fontSize: 28, fontWeight: 600, color: "var(--ink)", marginBottom: 12,
        }}>
          이용약관
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 40 }}>
          시행 예정일: [운영자 확정 필요]
        </p>

        <div style={{
          padding: 20, borderRadius: 12, background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.18)", marginBottom: 40,
        }}>
          <p style={{ fontSize: 13.5, color: "#B91C1C", margin: 0, lineHeight: 1.7 }}>
            이 페이지는 골격만 준비되어 있습니다. 실제 조항(서비스 정의, 회원의 의무, 환불 규정,
            사업자 정보, 분쟁 해결 등)은 운영자가 확정해야 하며, 특히 유료 시즌권 판매 개시
            전에는 통신판매업 신고와 함께 환불 규정을 반드시 명문화해야 합니다(§D1.5①).
          </p>
        </div>

        <section style={{ display: "flex", flexDirection: "column", gap: 28, fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.8 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>1. 목적</h2>
            <p>[운영자 확정 필요]</p>
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>2. 서비스의 내용</h2>
            <p>[운영자 확정 필요] — 오프라인 북클럽 연계, 아카이빙, 질문 기록, 시즌 멤버십 등.</p>
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>3. 회원가입 및 탈퇴</h2>
            <p>카카오 계정으로 가입하며, 마이페이지에서 언제든 탈퇴할 수 있습니다.</p>
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>4. 유료 서비스 및 환불 규정</h2>
            <p>[운영자 확정 필요] — 시즌 시작 전/후, 회차 미참여 등 케이스별 환불 규정.</p>
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>5. 사업자 정보</h2>
            <p>[운영자 확정 필요] — 통신판매업 신고 번호, 사업자등록번호, 대표자, 주소, 연락처.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
