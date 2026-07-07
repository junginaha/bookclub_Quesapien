import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "개인정보처리방침",
  description: "질문하는 사람들의 개인정보처리방침입니다.",
  path: "/privacy",
  noIndex: true,
});

// D1.5① 법적 필수 — 카카오 로그인 검수 제출물이기도 하다.
// 골격만 코드로 구현되어 있으며, 조항 내용은 운영자가 확정해야 한다(TBD).
export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1" style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px 96px" }}>
        <h1 style={{
          fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
          fontSize: 28, fontWeight: 600, color: "var(--ink)", marginBottom: 12,
        }}>
          개인정보처리방침
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 40 }}>
          시행 예정일: [운영자 확정 필요]
        </p>

        <div style={{
          padding: 20, borderRadius: 12, background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.18)", marginBottom: 40,
        }}>
          <p style={{ fontSize: 13.5, color: "#B91C1C", margin: 0, lineHeight: 1.7 }}>
            이 페이지는 골격만 준비되어 있습니다. 실제 조항(수집 항목, 이용 목적, 보관 기간,
            제3자 제공, 위탁, 파기 절차, 이용자 권리 등)은 운영자가 확정해야 하며,
            그 전까지는 실서비스 오픈 불가(§D1.5①)입니다.
          </p>
        </div>

        <section style={{ display: "flex", flexDirection: "column", gap: 28, fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.8 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>1. 수집하는 개인정보 항목</h2>
            <p>[운영자 확정 필요] — 현재 코드 기준 수집 항목: 닉네임, 이메일(소셜 로그인 제공), 전화번호(선택 동의), 위치 정보(선택, 관심 지역).</p>
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>2. 개인정보의 수집 및 이용 목적</h2>
            <p>[운영자 확정 필요]</p>
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>3. 개인정보의 보유 및 이용 기간</h2>
            <p>[운영자 확정 필요] — 탈퇴 시 계정은 삭제되며 콘텐츠는 "탈퇴한 회원"으로 익명화되어 보존됩니다.</p>
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>4. 개인정보의 제3자 제공 및 위탁</h2>
            <p>[운영자 확정 필요]</p>
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>5. 이용자의 권리와 행사 방법</h2>
            <p>[운영자 확정 필요]</p>
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>6. 개인정보 보호책임자</h2>
            <p>[운영자 확정 필요]</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
