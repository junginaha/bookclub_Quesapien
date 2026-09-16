import type { ReactNode } from "react";
import type { BookClub, ClubStatus } from "@/lib/bookclubs";
import { formatMonthDay, formatWeekdayFull, dateKey } from "@/lib/bookclubs";
import TimelineCard from "./TimelineCard";

export interface TimelineEntry {
  club: BookClub;
  status: ClubStatus;
  joinedCount: number;
}

export default function Timeline({
  entries,
  highlightedSlug,
  emptyMessage,
  emptyCta,
}: {
  entries: TimelineEntry[];
  highlightedSlug: string | null;
  emptyMessage: string;
  emptyCta?: ReactNode;
}) {
  if (entries.length === 0) {
    return (
      <div className="qc-empty">
        {emptyMessage}
        {emptyCta && <div className="qc-empty-cta">{emptyCta}</div>}
      </div>
    );
  }

  const groups: { key: string; date: string; items: TimelineEntry[] }[] = [];
  for (const entry of entries) {
    const key = dateKey(entry.club.startAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(entry);
    } else {
      groups.push({ key, date: entry.club.startAt, items: [entry] });
    }
  }

  return (
    <div className="qc-timeline">
      {groups.map((g) => (
        <div className="qc-tl-group" key={g.key}>
          <div className="qc-tl-group-label">
            {formatMonthDay(g.date)} {formatWeekdayFull(g.date)}
          </div>
          <div className="qc-tl-cards">
            {g.items.map(({ club, status, joinedCount }) => (
              <TimelineCard
                key={club.slug}
                club={club}
                status={status}
                joinedCount={joinedCount}
                highlighted={highlightedSlug === club.slug}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
