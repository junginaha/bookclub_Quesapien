import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbSchema, bookclubItemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { computeStats } from "@/lib/bookclub/selectors";
import { getSessionsWithReserved } from "@/lib/bookclub/server";
import Sidebar from "@/components/bookclub/Sidebar";
import TogetherReading from "@/components/bookclub/TogetherReading";
import "@/components/bookclub/bookclub.css";

// keywords 메타태그 삭제(작업지시서 Phase 5) — 검색엔진이 사실상 무시하는 필드.
export const metadata: Metadata = buildMetadata({
  title: "북클럽 — 오프라인 북토크 일정",
  description:
    "질문하는 사람들의 오프라인 북토크 일정. 날짜를 고르면 그 모임으로 바로 이동합니다.",
  path: "/bookclub",
  type: "website",
});

// reserved는 매 요청 실시간 조회가 원칙이라(§작업원칙4) 정적 캐싱을 쓰지 않는다.
export const dynamic = "force-dynamic";

function coverImageUrl() {
  const params = new URLSearchParams({
    title: "질문하는 사람들 북클럽",
    sub: "질문으로 연결되는 지적 커뮤니티",
  });
  return `/og?${params.toString()}`;
}

export default async function BookClubPage() {
  const sessions = await getSessionsWithReserved();
  const stats = computeStats(sessions);

  const crumbLd = breadcrumbSchema([
    { name: "홈", href: "/" },
    { name: "북클럽", href: "/bookclub" },
  ]);
  const itemListLd = bookclubItemListSchema(sessions);

  const venueMapUrl = "https://map.kakao.com/?q=" + encodeURIComponent("에피소드 강남 262");

  return (
    <div className="qc-page">
      <JsonLd data={[crumbLd, itemListLd]} />
      <Header />
      <main>
        <div className="qc-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverImageUrl()} alt="질문하는 사람들 북클럽" />
        </div>
        <div className="qc-body">
          <Sidebar stats={stats} venueName="에피소드 강남 262" venueMapUrl={venueMapUrl} />
          <Suspense fallback={<div className="qc-skel" style={{ height: 480 }} />}>
            <TogetherReading sessions={sessions} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
