import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import BookClubClient from "./BookClubClient";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "북클럽",
  description: "리더와 함께하는 오프라인 북토크. 책과 질문으로 만나는 사람들.",
};

export const revalidate = 60;

export default async function BookClubPage() {
  let clubs: unknown[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("landing_book_clubs")
      .select("*")
      .order("sort_order", { ascending: true });
    clubs = data ?? [];
  } catch {
    // static fallback
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />
      <main style={{ flex: 1, paddingTop: 64 }}>
        <BookClubClient initialClubs={clubs} />
      </main>
      <Footer />
    </div>
  );
}
