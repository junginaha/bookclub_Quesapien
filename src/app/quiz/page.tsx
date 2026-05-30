import { buildMetadata } from "@/lib/metadata";
import QuizClient from "./QuizClient";

export const metadata = buildMetadata({
  title: "북 MBTI — 나에게 맞는 북클럽 찾기",
  description: "당신의 독서 성향을 파악하고 꼭 맞는 북클럽을 추천받으세요. 4가지 독서 유형(POET, SAGE, SEEKER, BRIDGE) 중 어디에 해당하는지 알아보세요.",
  path: "/quiz",
  type: "website",
  keywords: ["북MBTI", "독서성향테스트", "북클럽추천", "독서유형"],
});

export default function QuizPage() {
  return <QuizClient />;
}
