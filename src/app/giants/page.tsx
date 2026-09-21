import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import GiantsClient from "./GiantsClient";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "거인의 어깨 — 북토크 발제 생성기",
  description:
    "책과 저자를 확인하고, 검증 가능한 숨은 배경과 거인의 시선을 연결해 북토크 질문 10개를 만듭니다.",
  path: "/giants",
  type: "website",
  keywords: ["발제 생성기", "북클럽 발제", "북토크 질문", "책 토론", "거인의 어깨"],
});

const appLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "거인의 어깨 — 북토크 발제 생성기",
  applicationCategory: "UtilitiesApplication",
  description:
    "책과 저자를 확인하고 검증 가능한 배경과 사상적 관점을 연결해 북토크 질문 10개를 만드는 도구",
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.qsapiens.com"}/giants`,
};

export default function GiantsPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <JsonLd data={appLd} />
      <Header />
      <main style={{ flex: 1 }}>
        <GiantsClient />
      </main>
      <Footer />
    </div>
  );
}
