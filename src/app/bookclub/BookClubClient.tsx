"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import {
  type BookClubRecord,
  type ClubView,
  FALLBACK_CLUBS,
  classifyClub,
  sortAgain,
  sortByRecent,
  sortNow,
  visibleClubs,
} from "@/lib/bookclub";
import { CurrentClubCard, EncoreClubCard } from "@/components/bookclub/ClubCards";

const NOW_SORTS = [
  { key: "date", label: "가까운 일정순" },
  { key: "closing", label: "마감 임박순" },
] as const;
const AGAIN_SORTS = [
  { key: "count", label: "앵콜 요청 많은 순" },
  { key: "recent", label: "최근 진행순" },
] as const;

function matchesSearch(club: BookClubRecord, q: string): boolean {
  if (!q.trim()) return true;
  const haystack = [club.title, club.author, club.host_name, club.area, club.location, club.tag]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q.trim().toLowerCase());
}

export default function BookClubClient({ initialClubs }: { initialClubs: BookClubRecord[] }) {
  const clubs = visibleClubs(initialClubs.length > 0 ? initialClubs : FALLBACK_CLUBS);
  const router = useRouter();
  const searchParams = useSearchParams();
  const view: ClubView = searchParams.get("view") === "again" ? "again" : "now";

  const [search, setSearch] = useState("");
  const [nowSort, setNowSort] = useState<(typeof NOW_SORTS)[number]["key"]>("date");
  const [againSort, setAgainSort] = useState<(typeof AGAIN_SORTS)[number]["key"]>("count");

  const setView = (v: ClubView) => {
    router.replace(`/bookclub?view=${v}`, { scroll: false });
  };

  const { nowClubs, againClubs } = useMemo(() => {
    const now: BookClubRecord[] = [];
    const again: BookClubRecord[] = [];
    for (const c of clubs) (classifyClub(c) === "now" ? now : again).push(c);
    now.sort(sortNow);
    again.sort(sortAgain);
    if (nowSort === "closing") {
      now.sort((a, b) => {
        const ra = a.max_participants != null && a.current_participants != null ? a.max_participants - a.current_participants : Infinity;
        const rb = b.max_participants != null && b.current_participants != null ? b.max_participants - b.current_participants : Infinity;
        return ra - rb;
      });
    }
    if (againSort === "recent") again.sort(sortByRecent);
    return { nowClubs: now, againClubs: again };
  }, [clubs, nowSort, againSort]);

  const filteredNow = nowClubs.filter((c) => matchesSearch(c, search));
  const filteredAgain = againClubs.filter((c) => matchesSearch(c, search));
  const activeList = view === "now" ? filteredNow : filteredAgain;

  return (
    <div style={{ background: "var(--bg)" }}>
      {/* Hero */}
      <section style={{
        padding: "72px 0 40px",
        borderBottom: "1px solid var(--line-soft)",
        background: "linear-gradient(to bottom, rgba(244,239,229,0) 0%, var(--bg-soft) 100%)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
          <div style={{ fontSize: 11.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--muted)", fontFamily: '"EB Garamond", Georgia, serif', fontStyle: "italic", marginBottom: 20 }}>
            Book Club — 북클럽
          </div>
          <h1 style={{
            fontFamily: "var(--font-noto-serif-kr), Georgia, serif",
            fontSize: "clamp(32px, 6vw, 64px)",
            fontWeight: 400,
            lineHeight: 1.18,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            marginBottom: 20,
          }}>
            책과 질문으로<br />
            <em style={{ fontStyle: "normal", fontWeight: 600, color: "var(--accent)", fontFamily: "var(--font-noto-serif-kr), Georgia, serif", background: "linear-gradient(90deg, var(--accent), #B08A4A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>만나는</em> 사람들.
          </h1>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.75, maxWidth: 480, marginBottom: 36 }}>
            리더와 함께 읽고, 질문하고, 대화해요.<br />
            오프라인에서만 가능한 깊이의 연결.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px clamp(20px, 4vw, 48px) 0" }}>
        <div role="tablist" aria-label="북클럽 보기 전환" style={{ display: "flex", gap: 8, flexWrap: "nowrap", overflowX: "auto" }}>
          {(["now", "again"] as const).map((v) => {
            const selected = view === v;
            return (
              <button
                key={v}
                role="tab"
                aria-selected={selected}
                onClick={() => setView(v)}
                style={{
                  padding: "12px 22px",
                  minHeight: 48,
                  borderRadius: 9999,
                  fontSize: 14.5,
                  fontWeight: selected ? 600 : 500,
                  background: selected ? "var(--ink)" : "transparent",
                  color: selected ? "var(--cream-on-dark)" : "var(--ink-soft)",
                  border: selected ? "1px solid var(--ink)" : "1px solid var(--line)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                {v === "now" ? "지금 함께 읽어요" : "다시 함께 읽어요"}
              </button>
            );
          })}
        </div>
        <p style={{ marginTop: 12, fontSize: 13.5, color: "var(--muted)" }}>
          {view === "now" ? "현재 신청 가능한 북클럽" : "앵콜을 기다리는 북클럽"}
        </p>

        {/* Secondary controls: search + sort */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20, marginBottom: 8 }}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="북클럽 · 책 · 저자 · 리더 · 지역으로 검색"
              style={{ width: "100%", padding: "10px 14px 10px 34px", borderRadius: 9999, border: "1px solid var(--line)", fontSize: 13.5, background: "white" }}
            />
          </div>
          <select
            value={view === "now" ? nowSort : againSort}
            onChange={(e) => (view === "now" ? setNowSort(e.target.value as typeof nowSort) : setAgainSort(e.target.value as typeof againSort))}
            style={{ padding: "10px 14px", borderRadius: 9999, border: "1px solid var(--line)", fontSize: 13.5, background: "white" }}
          >
            {(view === "now" ? NOW_SORTS : AGAIN_SORTS).map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <section style={{ padding: "24px 0 120px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
          {activeList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
              {view === "now"
                ? "지금은 신청 가능한 북클럽이 없어요. 곧 새 일정이 열려요."
                : "아직 앵콜을 기다리는 북클럽이 없어요."}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
              {activeList.map((club) =>
                view === "now"
                  ? <CurrentClubCard key={club.id} club={club} />
                  : <EncoreClubCard key={club.id} club={club} />
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
