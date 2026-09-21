import type { Metadata } from "next";
import LandingPage from "@/components/home/LandingPage";
import { buildMetadata } from "@/lib/metadata";
import { getSessionsWithReserved } from "@/lib/bookclub/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata({
  title: "질문하는 사람들 — 미래혁신형 북클럽 | 서초구 선정",
  description: "좋은 질문은 좋은 사람을 데려옵니다. 북클럽 일정과 위치를 확인하고, 함께 읽을 책과 대화의 기록, 발제 만들기를 만나보세요.",
  path: "/",
  type: "website",
});

export default async function HomePage() {
  const sessions = await getSessionsWithReserved();
  return <LandingPage bookclubSessions={sessions} />;
}
