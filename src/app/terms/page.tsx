import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "이용약관 · 환불 규정",
  description: "질문하는 사람들 북클럽 이용약관과 참여비 취소·환불 규정입니다.",
  path: "/terms",
  noIndex: true,
});

const h2 = { fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 } as const;
const li = { marginLeft: 18, listStyle: "disc" } as const;

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
          시행일: 2026년 10월 17일
        </p>

        <section style={{ display: "flex", flexDirection: "column", gap: 28, fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.8 }}>
          <div>
            <h2 style={h2}>1. 목적</h2>
            <p>이 약관은 질문하는 사람들(이하 &lsquo;운영자&rsquo;)이 www.qsapiens.com에서 제공하는 북클럽 서비스의 이용 조건과 운영자·이용자의 권리, 의무를 정합니다.</p>
          </div>
          <div>
            <h2 style={h2}>2. 서비스의 내용</h2>
            <p>오프라인 북클럽·북토크 모임 안내와 참여 신청, 참여비 결제, 모임 기록(아카이빙), 발제 질문 도구를 제공합니다.</p>
          </div>
          <div>
            <h2 style={h2}>3. 회원가입 및 탈퇴</h2>
            <p>카카오·구글 계정 또는 이메일로 가입할 수 있으며, 마이페이지에서 언제든 탈퇴할 수 있습니다. 모임 참여 신청은 회원가입 없이도 가능합니다.</p>
          </div>
          <div id="refund">
            <h2 style={h2}>4. 참여비 결제 및 취소·환불 규정</h2>
            <p style={{ marginBottom: 8 }}>참여 신청 후 결제가 확인되면 참여가 확정됩니다. 취소는 문의 메일(junginaha@qsapiens.com)로 요청해 주시고, 환불은 요청일 기준으로 아래와 같이 처리합니다.</p>
            <ul style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <li style={li}>모임 3일 전까지: 참여비 전액 환불</li>
              <li style={li}>모임 2일 전 ~ 전날: 참여비의 50% 환불</li>
              <li style={li}>모임 당일 취소 또는 불참: 환불되지 않습니다</li>
              <li style={li}>운영자 사정으로 모임이 취소되거나 일정·장소가 변경되어 참여가 어려운 경우: 전액 환불</li>
            </ul>
            <p style={{ marginTop: 8 }}>환불은 결제 수단으로 영업일 기준 3~7일 이내에 진행됩니다. 무료 모임은 별도 환불 대상이 없으며, 참석이 어려우면 미리 알려 주세요. 대기자에게 자리를 안내해 드릴 수 있습니다.</p>
          </div>
          <div>
            <h2 style={h2}>5. 이용자의 의무</h2>
            <p>모임에서는 서로의 생각을 존중해 주세요. 다른 참여자에 대한 비방, 영업·홍보 목적의 참여, 동의 없는 촬영·녹음이 반복되면 이후 참여가 제한될 수 있습니다.</p>
          </div>
          <div>
            <h2 style={h2}>6. 운영자 정보 및 문의</h2>
            <p>운영: 질문하는 사람들 · 대표 김정인<br />문의: <a href="mailto:junginaha@qsapiens.com">junginaha@qsapiens.com</a></p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
