import type { ReactNode } from "react";
import type { BookClubSession, SessionStatus } from "@/lib/bookclub/types";
import { dateKey, formatMonthDay, formatWeekdayFull } from "@/lib/bookclub/selectors";
import TimelineCard from "./TimelineCard";

export interface TimelineEntry {
  session: BookClubSession;
  status: SessionStatus;
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
    const key = dateKey(entry.session.startsAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(entry);
    } else {
      groups.push({ key, date: entry.session.startsAt, items: [entry] });
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
            {g.items.map(({ session, status }) => (
              <TimelineCard
                key={session.slug}
                session={session}
                status={status}
                highlighted={highlightedSlug === session.slug}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
