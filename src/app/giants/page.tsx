import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import GiantsClient from "./GiantsClient";
import DefinitionBlock from "@/components/seo/DefinitionBlock";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
;

export const metadata: Metadata = buildMetadata({
  title: "거인의 어깨 — 발제 생성기",
  description:
    "거인의 어깨는 책이나 문장을 입력하면 위대한 사유자들의 통찰을 빌려 북클럽 발제 10개를 만들어주는 생성기예요.",
  path: "/giants",
  type: "website",
  keywords: ["발제 생성기", "북클럽 발제", "철학자", "사상가", "거인의어깨"],
});

const collectionLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "거인의 어깨 — 발제 생성기",
  applicationCategory: "UtilitiesApplication",
  description:
    "책이나 문장을 입력하면 위대한 사유자들의 통찰을 빌려 북클럽 발제 10개를 만들어주는 생성기",
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://quesapience.com"}/giants`,
};

export default function GiantsPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* Stage 1: CollectionPage JSON-LD */}
      <JsonLd data={collectionLd} />

      <Header />

      {/* Stage 4: AI Friendly Definition Block */}
      <DefinitionBlock
        definition="거인의 어깨는 책이나 문장을 입력하면 위대한 사유자들의 통찰을 빌려 발제 10개를 만들어주는 생성기예요."
        entityType="KnowledgeExplorer"
      />

      <main style={{ flex: 1 }}>
        <GiantsClient />
      </main>
      <Footer />
    </div>
  );
}
