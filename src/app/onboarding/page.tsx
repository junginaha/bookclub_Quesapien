import type { Metadata } from "next";
import OnboardingClient from "./OnboardingClient";

export const metadata: Metadata = {
  title: "환영합니다 — 질문하는 사람들",
  description: "당신에 대한 질문 몇 가지로 시작해보세요.",
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
