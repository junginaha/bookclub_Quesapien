import type { Metadata } from "next";
import LandingPage from "@/components/home/LandingPage";
import { buildMetadata } from "@/lib/metadata";
import { getInterestCounts, getSessionsWithReserved } from "@/lib/bookclub/server";
import { BOOKCLUB_SESSIONS } from "@/lib/bookclub/data";
import { isPast } from "@/lib/bookclub/types";
import { getViewer } from "@/lib/viewer";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/schema";
import { HOME_FAQS } from "@/lib/home-faq";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata({
  title: "질문하는 사람들(Qsapiens) — 서초구 선정 미래혁신형 북클럽 · 강남 독서모임",
  description: "질문하는 사람들(Qsapiens)은 서초구가 선정한 미래혁신형 북클럽입니다. 서초·강남에서 열리는 오프라인 독서모임 일정, 함께 읽을 책, 매월 셋째 토요일 북토크, 모임 기록을 한곳에서 확인하세요.",
  path: "/",
  type: "website",
});

export default async function HomePage() {
  const pastSlugs = BOOKCLUB_SESSIONS.filter(isPast).map((s) => s.slug);
  const [sessions, interestCounts, viewer] = await Promise.all([getSessionsWithReserved(), getInterestCounts(pastSlugs), getViewer()]);
  // 2026-10-27 운영자 지시: 홈은 당분간 이전 버전(LandingPage) 유지. v3 홈은 HomeV3.tsx로 보존.
  return (
    <>
      {/* FAQ 구조화 데이터 — 화면에는 아무것도 그리지 않는다(디자인 변경 없음). */}
      <JsonLd data={faqSchema(HOME_FAQS)} />
      <LandingPage bookclubSessions={sessions} interestCounts={interestCounts} signedIn={Boolean(viewer)} />
    </>
  );
}
