import type { BookClubSession } from "@/lib/bookclub/types";
import HomeCalendarLocationHub from "@/components/home/HomeCalendarLocationHub";

export default function BookingCalendar({ sessions }: { sessions: BookClubSession[] }) {
  return <HomeCalendarLocationHub sessions={sessions} headingLevel={1} />;
}
