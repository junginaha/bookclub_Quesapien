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

        {/* 문장을 줄이고 목록으로 — 읽는 사람이 자기 항목을 바로 찾게 한다.
            법정 기재 사항(수집 항목·목적·보유 기간·위탁·권리·책임자)은 그대로 둔다. */}
        <section style={{ display: "flex", flexDirection: "column", gap: 26, fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.7 }}>
          <div>
            <h2 style={h2}>1. 수집 항목</h2>
            <ul>
              <li style={li}>모임 신청 — 이름, 휴대전화 (선택: 이메일, 남기는 말)</li>
              <li style={li}>회원가입 — 이메일, 닉네임, 프로필 이미지 (선택: 휴대전화, 관심 지역)</li>
              <li style={li}>이용 기록 — 접속 기록, 오류 기록</li>
            </ul>
            <p style={{ marginTop: 8 }}>카드번호 등 결제 수단 정보는 결제 대행사가 처리하며 보관하지 않습니다.</p>
          </div>
          <div>
            <h2 style={h2}>2. 이용 목적</h2>
            <p>참여 확정·대기 안내, 일정·장소 변경 연락, 결제·환불 확인, 회원 식별, 문의 응대, 오류 개선.</p>
            <p style={{ marginTop: 8 }}>별도 동의 없이 광고성 정보를 보내지 않습니다.</p>
          </div>
          <div>
            <h2 style={h2}>3. 보유 기간</h2>
            <ul>
              <li style={li}>목적 달성 또는 탈퇴 시 — 지체 없이 파기 (작성한 기록은 &lsquo;탈퇴한 회원&rsquo;으로 익명 처리)</li>
              <li style={li}>계약·청약철회·대금 결제 기록 — 5년 (전자상거래법)</li>
              <li style={li}>소비자 불만·분쟁 처리 기록 — 3년 (전자상거래법)</li>
            </ul>
          </div>
          <div>
            <h2 style={h2}>4. 처리 위탁</h2>
            <p style={{ marginBottom: 8 }}>제3자에게 판매·제공하지 않습니다. 아래 업체에 처리를 맡기며, 일부는 해외 서버에 저장됩니다.</p>
            <ul>
              <li style={li}>Supabase — 회원·신청 정보 저장</li>
              <li style={li}>Vercel — 웹사이트 호스팅</li>
              <li style={li}>페이앱 — 참여비 결제</li>
              <li style={li}>Sentry — 오류 기록</li>
              <li style={li}>카카오 · Google — 소셜 로그인</li>
            </ul>
          </div>
          <div>
            <h2 style={h2}>5. 이용자의 권리</h2>
            <p>열람·정정·삭제·처리 정지를 언제든 요청할 수 있습니다. 마이페이지에서 직접 수정·탈퇴하거나 아래 메일로 요청해 주세요.</p>
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
