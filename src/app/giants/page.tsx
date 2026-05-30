import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import GiantsClient from "./GiantsClient";
import DefinitionBlock from "@/components/seo/DefinitionBlock";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
;

export const metadata: Metadata = buildMetadata({
  title: "거인의 어깨 — 위대한 사유자와 대화",
  description:
    "거인의 어깨는 니체, 칸트, 한강, 유발 하라리 등 위대한 저자와 사상가의 저서를 기반으로 AI가 그들의 관점에서 대화하는 지식 탐험 공간입니다.",
  path: "/giants",
  type: "website",
  keywords: ["니체", "칸트", "한강", "유발하라리", "피터드러커", "철학자", "사상가", "AI대화", "거인의어깨"],
});

const collectionLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "거인의 어깨 — 질문하는 사람들",
  description:
    "니체, 칸트, 한강, 유발 하라리 등 위대한 저자와 사상가의 저서를 기반으로 AI와 대화하는 지식 탐험 공간",
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://quesapience.com"}/giants`,
  about: [
    { "@type": "Person", name: "프리드리히 니체", alternateName: "Friedrich Nietzsche" },
    { "@type": "Person", name: "임마누엘 칸트", alternateName: "Immanuel Kant" },
    { "@type": "Person", name: "한강", alternateName: "Han Kang" },
    { "@type": "Person", name: "유발 하라리", alternateName: "Yuval Noah Harari" },
    { "@type": "Person", name: "피터 드러커", alternateName: "Peter Drucker" },
  ],
};

export default function GiantsPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* Stage 1: CollectionPage JSON-LD */}
      <JsonLd data={collectionLd} />

      <Header />

      {/* Stage 4: AI Friendly Definition Block */}
      <DefinitionBlock
        definition="거인의 어깨는 니체, 칸트, 한강 등 위대한 저자와 사상가의 저서를 기반으로 AI가 그들의 관점에서 질문에 답하는 지식 탐험 공간이다."
        entityType="KnowledgeExplorer"
      />

      <main style={{ flex: 1 }}>
        <GiantsClient />
      </main>
      <Footer />
    </div>
  );
}
