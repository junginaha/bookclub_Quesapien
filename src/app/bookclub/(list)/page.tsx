import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import BookingCalendar from "@/components/bookclub/BookingCalendar";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbSchema, bookclubItemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSessionsWithReserved } from "@/lib/bookclub/server";

export const metadata: Metadata = buildMetadata({
  title: "북클럽 일정 — 질문하는 사람들",
  description: "날짜별 북토크 일정과 도서, 장소, 참가비를 확인하고 참여를 신청하세요.",
  path: "/bookclub",
  type: "website",
});
export const dynamic = "force-dynamic";

export default async function BookClubPage() {
  const sessions = await getSessionsWithReserved();
  return <>
    <JsonLd data={[breadcrumbSchema([{ name: "홈", href: "/" }, { name: "북클럽", href: "/bookclub" }]), bookclubItemListSchema(sessions)]} />
    <Header />
    <main><BookingCalendar sessions={sessions} /></main>
    <Footer />
  </>;
}
