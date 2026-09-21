import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import BookingCalendar from "@/components/bookclub/BookingCalendar";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbSchema, bookclubItemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSessionsWithReserved } from "@/lib/bookclub/server";
import "@/components/bookclub/booking-calendar.css";

export const metadata: Metadata = buildMetadata({
  title: "북클럽 예약 캘린더 — 질문하는 사람들",
  description:
    "질문하는 사람들의 오프라인 북토크 예약 캘린더. 날짜를 고르고 책, 시간, 장소, 참가비를 확인한 뒤 바로 참여 신청할 수 있습니다.",
  path: "/bookclub",
  type: "website",
});

export const dynamic = "force-dynamic";

export default async function BookClubPage() {
  const sessions = await getSessionsWithReserved();

  const crumbLd = breadcrumbSchema([
    { name: "홈", href: "/" },
    { name: "북클럽", href: "/bookclub" },
  ]);
  const itemListLd = bookclubItemListSchema(sessions);

  return (
    <div className="qbook-page">
      <JsonLd data={[crumbLd, itemListLd]} />
      <Header />
      <BookingCalendar sessions={sessions} />
      <Footer />
    </div>
  );
}
