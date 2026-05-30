import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import GiantsClient from "./GiantsClient";

export const metadata: Metadata = {
  title: "거인의 어깨",
  description: "위대한 저자와 지성들의 사유를 대화 형태로 탐험합니다. 니체, 칸트, 한강, 피터 드러커와의 AI 대화.",
};

export default function GiantsPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />
      <main style={{ flex: 1, paddingTop: 64 }}>
        <GiantsClient />
      </main>
      <Footer />
    </div>
  );
}
