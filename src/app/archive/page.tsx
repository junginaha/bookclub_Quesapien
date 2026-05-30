import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import ArchiveClient from "./ArchiveClient";
import { getReviews } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "아카이빙",
  description: "질문과 독서의 기록. 후기, 리뷰, 발제문, 북토크 기록을 모아봅니다.",
};

export const revalidate = 60;

export default async function ArchivePage() {
  let reviews: Awaited<ReturnType<typeof getReviews>> = [];
  try { reviews = await getReviews(60); } catch { /* use empty */ }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />
      <main style={{ flex: 1, paddingTop: 64 }}>
        <ArchiveClient initialReviews={reviews} />
      </main>
      <Footer />
    </div>
  );
}
