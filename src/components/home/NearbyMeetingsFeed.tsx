import Link from "next/link";
import { MapPin, BookOpen } from "lucide-react";
import { formatSeoulDateTime } from "@/lib/time";
import type { ClubRow, MeetingRow } from "@/lib/supabase/types";

export type UpcomingMeetingFeedItem = MeetingRow & { club: ClubRow };

// §C1 구조적 귀결① — 홈은 "내 근처 다음 모임" 피드다. 기존 홈 섹션들(질문/북토크/거인)은
// 그대로 두고, 히어로 바로 다음에 이 피드 섹션 하나만 추가한다(§C2 — 불필요한 재스타일링 금지).
export default function NearbyMeetingsFeed({ items }: { items: UpcomingMeetingFeedItem[] }) {
  if (items.length === 0) return null;

  return (
    <section
      style={{
        padding: "56px clamp(20px, 4vw, 48px)",
        maxWidth: 1280, margin: "0 auto",
      }}
    >
      <p className="eyebrow" style={{ marginBottom: 8 }}>Nearby</p>
      <h2 style={{
        fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
        fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 600, color: "var(--ink)", marginBottom: 24,
      }}>
        다음 모임
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 16,
      }}>
        {items.map((meeting) => (
          <Link
            key={meeting.id}
            href={`/clubs/${meeting.club.slug}`}
            className="card-base"
            style={{ display: "block", padding: 20, textDecoration: "none" }}
          >
            <p style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, marginBottom: 6 }}>
              {formatSeoulDateTime(meeting.starts_at)}
            </p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
              {meeting.club.name}
            </p>
            {meeting.book_title && (
              <p style={{ fontSize: 13, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <BookOpen size={12} /> {meeting.book_title}
              </p>
            )}
            {meeting.club.location_name && (
              <p style={{ fontSize: 12.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                <MapPin size={12} /> {meeting.club.location_name}
              </p>
            )}
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <Link href="/clubs" style={{ fontSize: 13.5, color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
          북클럽 전체 보기 →
        </Link>
      </div>
    </section>
  );
}
