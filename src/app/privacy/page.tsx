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

const h2 = { fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 } as const;
const li = { marginLeft: 18, listStyle: "disc" } as const;

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
          시행일: 2026년 10월 17일
        </p>

        <section style={{ display: "flex", flexDirection: "column", gap: 28, fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.8 }}>
          <div>
            <h2 style={h2}>1. 수집하는 개인정보 항목</h2>
            <ul>
              <li style={li}>모임 참여 신청: 이름, 휴대전화 번호(필수), 이메일·전하고 싶은 말(선택)</li>
              <li style={li}>회원가입: 이메일, 닉네임, 프로필 이미지(소셜 로그인 제공 정보), 휴대전화 번호·관심 지역(선택)</li>
              <li style={li}>결제: 결제 대행사가 처리하며, 운영자는 카드번호 등 결제 수단 정보를 보관하지 않습니다</li>
              <li style={li}>서비스 이용 과정: 접속 기록, 오류 기록</li>
            </ul>
          </div>
          <div>
            <h2 style={h2}>2. 수집 및 이용 목적</h2>
            <p>모임 참여 확정·대기 안내, 일정·장소 변경 연락, 참여비 결제 확인과 환불 처리, 회원 식별, 문의 응대, 서비스 오류 개선에 이용합니다. 별도 동의 없이 광고성 정보를 보내지 않습니다.</p>
          </div>
          <div>
            <h2 style={h2}>3. 보유 및 이용 기간</h2>
            <p>목적을 달성하거나 탈퇴하면 지체 없이 파기합니다. 탈퇴 후 작성한 기록은 &lsquo;탈퇴한 회원&rsquo;으로 익명 처리됩니다. 단, 전자상거래법에 따라 계약·청약철회 및 대금 결제 기록은 5년, 소비자 불만·분쟁 처리 기록은 3년간 보관합니다.</p>
          </div>
          <div>
            <h2 style={h2}>4. 처리 위탁 및 국외 이전</h2>
            <p style={{ marginBottom: 8 }}>개인정보를 제3자에게 판매·제공하지 않습니다. 서비스 운영을 위해 아래 업체에 처리를 맡기고 있으며, 일부는 해외 서버에 저장될 수 있습니다.</p>
            <ul>
              <li style={li}>Supabase Inc.: 회원·신청 정보 저장(데이터베이스)</li>
              <li style={li}>Vercel Inc.: 웹사이트 호스팅</li>
              <li style={li}>페이앱(PayApp): 참여비 결제 처리</li>
              <li style={li}>Functional Software Inc.(Sentry): 서비스 오류 기록</li>
              <li style={li}>카카오·Google: 소셜 로그인 인증</li>
            </ul>
          </div>
          <div>
            <h2 style={h2}>5. 이용자의 권리와 행사 방법</h2>
            <p>언제든 본인 정보의 열람·정정·삭제·처리 정지를 요청할 수 있습니다. 마이페이지에서 직접 수정·탈퇴하거나 아래 메일로 요청하면 지체 없이 처리합니다.</p>
          </div>
          <div>
            <h2 style={h2}>6. 개인정보 보호책임자</h2>
            <p>김정인 · <a href="mailto:junginaha@qsapiens.com">junginaha@qsapiens.com</a></p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
