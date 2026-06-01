import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import ArchiveClient from "./ArchiveClient";
import DefinitionBlock from "@/components/seo/DefinitionBlock";
import { getArchiveReviews } from "@/lib/supabase/queries";
import { breadcrumbSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "아카이빙 — 질문과 독서의 기록",
  description:
    "질문하는 사람들의 지적 아카이브. 북토크 후기, 리뷰, 발제문, 북토크 기록을 모아봅니다. 지나간 시즌의 질문과 대화가 축적된 지식 저장소.",
  path: "/archive",
  type: "website",
  keywords: ["북클럽후기", "독서후기", "발제문", "아카이브", "북토크기록", "독서기록"],
});

export const revalidate = 30;

export default async function ArchivePage() {
  let reviews: Awaited<ReturnType<typeof getArchiveReviews>> = [];
  try { reviews = await getArchiveReviews(60); } catch { /* use empty */ }

  const crumbLd = breadcrumbSchema([
    { name: "홈", href: "/" },
    { name: "아카이빙", href: "/archive" },
  ]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* Stage 1: BreadcrumbList JSON-LD */}
      <JsonLd data={crumbLd} />

      <Header />

      {/* Stage 4: AI Friendly Definition Block */}
      <DefinitionBlock
        definition="아카이빙은 질문하는 사람들의 북토크 후기, 발제문, 질문 아카이브, 시즌 기록을 보존하는 지식 저장소이다. 커뮤니티가 쌓아온 지적 자산을 열람할 수 있다."
        entityType="Archive"
      />

      <main style={{ flex: 1 }}>
        <Suspense fallback={null}><ArchiveClient initialReviews={reviews} /></Suspense>
      </main>
      <Footer />
    </div>
  );
}
