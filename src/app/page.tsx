import type { Metadata } from "next";
import HomeV3 from "@/components/home/v3/HomeV3";
import { buildMetadata } from "@/lib/metadata";
import { getInterestCounts, getSessionsWithReserved } from "@/lib/bookclub/server";
import { BOOKCLUB_SESSIONS } from "@/lib/bookclub/data";
import { isPast } from "@/lib/bookclub/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata({
  title: "질문하는 사람들(Qsapiens) — 서초구 선정 미래혁신형 북클럽 · 강남 독서모임",
  description: "질문하는 사람들(Qsapiens)은 서초구가 선정한 미래혁신형 북클럽입니다. 서초·강남에서 열리는 오프라인 독서모임 일정, 함께 읽을 책, 발제 질문 생성기, 모임 기록을 한곳에서 확인하세요.",
  path: "/",
  type: "website",
});

export default async function HomePage() {
  const pastSlugs = BOOKCLUB_SESSIONS.filter(isPast).map((s) => s.slug);
  const [sessions, interestCounts] = await Promise.all([getSessionsWithReserved(), getInterestCounts(pastSlugs)]);
  return <HomeV3 sessions={sessions} interestCounts={interestCounts} />;
}
