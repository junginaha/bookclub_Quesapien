import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import BookClubBoard from "@/components/bookclub-board/BookClubBoard";
import type { BoardCardData, PastClubData } from "@/components/bookclub-board/types";
import { createServiceClient } from "@/lib/supabase/server";
import { computeStatus, DEFAULT_NAME_EXAMPLE, pickAskLine } from "@/lib/bookclubBoard";
import { REAL_CLUBS } from "@/lib/bookclub";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "북클럽 — 오프라인 북토크 일정",
  description:
    "질문하는 사람들의 오프라인 북토크 일정. 리더와 함께 책을 읽고 질문하며 대화합니다.",
  path: "/bookclub",
  type: "website",
  keywords: ["북토크", "오프라인독서모임", "독서모임일정", "소규모독서"],
});

export const revalidate = 60;

interface ClubRow {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  location: string | null;
  event_starts_at: string | null;
  event_ends_at: string | null;
  registration_closes_at: string | null;
  reason: string | null;
  description: string | null;
  key_questions: string[] | null;
  recommended_for: string[] | null;
  host_name: string | null;
  max_participants: number | null;
  price: number | null;
  price_note: string | null;
  bring: string | null;
  name_example: string | null;
  is_seed: boolean | null;
}

export default async function BookClubPage() {
  const board = await loadBoard();

  const crumbLd = breadcrumbSchema([
    { name: "홈", href: "/" },
    { name: "북클럽", href: "/bookclub" },
  ]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <JsonLd data={crumbLd} />
      <Header />
      <main style={{ flex: 1 }}>
        <BookClubBoard clubs={board.clubs} pastClubs={board.pastClubs} />
      </main>
      <Footer />
    </div>
  );
}

async function loadBoard(): Promise<{ clubs: BoardCardData[]; pastClubs: PastClubData[] }> {
  const result = await fetchBoardFromDb();
  if (result.clubs.length > 0 || result.pastClubs.length > 0) return result;
  // DB 미연결/미적용(마이그레이션 017 전) 또는 실데이터가 아직 없을 때 —
  // 기존 REAL_CLUBS(실제 등록된 3건 + 지난 2건)로 폴백한다. 구 /bookclub 페이지가
  // 이미 쓰던 것과 같은 복원력 패턴(DB 장애 ≠ 방문자에게 빈 화면 노출).
  return fallbackBoard();
}

function fallbackBoard(): { clubs: BoardCardData[]; pastClubs: PastClubData[] } {
  const now = new Date();
  const clubs: BoardCardData[] = [];
  const pastClubs: PastClubData[] = [];

  for (const c of REAL_CLUBS) {
    if (!c.event_starts_at) continue;
    const startsAt = new Date(c.event_starts_at);
    const closesAt = c.registration_closes_at ? new Date(c.registration_closes_at) : startsAt;
    const capacity = c.max_participants ?? 0;
    const applied = c.current_participants ?? 0;
    const { status, left } = computeStatus(now, startsAt, closesAt, capacity, applied);

    if (status === "done") {
      pastClubs.push({
        id: c.id,
        slug: c.slug,
        bookTitle: c.title,
        bookAuthor: c.author,
        place: c.location ?? "",
        startsAt: startsAt.toISOString(),
      });
      continue;
    }

    clubs.push({
      id: c.id,
      slug: c.slug,
      bookTitle: c.title,
      bookAuthor: c.author,
      place: c.location ?? "",
      startsAt: startsAt.toISOString(),
      closesAt: closesAt.toISOString(),
      ask: c.reason ? pickAskLine(c.reason) : "",
      prose: c.description ?? "",
      questions: (c.key_questions ?? []).slice(0, 3),
      who: (c.recommended_for ?? []).slice(0, 3),
      hostName: c.host_name,
      price: c.price,
      nameExample: DEFAULT_NAME_EXAMPLE,
      status,
      left,
      waiting: 0,
      leftForSort: left,
    });
  }

  pastClubs.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
  return { clubs, pastClubs };
}

async function fetchBoardFromDb(): Promise<{ clubs: BoardCardData[]; pastClubs: PastClubData[] }> {
  try {
    const db = createServiceClient();
    const { data } = await db
      .from("landing_book_clubs")
      .select(
        "id, slug, title, author, location, event_starts_at, event_ends_at, registration_closes_at, reason, description, key_questions, recommended_for, host_name, max_participants, price, price_note, bring, name_example, is_seed"
      );

    const rows = ((data ?? []) as ClubRow[]).filter((r) => !r.is_seed && r.event_starts_at);
    const now = new Date();

    const clubIds = rows.map((r) => r.id);

    const [{ data: countsData }, { data: notesData }] = await Promise.all([
      clubIds.length
        ? db.from("landing_book_club_signup_counts").select("club_id, applied_count, waiting_count").in("club_id", clubIds)
        : Promise.resolve({ data: [] as { club_id: string; applied_count: number; waiting_count: number }[] }),
      clubIds.length
        ? db.from("landing_book_club_past_notes").select("club_id, note").in("club_id", clubIds)
        : Promise.resolve({ data: [] as { club_id: string; note: string }[] }),
    ]);

    const countsByClub = new Map(
      ((countsData ?? []) as { club_id: string; applied_count: number; waiting_count: number }[]).map((c) => [
        c.club_id,
        c,
      ])
    );
    const notesByClub = new Map(
      ((notesData ?? []) as { club_id: string; note: string }[]).map((n) => [n.club_id, n.note])
    );

    const clubs: BoardCardData[] = [];
    const pastClubs: PastClubData[] = [];

    for (const row of rows) {
      const startsAt = new Date(row.event_starts_at!);
      // registration_closes_at이 아직 비어있는 실데이터 대응 — 없으면 시작 시각을 마감으로 취급.
      const closesAt = row.registration_closes_at ? new Date(row.registration_closes_at) : startsAt;
      const capacity = row.max_participants ?? 0;
      const counts = countsByClub.get(row.id);
      const applied = counts?.applied_count ?? 0;
      const waiting = counts?.waiting_count ?? 0;

      const { status, left } = computeStatus(now, startsAt, closesAt, capacity, applied);

      if (status === "done") {
        pastClubs.push({
          id: row.id,
          slug: row.slug,
          bookTitle: row.title,
          bookAuthor: row.author ?? undefined,
          place: row.location ?? "",
          startsAt: startsAt.toISOString(),
          note: notesByClub.get(row.id),
        });
        continue;
      }

      clubs.push({
        id: row.id,
        slug: row.slug,
        bookTitle: row.title,
        bookAuthor: row.author ?? undefined,
        place: row.location ?? "",
        startsAt: startsAt.toISOString(),
        endsAt: row.event_ends_at ?? undefined,
        closesAt: closesAt.toISOString(),
        ask: row.reason ? pickAskLine(row.reason) : "",
        prose: row.description ?? "",
        questions: (row.key_questions ?? []).slice(0, 3),
        who: (row.recommended_for ?? []).slice(0, 3),
        hostName: row.host_name ?? undefined,
        price: row.price ?? undefined,
        priceNote: row.price_note ?? undefined,
        bring: row.bring ?? undefined,
        nameExample: row.name_example ?? DEFAULT_NAME_EXAMPLE,
        status,
        left,
        waiting,
        leftForSort: left,
      });
    }

    pastClubs.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

    return { clubs, pastClubs };
  } catch {
    return { clubs: [], pastClubs: [] };
  }
}
