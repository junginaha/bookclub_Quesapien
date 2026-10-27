import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MyClubsV3 from "@/components/bookclub/v3/MyClubsV3";
import { getViewer } from "@/lib/viewer";
import { getMyReservations } from "@/lib/actions/my-bookclub";
import { getSessionsWithReserved } from "@/lib/bookclub/server";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "내 북클럽",
  description: "예약한 북클럽, 기다리는 북클럽, 함께 읽었던 책을 한곳에서.",
  path: "/mypage",
  noIndex: true,
});
export const dynamic = "force-dynamic";

export default async function MyPage() {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent("/mypage")}`);
  const [reservations, sessions] = await Promise.all([getMyReservations(), getSessionsWithReserved()]);
  return <MyClubsV3 name={viewer.name} phone={viewer.phone} reservations={reservations} sessions={sessions} />;
}
