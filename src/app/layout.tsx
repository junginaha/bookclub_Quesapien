import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Noto_Serif_KR, EB_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { JsonLd } from "@/components/seo/JsonLd";
import { orgSchema, websiteSchema } from "@/lib/schema";
import KeycapSound from "@/components/common/KeycapSound";

const notoSansKR = Noto_Sans_KR({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-noto-sans-kr", display: "swap" });
const notoSerifKR = Noto_Serif_KR({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "900"], variable: "--font-noto-serif-kr", display: "swap" });
const ebGaramond = EB_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-eb-garamond", display: "swap" });
// 배민 주아체 — 키캡 버튼(.btn-keycap) 전용. 예전 jsDelivr CSS 링크는 404였고 렌더를
// 막고 있었다. 자체 호스팅 + preload 끔: 키캡이 있는 페이지에서만 내려받는다.
const bmjua = localFont({ src: "../../public/fonts/BMJUA.woff", variable: "--font-bmjua", display: "swap", preload: false });
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.qsapiens.com";

// 검색엔진 소유 확인 — 값이 있는 것만 출력한다(빈 메타 태그 방지).
const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const verificationOther: Record<string, string> = {};
if (process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION) verificationOther["naver-site-verification"] = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION;
if (process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION) verificationOther["msvalidate.01"] = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "질문하는 사람들 — 미래혁신형 북클럽", template: "%s | 질문하는 사람들" },
  description: "질문하는 사람들은 질문을 중심으로 사람과 책을 연결하는 오프라인 북토크 커뮤니티입니다. 서초구 선정 미래혁신형 북클럽. 질문 → 책 → 대화 → 사람 → 성장.",
  authors: [{ name: "질문하는 사람들" }],
  creator: "질문하는 사람들", publisher: "질문하는 사람들", category: "education",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 } },
  openGraph: { title: "질문하는 사람들 — 미래혁신형 북클럽", description: "질문하는 사람들은 질문을 중심으로 사람과 책을 연결하는 오프라인 북토크 커뮤니티입니다.", type: "website", locale: "ko_KR", siteName: "질문하는 사람들", url: SITE_URL },
  twitter: { card: "summary_large_image", title: "질문하는 사람들 — 미래혁신형 북클럽", description: "질문으로 연결되는 지적 커뮤니티. 서초구 선정 미래혁신형 북클럽.", creator: "@qsapiens", site: "@qsapiens" },
  alternates: { canonical: SITE_URL, types: { "text/plain": `${SITE_URL}/llms.txt` } },
  ...(GOOGLE_VERIFICATION || Object.keys(verificationOther).length
    ? { verification: { ...(GOOGLE_VERIFICATION ? { google: GOOGLE_VERIFICATION } : {}), ...(Object.keys(verificationOther).length ? { other: verificationOther } : {}) } }
    : {}),
  other: { "application-name": "질문하는 사람들", "mobile-web-app-capable": "yes", "apple-mobile-web-app-capable": "yes", "apple-mobile-web-app-status-bar-style": "default", "apple-mobile-web-app-title": "질문하는 사람들" },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 5,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#F4EFE5" }, { media: "(prefers-color-scheme: dark)", color: "#1C1F26" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko" className={`${notoSansKR.variable} ${notoSerifKR.variable} ${ebGaramond.variable} ${bmjua.variable}`}>
    <body className="min-h-screen antialiased">
      <JsonLd data={orgSchema()} />
      <JsonLd data={websiteSchema()} />
      <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}` }} />
      <KeycapSound />
      <AuthProvider>{children}</AuthProvider>
      <Toaster position="bottom-center" toastOptions={{ style: { background: "#1C1F26", color: "#ECE3CF", border: "none", borderRadius: "12px", fontFamily: "var(--font-noto-sans-kr)" } }} />
    </body>
  </html>;
}
