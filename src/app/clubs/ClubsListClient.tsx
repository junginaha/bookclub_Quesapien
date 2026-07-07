"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getCurrentPosition } from "@/lib/geo";
import { formatSeoulDateTime } from "@/lib/time";
import type { ClubRow, MeetingRow } from "@/lib/supabase/types";

interface Item {
  club: ClubRow;
  nextMeeting: MeetingRow | null;
}

// §C1 구조적 귀결① — 홈뿐 아니라 이 목록의 기본 정렬 원칙도 "내 근처"다.
export default function ClubsListClient({ items: initialItems }: { items: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [queryText, setQueryText] = useState("");

  const handleUseLocation = async () => {
    setLocating(true);
    setLocError("");
    try {
      const { lat, lng } = await getCurrentPosition();
      const res = await fetch(`/api/clubs/nearby?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      const clubs: ClubRow[] = data.clubs ?? [];
      setItems(clubs.map((club) => ({ club, nextMeeting: null })));
    } catch {
      setLocError("위치 정보를 가져오지 못했어요. 지역명으로 검색해보세요.");
    } finally {
      setLocating(false);
    }
  };

  const handleTextSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/clubs/nearby?q=${encodeURIComponent(queryText)}`);
    const data = await res.json();
    const clubs: ClubRow[] = data.clubs ?? [];
    setItems(clubs.map((club) => ({ club, nextMeeting: null })));
  };

  return (
    <div className="container-base section-padding">
      <p className="eyebrow" style={{ marginBottom: 8 }}>Book Clubs</p>
      <h1 style={{
        fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
        fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, color: "var(--ink)", marginBottom: 24,
      }}>
        내 근처 북클럽
      </h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap", alignItems: "center" }}>
        <button
          type="button" onClick={handleUseLocation} disabled={locating}
          style={{
            padding: "10px 18px", borderRadius: 10, fontSize: 13.5,
            background: "white", border: "1.5px solid var(--line)", color: "var(--ink-soft)",
            cursor: locating ? "not-allowed" : "pointer",
          }}
        >
          <MapPin size={14} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
          {locating ? "위치 확인 중…" : "내 위치로 찾기"}
        </button>
        <form onSubmit={handleTextSearch} style={{ display: "flex", gap: 8 }}>
          <input
            type="text" value={queryText} onChange={(e) => setQueryText(e.target.value)}
            placeholder="지역명으로 검색 (예: 서초)"
            style={{
              padding: "10px 14px", borderRadius: 10, fontSize: 13.5,
              border: "1.5px solid var(--line-soft)", background: "rgba(255,255,255,0.7)", minWidth: 200,
            }}
          />
          <button type="submit" style={{
            padding: "10px 16px", borderRadius: 10, fontSize: 13.5,
            background: "var(--ink)", color: "var(--cream-on-dark)", border: "none", cursor: "pointer",
          }}>검색</button>
        </form>
        {locError && <span style={{ fontSize: 12.5, color: "#EF4444" }}>{locError}</span>}
      </div>

      {items.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 14.5 }}>등록된 북클럽이 아직 없어요.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {items.map(({ club, nextMeeting }) => (
            <Link
              key={club.id}
              href={`/clubs/${club.slug}`}
              className="card-base"
              style={{ display: "block", padding: 24, textDecoration: "none" }}
            >
              <h2 style={{
                fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 18, fontWeight: 600,
                color: "var(--ink)", marginBottom: 8,
              }}>
                {club.name}
              </h2>
              {club.location_name && (
                <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={12} /> {club.location_name}
                </p>
              )}
              {club.description && (
                <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 12 }}>
                  {club.description}
                </p>
              )}
              {nextMeeting && (
                <div style={{ borderTop: "1px solid var(--line-soft)", paddingTop: 12, fontSize: 12.5, color: "var(--accent)" }}>
                  다음 모임 · {formatSeoulDateTime(nextMeeting.starts_at)}
                  {nextMeeting.book_title && ` · ${nextMeeting.book_title}`}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
