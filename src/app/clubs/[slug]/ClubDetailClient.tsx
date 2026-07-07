"use client";

import { MapPin, Users, BookOpen } from "lucide-react";
import { formatSeoulDateTime } from "@/lib/time";
import MeetingApplyButton from "@/components/clubs/MeetingApplyButton";
import type { ClubRow, MeetingRow } from "@/lib/supabase/types";
import type { MeetingSeats } from "@/lib/clubQueries";

interface Props {
  club: ClubRow;
  nextMeeting: MeetingRow | null;
  upcomingMeetings: MeetingRow[];
  memberCount: number;
  seats: MeetingSeats | null;
  myStatus: string | null;
  isLoggedIn: boolean;
}

// §C1 여정② — 스펙보다 분위기 우선: 후기 발췌, 진행 방식, 멤버 수, FAQ가
// 정원/일정보다 먼저 눈에 들어와야 한다. 중심 오브젝트는 "다음 모임 카드"(여정③).
export default function ClubDetailClient({
  club, nextMeeting, upcomingMeetings, memberCount, seats, myStatus, isLoggedIn,
}: Props) {
  const laterMeetings = upcomingMeetings.slice(1);

  return (
    <div className="container-base section-padding">
      {/* ── 분위기 우선 헤더 ── */}
      <div style={{ marginBottom: 40 }}>
        <p className="eyebrow" style={{ marginBottom: 8 }}>Book Club</p>
        <h1 style={{
          fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
          fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, color: "var(--ink)", marginBottom: 12,
        }}>
          {club.name}
        </h1>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13.5, color: "var(--muted)" }}>
          {club.location_name && (
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin size={14} /> {club.location_name}</span>
          )}
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Users size={14} /> 멤버 {memberCount}명</span>
          {club.join_policy === "approval" && (
            <span style={{ color: "var(--accent)" }}>승인제 클럽</span>
          )}
        </div>
        {club.description && (
          <p style={{ marginTop: 16, fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.8, maxWidth: 640 }}>
            {club.description}
          </p>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 32 }} className="club-detail-grid">
        {/* ── 분위기: 진행방식/후기발췌/FAQ ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {club.vibe?.format_note && (
            <section className="card-base" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", marginBottom: 10 }}>진행 방식</h2>
              <p style={{ fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.8 }}>{club.vibe.format_note}</p>
            </section>
          )}

          {club.vibe?.review_excerpts && club.vibe.review_excerpts.length > 0 && (
            <section className="card-base" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", marginBottom: 14 }}>참여자 후기</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {club.vibe.review_excerpts.map((excerpt, i) => (
                  <p key={i} style={{
                    fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.7, fontStyle: "italic",
                    borderLeft: "2px solid var(--line)", paddingLeft: 14,
                  }}>
                    &ldquo;{excerpt}&rdquo;
                  </p>
                ))}
              </div>
            </section>
          )}

          {club.vibe?.faq && club.vibe.faq.length > 0 && (
            <section className="card-base" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", marginBottom: 14 }}>자주 묻는 질문</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {club.vibe.faq.map((item, i) => (
                  <div key={i}>
                    <p style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{item.q}</p>
                    <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.7 }}>{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {laterMeetings.length > 0 && (
            <section className="card-base" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", marginBottom: 14 }}>다음 모임들</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {laterMeetings.map((m) => (
                  <div key={m.id} style={{ fontSize: 13.5, color: "var(--ink-soft)", display: "flex", gap: 8, alignItems: "center" }}>
                    <BookOpen size={13} />
                    {formatSeoulDateTime(m.starts_at)}
                    {m.book_title && ` · ${m.book_title}`}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── 다음 모임 카드: 참여 단위는 클럽이 아니라 회차(여정③) ── */}
        <div>
          {nextMeeting ? (
            <div className="card-base" style={{ padding: 28, position: "sticky", top: 100 }}>
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                다음 모임
              </p>
              <p style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                {formatSeoulDateTime(nextMeeting.starts_at)}
              </p>
              {nextMeeting.book_title && (
                <p style={{ fontSize: 14.5, color: "var(--accent)", marginBottom: 4 }}>{nextMeeting.book_title}</p>
              )}
              {nextMeeting.place_name && (
                <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 16, display: "flex", alignItems: "center", gap: 5 }}>
                  <MapPin size={13} /> {nextMeeting.place_name}
                </p>
              )}
              {seats && seats.capacity !== null && (
                <p style={{ fontSize: 13, color: seats.remaining === 0 ? "#EF4444" : "var(--muted)", marginBottom: 20 }}>
                  {seats.remaining === 0 ? "정원 마감 — 대기 신청 가능" : `남은 자리 ${seats.remaining} / ${seats.capacity}`}
                </p>
              )}
              <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                <MeetingApplyButton meetingId={nextMeeting.id} initialStatus={myStatus as "applied" | "pending" | "waitlist" | "attended" | "no_show" | "canceled" | null} isLoggedIn={isLoggedIn} />
              </div>
            </div>
          ) : (
            <div className="card-base" style={{ padding: 28, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
              예정된 다음 모임이 아직 없어요.
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .club-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
