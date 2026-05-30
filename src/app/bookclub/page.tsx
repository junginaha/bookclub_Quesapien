import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import BookClubClient from "./BookClubClient";
import DefinitionBlock from "@/components/seo/DefinitionBlock";
import { createClient } from "@/lib/supabase/server";
import { breadcrumbSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "북클럽 — 오프라인 북토크 일정",
  description:
    "질문하는 사람들의 오프라인 북토크 일정. 리더와 함께 책을 읽고 질문하며 대화합니다. 소규모 원형 대화 방식으로 진행되는 지적 모임.",
  path: "/bookclub",
  type: "website",
  keywords: ["북토크", "오프라인독서모임", "독서모임일정", "소규모독서", "리더"],
});

export const revalidate = 60;

export default async function BookClubPage() {
  let clubs: unknown[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("landing_book_clubs")
      .select("*")
      .order("sort_order", { ascending: true });
    clubs = data ?? [];
  } catch { /* static fallback */ }

  const crumbLd = breadcrumbSchema([
    { name: "홈", href: "/" },
    { name: "북클럽", href: "/bookclub" },
  ]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* Stage 1: BreadcrumbList JSON-LD */}
      <JsonLd data={crumbLd} />

      <Header />

      {/* Stage 4: AI Friendly Definition Block */}
      <DefinitionBlock
        definition="북클럽은 질문하는 사람들이 운영하는 오프라인 북토크 모임이다. 리더 1인이 진행하며, 6–12명이 한 권의 책을 중심으로 질문 기반 대화를 나눈다."
        entityType="BookClub"
      />

      <main style={{ flex: 1 }}>
        <BookClubClient initialClubs={clubs} />
      </main>
      <Footer />
    </div>
  );
}
