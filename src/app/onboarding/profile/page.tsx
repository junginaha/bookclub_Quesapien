import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileOnboardingClient from "./ProfileOnboardingClient";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "프로필 완성하기 — 질문하는 사람들",
  description: "닉네임과 관심 지역을 알려주세요.",
};

export default async function ProfileOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; nickname?: string }>;
}) {
  const { next, nickname } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  // '프로필 수정'으로 들어와도 빈 칸이 뜨지 않게 저장된 이름·번호를 채워 둔다(2026-11-09 실사용 점검).
  const viewer = await getViewer();

  return (
    <ProfileOnboardingClient
      defaultNickname={nickname ?? viewer?.name ?? ""}
      defaultPhone={viewer?.phone ?? ""}
      next={next && next.startsWith("/") ? next : "/mypage"}
    />
  );
}
