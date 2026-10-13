import type { Metadata } from "next";
import LandingPage from "@/components/home/LandingPage";
import { buildMetadata } from "@/lib/metadata";
import { getSessionsWithReserved, getWaitingCounts } from "@/lib/bookclub/server";
import { WAITING_CLUBS, waitlistKey } from "@/lib/bookclub/waiting";
import { isPast } from "@/lib/bookclub/selectors";
import { JsonLd } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.qsapiens.com";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata({
  title: "질문하는 사람들(Qsapiens) — 서초구 선정 미래혁신형 북클럽 · 강남 독서모임",
  description: "질문하는 사람들(Qsapiens)은 서초구가 선정한 미래혁신형 북클럽입니다. 서초·강남 독서모임 일정을 달력과 내 근처 찾기로 확인하고 바로 참여하세요. 다시 읽고 싶은 책은 5명이 모이면 열립니다.",
  path: "/",
  type: "website",
});

export default async function HomePage() {
  const [sessions, waitingCounts] = await Promise.all([
    getSessionsWithReserved(),
    getWaitingCounts(WAITING_CLUBS.map(waitlistKey)),
  ]);
  const upcoming = sessions
    .filter((s) => !isPast(s))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  // 홈 구조화 데이터: 운영 주체 + 지금 열리는 북클럽 목록(각 모임 상세에 Event 스키마 있음).
  const nowListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/#now`,
    name: "지금 열리는 북클럽",
    itemListElement: upcoming.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/bookclub/${s.slug}`,
      name: `${s.bookTitle} 독서모임`,
    })),
  };
  return (
    <>
      <JsonLd data={nowListLd} />
      <LandingPage bookclubSessions={sessions} waitingCounts={waitingCounts} />
    </>
  );
}
