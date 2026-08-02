import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Noto_Serif_KR, EB_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { JsonLd } from "@/components/seo/JsonLd";
import { orgSchema, websiteSchema } from "@/lib/schema";
import KeycapSound from "@/components/common/KeycapSound";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-noto-serif-kr",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jilmunhaneun-saramdeul.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "질문하는 사람들 — 미래혁신형 북클럽",
    template: "%s | 질문하는 사람들",
  },
  description:
    "질문하는 사람들은 질문을 중심으로 사람과 책을 연결하는 오프라인 북토크 커뮤니티입니다. 서초구 선정 미래혁신형 북클럽. 질문 → 책 → 대화 → 사람 → 성장.",
  keywords: [
    "북클럽", "독서모임", "질문", "서초구", "독서", "토론",
    "북토크", "오프라인독서모임", "질문하는사람들", "Quesapience",
    "미래혁신형북클럽", "지적커뮤니티", "거인의어깨",
    "북토크", "발제생성", "독서토론", "지성과의대화", "Quesapience",
  ],
  authors: [{ name: "질문하는 사람들" }],
  creator: "질문하는 사람들",
  publisher: "질문하는 사람들",
  category: "education",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "질문하는 사람들 — 미래혁신형 북클럽",
    description:
      "질문하는 사람들은 질문을 중심으로 사람과 책을 연결하는 오프라인 북토크 커뮤니티입니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "질문하는 사람들",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "질문하는 사람들 — 미래혁신형 북클럽",
    description: "질문으로 연결되는 지적 커뮤니티. 서초구 선정 미래혁신형 북클럽.",
    creator: "@quesapience",
    site: "@quesapience",
  },
  alternates: { canonical: SITE_URL },
  other: {
    "application-name": "질문하는 사람들",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "질문하는 사람들",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4EFE5" },
    { media: "(prefers-color-scheme: dark)", color: "#1C1F26" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      className={`${notoSansKR.variable} ${notoSerifKR.variable} ${ebGaramond.variable}`}
    >
      <head>
        {/* 홈 인트로 스플래시(IntroSplash.tsx) 노출 여부를 첫 페인트 전에 확정하는
            차단 스크립트. 현재 탭에서 아직 인트로를 보지 않은 경우에만
            html에 data-intro="pending"을 찍어두면
            landing.css가 그 경우에만 .lp-intro를 보여준다 — React 하이드레이션을
            기다리지 않아 "로딩 직후 다른 화면이 번쩍 뜨는" 현상이 없어진다.
            IntroSplash.tsx의 SEEN_KEY/PENDING_ATTR과 반드시 같은 값을 써야 한다. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(!sessionStorage.getItem('qp-intro-seen')){document.documentElement.setAttribute('data-intro','pending')}}catch(e){document.documentElement.setAttribute('data-intro','pending')}`,
          }}
        />
        {/* 키캡 버튼(.btn-keycap) 음각 전용 폰트 — 배민 주아(BMJUA), §C2 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/BMJUA.css"
        />
      </head>
      <body className="min-h-screen antialiased">
        {/* Stage 1: Organization + WebSite JSON-LD — sitewide */}
        <JsonLd data={orgSchema()} />
        <JsonLd data={websiteSchema()} />
        {/* PWA Service Worker 등록 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}`,
          }}
        />
        <KeycapSound />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#1C1F26",
              color: "#ECE3CF",
              border: "none",
              borderRadius: "12px",
              fontFamily: "var(--font-noto-sans-kr)",
            },
          }}
        />
      </body>
    </html>
  );
}
