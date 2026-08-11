import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { buildMetadata } from "@/lib/metadata";
import { getClubs, getNextMeeting } from "@/lib/clubQueries";
import ClubsListClient from "./ClubsListClient";

export const metadata: Metadata = buildMetadata({
  title: "북클럽 둘러보기",
  description: "질문하는 사람들이 운영하는 오프라인 북클럽을 둘러보고, 다음 모임에 바로 참여하세요.",
  path: "/clubs",
  type: "website",
  keywords: ["북클럽", "독서모임", "오프라인모임", "Qsapiens"],
});

export default async function ClubsPage() {
  // DB 일시 장애 시에도 페이지 자체는 뜨도록(다른 페이지들과 동일한 방어적 패턴).
  const clubs = await getClubs().catch(() => []);
  const clubsWithNextMeeting = await Promise.all(
    clubs.map(async (club) => ({ club, nextMeeting: await getNextMeeting(club.id).catch(() => null) }))
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ClubsListClient items={clubsWithNextMeeting} />
      </main>
      <Footer />
    </div>
  );
}
