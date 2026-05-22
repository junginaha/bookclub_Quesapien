import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";

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

export const metadata: Metadata = {
  title: {
    default: "질문하는 사람들 — 미래혁신형 북클럽",
    template: "%s | 질문하는 사람들",
  },
  description: "책으로 시작된 질문은 사람을 연결합니다. 질문 중심 북클럽, 서초구 선정 프로젝트.",
  keywords: ["북클럽", "독서모임", "질문", "서초구", "독서", "토론"],
  authors: [{ name: "질문하는 사람들" }],
  openGraph: {
    title: "질문하는 사람들 — 미래혁신형 북클럽",
    description: "책으로 시작된 질문은 사람을 연결합니다.",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FAFAF8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} ${notoSerifKR.variable}`}>
      <body className="min-h-screen bg-background antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#1C1C1E",
              color: "#FFFFFF",
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
