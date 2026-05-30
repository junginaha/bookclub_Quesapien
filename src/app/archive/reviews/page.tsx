import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "리뷰 아카이브",
  description: "질문하는 사람들 독서 리뷰 아카이브. 책과 질문을 연결하는 깊이 있는 리뷰 모음.",
  path: "/archive/reviews",
  type: "website",
  keywords: ["독서리뷰", "북클럽리뷰", "질문기반리뷰", "책리뷰"],
});

// /archive 탭에 이미 reviews 탭이 있으므로 리디렉션
export default function ReviewsArchivePage() {
  redirect("/archive?tab=reviews");
}
