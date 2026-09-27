import type { Metadata } from "next";
import LandingPage from "@/components/home/LandingPage";
import { buildMetadata } from "@/lib/metadata";
import { getSessionsWithReserved } from "@/lib/bookclub/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata({
  title: "질문하는 사람들(Qsapiens) — 서초구 선정 미래혁신형 북클럽 · 강남 독서모임",
  description: "질문하는 사람들(Qsapiens)은 서초구가 선정한 미래혁신형 북클럽입니다. 서초·강남에서 열리는 오프라인 독서모임 일정, 함께 읽을 책, 발제 질문 생성기, 모임 기록을 한곳에서 확인하세요.",
  path: "/",
  type: "website",
});

export default async function HomePage() {
  const sessions = await getSessionsWithReserved();
  return <LandingPage bookclubSessions={sessions} />;
}
