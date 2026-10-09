"use client";

// 구 앵콜 버튼 — 저장 경로를 EncoreForm(/api/bookclub/encore, slug 기준·실연락처)으로 일원화했다.
// 기존 호출부(TimelineCard)가 깨지지 않도록 같은 이름·props로 남겨둔다.
import EncoreForm from "./EncoreForm";
import { getSession } from "@/lib/bookclub/data";

export default function EncoreRequestButton({ clubSlug }: { clubSlug: string; initialRequested?: boolean }) {
  return <EncoreForm slug={clubSlug} bookTitle={getSession(clubSlug)?.bookTitle ?? ""} />;
}
