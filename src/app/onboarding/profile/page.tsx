import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileOnboardingClient from "./ProfileOnboardingClient";

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

  return (
    <ProfileOnboardingClient
      defaultNickname={nickname ?? ""}
      next={next && next.startsWith("/") ? next : "/mypage"}
    />
  );
}
