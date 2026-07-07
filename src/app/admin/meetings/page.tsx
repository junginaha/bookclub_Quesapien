import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isOperator } from "@/lib/admin";
import { getClubs, getUpcomingMeetings } from "@/lib/clubQueries";
import AdminMeetingsClient from "./AdminMeetingsClient";

export const metadata: Metadata = { title: "클럽·모임 관리 — 질문하는 사람들" };

// Quesapience 2.0 운영자 대시보드. 기존 /admin/clubs(landing_book_clubs 모델)와는
// 별개다 — 이 화면은 신규 clubs/meetings/meeting_attendances 모델을 관리한다.
export default async function AdminMeetingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/meetings");
  if (!(await isOperator(supabase))) redirect("/");

  const clubs = await getClubs(200);
  const clubsWithMeetings = await Promise.all(
    clubs.map(async (club) => ({ club, meetings: await getUpcomingMeetings(club.id, 20) }))
  );

  return <AdminMeetingsClient initialClubs={clubsWithMeetings} />;
}
