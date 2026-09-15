import { redirect } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { BOOKCLUBS } from "@/lib/bookclubs";
import BookClubAdminClient, { type ApplicationRow, type WaitlistRow } from "./BookClubAdminClient";

export const dynamic = "force-dynamic";

export default async function BookClubAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/");

  let applications: ApplicationRow[] = [];
  let waitlist: WaitlistRow[] = [];
  let loadError: string | null = null;

  try {
    const db = createServiceClient();
    const [{ data: appData, error: appErr }, { data: waitData, error: waitErr }] = await Promise.all([
      db
        .from("bookclub_applications")
        .select("id, club_slug, name, phone, email, note, status, created_at")
        .order("created_at", { ascending: false }),
      db
        .from("bookclub_waitlist")
        .select("id, club_slug, name, phone, created_at, notified_at")
        .order("created_at", { ascending: false }),
    ]);
    if (appErr || waitErr) throw appErr ?? waitErr;
    applications = (appData ?? []) as ApplicationRow[];
    waitlist = (waitData ?? []) as WaitlistRow[];
  } catch {
    loadError = "신청·대기자 목록을 불러오지 못했습니다. Supabase 연결을 확인해 주세요.";
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Header />
      <BookClubAdminClient
        clubs={BOOKCLUBS.map((c) => ({ slug: c.slug, title: c.title, capacity: c.capacity }))}
        applications={applications}
        waitlist={waitlist}
        loadError={loadError}
      />
      <Footer />
    </div>
  );
}
