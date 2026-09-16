import type { ReactNode } from "react";
import type { BookClub, ClubStatus } from "@/lib/bookclubs";
import { formatWeekdayFull, dateKey } from "@/lib/bookclubs";
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
      {groups.map((g) => {
        const day = parseInt(g.key.slice(-2), 10);
        const weekday = formatWeekdayFull(g.date).replace("요일", "");
        return (
          <div className="qc-tl-group" key={g.key}>
            <div className="qc-tl-datebadge" aria-hidden="true">
              <span className="qc-tl-datebadge-weekday">{weekday}</span>
              <span className="qc-tl-datebadge-day">{day}</span>
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
        );
      })}
    </div>
  );
}
