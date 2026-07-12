import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import BookClubClient from "./BookClubClient";
import DefinitionBlock from "@/components/seo/DefinitionBlock";
import { createClient } from "@/lib/supabase/server";
import { attachEncoreCounts } from "@/lib/bookclub-server";
import type { BookClubRecord } from "@/lib/bookclub";
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
  let clubs: BookClubRecord[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("landing_book_clubs")
      .select("*")
      .order("sort_order", { ascending: true });
    clubs = await attachEncoreCounts(supabase, (data ?? []) as BookClubRecord[]);
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
        <Suspense fallback={<BookClubSkeleton />}>
          <BookClubClient initialClubs={clubs} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function BookClubSkeleton() {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "72px clamp(20px, 4vw, 48px)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--line-soft)" }}>
            <div style={{ height: 180, background: "var(--bg-soft)" }} />
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ height: 12, width: "70%", background: "var(--line-soft)", borderRadius: 4 }} />
              <div style={{ height: 12, width: "50%", background: "var(--line-soft)", borderRadius: 4 }} />
              <div style={{ height: 12, width: "40%", background: "var(--line-soft)", borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
