import type { Metadata } from "next";
import ClubsAdminClient from "./ClubsAdminClient";

export const metadata: Metadata = { title: "북클럽 관리 — 질문하는 사람들" };

export default function ClubsAdminPage() {
  return <ClubsAdminClient />;
}
