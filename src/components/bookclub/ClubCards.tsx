"use client";

import Link from "next/link";
import { MapPin, Calendar, ChevronRight } from "lucide-react";
import {
  type BookClubRecord,
  CLUB_COLOR_MAP,
  DEFAULT_ENCORE_THRESHOLD,
  encoreCopy,
  getEventStart,
  isFull,
} from "@/lib/bookclub";
import { formatSeoulDate, formatSeoulTime } from "@/lib/time";
import { badgeText, computeStatus } from "@/lib/bookclubBoard";
import EncoreRequestButton from "./EncoreRequestButton";

function CoverImage({ club }: { club: BookClubRecord }) {
  const bg = CLUB_COLOR_MAP[club.color ?? ""] ?? "#1B2536";
  if (club.photo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={club.photo_url}
        alt={`${club.title}${club.author ? ` — ${club.author}` : ""} 북클럽 대표 이미지`}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={`${club.title} 북클럽 표지`}
      style={{ position: "absolute", inset: 0, background: bg }}
    />
  );
}

export function CurrentClubCard({ club }: { club: BookClubRecord }) {
  const start = getEventStart(club);
  const full = isFull(club);

  // /bookclub 게시판과 같은 문구를 쓰기 위해 같은 상태 계산·배지 함수를 그대로
  // 재사용한다 — 정원 숫자는 여기서도 노출하지 않는다(게시판과 동일 원칙).
  const capacity = club.max_participants ?? 0;
  const applied = club.current_participants ?? 0;
  const closesAt = club.registration_closes_at ? new Date(club.registration_closes_at) : start;
  const { status, left } = start && closesAt
    ? computeStatus(new Date(), start, closesAt, capacity, applied)
    : { status: "open" as const, left: 0 };
  const badge = badgeText(status, left, 0);

  return (
    <Link href="/bookclub" style={{ textDecoration: "none" }}>
      <article
        className="card-base"
        style={{ background: "white", display: "flex", flexDirection: "column", opacity: full ? 0.75 : 1 }}
      >
        <div style={{ height: 180, position: "relative", overflow: "hidden" }}>
          <CoverImage club={club} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 55%)" }} />
          {status !== "open" && badge && (
            <span style={{ position: "absolute", top: 14, right: 14, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 9999, background: "rgba(255,255,255,0.85)", color: "var(--ink)" }}>
              {badge}
            </span>
          )}
          <div style={{ position: "absolute", bottom: 14, left: 16, right: 16 }}>
            <h3 style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 19, color: "white", lineHeight: 1.3, marginBottom: 2 }}>
              {club.title}
            </h3>
          </div>
        </div>

        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          {club.author && (
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              함께 읽는 작가 · {club.author}
              {club.author_hosts && (
                <span style={{ marginLeft: 6, fontSize: 11, color: "var(--accent)", fontWeight: 500 }}>
                  {club.author === club.host_name ? "저자 직접 진행" : "저자와의 만남"}
                </span>
              )}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--muted)" }}>
            <Calendar size={12} />
            <span>{start ? `${formatSeoulDate(start)} ${formatSeoulTime(start)}` : "일정 조율 중"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--muted)" }}>
            <MapPin size={12} />
            <span>{[club.area, club.location].filter(Boolean).join(" · ") || "장소 미정"}</span>
          </div>

          <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
              참여 신청 <ChevronRight size={14} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function EncoreClubCard({ club }: { club: BookClubRecord }) {
  const lastStart = getEventStart(club);
  const count = club.encore_request_count ?? 0;
  const threshold = club.encore_threshold ?? DEFAULT_ENCORE_THRESHOLD;

  return (
    <article className="card-base" style={{ background: "white", display: "flex", flexDirection: "column" }}>
      <Link href="/bookclub" style={{ textDecoration: "none" }}>
        <div style={{ height: 180, position: "relative", overflow: "hidden" }}>
          <CoverImage club={club} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(20,24,31,0.45)" }} />
          <div style={{ position: "absolute", bottom: 14, left: 16, right: 16 }}>
            <h3 style={{ fontFamily: "var(--font-noto-serif-kr), Georgia, serif", fontSize: 19, color: "white", lineHeight: 1.3 }}>
              {club.title}
            </h3>
          </div>
        </div>
      </Link>

      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {club.author && <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>함께 읽는 작가 · {club.author}</div>}

        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--muted)" }}>
          <Calendar size={12} />
          <span>{lastStart ? `지난 진행 · ${formatSeoulDate(lastStart)}` : "지난 진행 기록"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--muted)" }}>
          <MapPin size={12} />
          <span>{[club.area, club.location].filter(Boolean).join(" · ") || "장소 미정"}</span>
        </div>

        <Link href="/bookclub" style={{ fontSize: 12.5, color: "var(--accent)", textDecoration: "underline" }}>
          지난 모임 기록 보기
        </Link>

        <p style={{ fontSize: 12.5, color: "var(--muted)", whiteSpace: "pre-line", margin: "4px 0" }}>
          {encoreCopy(count, threshold)}
        </p>

        <div style={{ marginTop: "auto", paddingTop: 10 }}>
          <EncoreRequestButton clubSlug={club.slug} />
        </div>
      </div>
    </article>
  );
}
