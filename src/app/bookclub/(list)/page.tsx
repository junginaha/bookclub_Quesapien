import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { BOOKCLUBS, computeStats, status as computeStatus } from "@/lib/bookclubs";
import { getJoinedCounts } from "@/lib/bookclubs.server";
import Sidebar from "@/components/bookclub/Sidebar";
import BookClubPageClient, { type ClubWithComputed } from "@/components/bookclub/BookClubPageClient";
import "@/components/bookclub/bookclub.css";

export const metadata: Metadata = buildMetadata({
  title: "북클럽 — 오프라인 북토크 일정",
  description:
    "질문하는 사람들의 오프라인 북토크 일정. 날짜를 고르면 그 모임으로 바로 이동합니다.",
  path: "/bookclub",
  type: "website",
  keywords: ["북토크", "오프라인독서모임", "독서모임일정", "소규모독서"],
});

// joinedCount는 매 요청 실시간 조회가 원칙이라(§B "하드코딩 금지") 정적 캐싱을 쓰지 않는다.
// ISR(revalidate)로 두면 빌드 타임에 Suspense 셸만 굳어버리고 이후에도 갱신되지
// 않는 현상을 재현 확인했다(getJoinedCounts()가 느리거나 실패할 때 정적 생성이
// 로딩 스켈레톤만 베이크한 채로 캐시됨) — force-dynamic으로 매 요청 새로 렌더링한다.
export const dynamic = "force-dynamic";

function coverImageUrl() {
  const params = new URLSearchParams({
    title: "질문하는 사람들 북클럽",
    sub: "질문으로 연결되는 지적 커뮤니티",
  });
  return `/og?${params.toString()}`;
}

export default async function BookClubPage() {
  const joinedCounts = await getJoinedCounts(BOOKCLUBS.map((c) => c.slug));
  const items: ClubWithComputed[] = BOOKCLUBS.map((club) => ({
    club,
    status: computeStatus(club, joinedCounts[club.slug] ?? 0),
    joinedCount: joinedCounts[club.slug] ?? 0,
  }));
  const stats = computeStats(BOOKCLUBS, joinedCounts);

  const crumbLd = breadcrumbSchema([
    { name: "홈", href: "/" },
    { name: "북클럽", href: "/bookclub" },
  ]);

  const venueMapUrl = "https://map.kakao.com/?q=" + encodeURIComponent("에피소드 강남 262");

  return (
    <div className="qc-page">
      <JsonLd data={crumbLd} />
      <Header />
      <main>
        <div className="qc-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverImageUrl()} alt="질문하는 사람들 북클럽" />
        </div>
        <div className="qc-body">
          <Sidebar stats={stats} venueName="에피소드 강남 262" venueMapUrl={venueMapUrl} />
          <Suspense fallback={<div className="qc-skel" style={{ height: 480 }} />}>
            <BookClubPageClient items={items} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
