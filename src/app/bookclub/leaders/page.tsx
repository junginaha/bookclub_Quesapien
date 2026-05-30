import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import DefinitionBlock from "@/components/seo/DefinitionBlock";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import LeadersClient from "./LeadersClient";

export const metadata: Metadata = buildMetadata({
  title: "리더 소개 — 북클럽 리더들",
  description: "질문하는 사람들의 북클럽 리더들. 각 리더의 운영 철학, 대표 질문, 진행한 북토크를 소개합니다.",
  path: "/bookclub/leaders",
  type: "website",
  keywords: ["북클럽리더", "독서모임진행자", "독서토론리더", "Quesapience"],
});

export default function LeadersPage() {
  const crumb = breadcrumbSchema([
    { name: "홈", href: "/" },
    { name: "북클럽", href: "/bookclub" },
    { name: "리더 소개", href: "/bookclub/leaders" },
  ]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <JsonLd data={crumb} />
      <Header />
      <DefinitionBlock
        definition="리더는 질문하는 사람들의 북토크를 진행하는 사람이다. 정답을 주지 않고 질문을 통해 대화를 이끈다."
        entityType="Leader"
      />
      <main style={{ flex: 1 }}>
        <LeadersClient />
      </main>
      <Footer />
    </div>
  );
}
