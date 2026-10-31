import { redirect } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { BOOKCLUB_SESSIONS } from "@/lib/bookclub/data";
import BookClubAdminClient, { type ApplicationRow, type ReviewRow, type WaitlistRow } from "./BookClubAdminClient";

export const dynamic = "force-dynamic";

export default async function BookClubAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/");

  let applications: ApplicationRow[] = [];
  let waitlist: WaitlistRow[] = [];
  let reviews: ReviewRow[] = [];
  let loadError: string | null = null;

  try {
    const db = createServiceClient();
    const BASE = "id, club_slug, name, phone, email, note, status, created_at";
    // 026(결제 기록 칸)이 아직 적용되지 않은 DB에서는 paid_at·payment_state가 없어
    // 조회가 통째로 실패한다 — 그러면 관리자 화면이 빈 화면이 된다.
    // 결제 열 없이 한 번 더 시도해서, 적어도 신청 목록은 늘 보이게 한다.
    // 027(출석 기록)까지 있는 DB가 가장 넓고, 없으면 한 단계씩 좁혀 간다.
    // 중요한 건 **어느 경우에도 신청 목록 자체는 보인다**는 것이다.
    let appData: unknown[] | null = null;
    let appErr: unknown = null;
    {
      const SELECTS = [
        `${BASE}, paid_at, payment_state, attended_at, no_show_at`,
        `${BASE}, paid_at, payment_state`,
        BASE,
      ];
      for (const sel of SELECTS) {
        const r = await db.from("bookclub_applications").select(sel).order("created_at", { ascending: false });
        if (!r.error) { appData = r.data; appErr = null; break; }
        appErr = r.error;
      }
    }
    const { data: waitData, error: waitErr } = await db
      .from("bookclub_waitlist")
      .select("*")
      .order("created_at", { ascending: false });
    // 후기(028). 테이블이 없으면 빈 목록 — 신청 관리 화면 자체는 멀쩡해야 한다.
    {
      const r = await db
        .from("bookclub_reviews")
        .select("id, club_slug, author_name, content, is_published, created_at")
        .order("created_at", { ascending: false });
      reviews = r.error ? [] : ((r.data ?? []) as ReviewRow[]);
    }
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
        clubs={BOOKCLUB_SESSIONS.map((c) => ({ slug: c.slug, title: c.title, capacity: c.capacity, startsAt: c.startsAt }))}
        applications={applications}
        waitlist={waitlist}
        reviews={reviews}
        loadError={loadError}
      />
      <Footer />
    </div>
  );
}
