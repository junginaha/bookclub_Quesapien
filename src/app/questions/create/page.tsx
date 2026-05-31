import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import CreateClient from "./CreateClient";

export const metadata: Metadata = buildMetadata({
  title: "질문 작성 — 새로운 발제 만들기",
  description: "직접 작성하거나 AI 도움으로 새로운 북클럽 발제 질문을 만들어보세요. 좋은 질문은 좋은 대화를 만듭니다.",
  path: "/questions/create",
  type: "website",
  keywords: ["발제질문작성", "북클럽발제", "독서토론질문"],
  noIndex: true,
});

export default function CreateQuestionPage() {
  return <CreateClient />;
}
