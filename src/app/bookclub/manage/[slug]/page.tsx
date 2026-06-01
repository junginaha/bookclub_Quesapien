import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import LeaderManageClient from "./LeaderManageClient";

export const metadata: Metadata = {
  title: "리더 관리 — 질문하는 사람들",
  robots: "noindex",
};

export default async function ManagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: _raw } = await params; const slug = decodeURIComponent(_raw);
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/bookclub/manage/${slug}`);

  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "junginaha@gmail.com").split(",");
  const isAdmin = ADMIN_EMAILS.includes(user.email ?? "");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: club } = await (supabase as any)
    .from("landing_book_clubs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!club) redirect("/bookclub");

  const isHost = isAdmin || club.host_id === user.id || club.created_by === user.id;
  if (!isHost) redirect(`/bookclub/${slug}`);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />
      <main style={{ flex: 1 }}>
        <LeaderManageClient club={club} isAdmin={isAdmin} />
      </main>
      <Footer />
    </div>
  );
}
