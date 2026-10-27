import type { Metadata } from "next";
import { Suspense } from "react";
import ClubsV3 from "@/components/bookclub/v3/ClubsV3";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbSchema, bookclubItemListSchema, upcomingBooksSchema } from "@/lib/schema";
import { UPCOMING_BOOKS } from "@/lib/bookclub/upcoming";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSessionsWithReserved } from "@/lib/bookclub/server";

export const metadata: Metadata = buildMetadata({
  title: "북클럽 찾기 — 리스트·지도·달력 | 질문하는 사람들",
  description: "서초·강남에서 열리는 북클럽을 리스트, 지도, 달력으로 찾고 바로 예약하세요. 질문 하나로 시작하는 북클럽, 질문하는 사람들.",
  path: "/bookclub",
  type: "website",
});
export const dynamic = "force-dynamic";

export default async function BookClubPage() {
  const sessions = await getSessionsWithReserved();
  return <>
    <JsonLd data={[breadcrumbSchema([{ name: "홈", href: "/" }, { name: "북클럽", href: "/bookclub" }]), bookclubItemListSchema(sessions), upcomingBooksSchema(UPCOMING_BOOKS)]} />
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#FAF7F2" }} />}>
      <ClubsV3 sessions={sessions} />
    </Suspense>
  </>;
}
