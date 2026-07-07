"use client";

import { useState } from "react";
import type { ClubRow, MeetingRow } from "@/lib/supabase/types";
import { formatSeoulDateTime } from "@/lib/time";

interface ClubWithMeetings {
  club: ClubRow;
  meetings: MeetingRow[];
}

interface AttendanceRow {
  meeting_id: string;
  user_id: string;
  status: string;
  created_at: string;
  profile?: { nickname: string } | null;
}

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9가-힣-]/g, "");
}

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13.5,
  border: "1px solid var(--line-soft)", background: "white", boxSizing: "border-box",
};
const label: React.CSSProperties = { fontSize: 12, color: "var(--muted)", marginBottom: 4, display: "block" };
const btn: React.CSSProperties = {
  padding: "9px 16px", borderRadius: 8, fontSize: 13.5, fontWeight: 600,
  background: "var(--ink)", color: "var(--cream-on-dark)", border: "none", cursor: "pointer",
};

export default function AdminMeetingsClient({ initialClubs }: { initialClubs: ClubWithMeetings[] }) {
  const [clubs, setClubs] = useState(initialClubs);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(clubs[0]?.club.id ?? null);
  const [showNewClub, setShowNewClub] = useState(false);
  const [error, setError] = useState("");

  const [newClub, setNewClub] = useState({
    name: "", slug: "", location_name: "", capacity: "", join_policy: "open",
    description: "", format_note: "", review_excerpts: "", faqQ: "", faqA: "",
  });
  const [newMeeting, setNewMeeting] = useState({ book_title: "", starts_at: "", place_name: "", capacity: "" });

  const [attendances, setAttendances] = useState<Record<string, AttendanceRow[]>>({});
  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);

  const selected = clubs.find((c) => c.club.id === selectedClubId) ?? null;

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const vibe: Record<string, unknown> = {};
    if (newClub.format_note.trim()) vibe.format_note = newClub.format_note.trim();
    if (newClub.review_excerpts.trim()) vibe.review_excerpts = newClub.review_excerpts.split("\n").map((s) => s.trim()).filter(Boolean);
    if (newClub.faqQ.trim() && newClub.faqA.trim()) vibe.faq = [{ q: newClub.faqQ.trim(), a: newClub.faqA.trim() }];

    const res = await fetch("/api/admin/qclubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newClub.name,
        slug: newClub.slug || slugify(newClub.name),
        location_name: newClub.location_name || null,
        capacity: newClub.capacity || null,
        join_policy: newClub.join_policy,
        description: newClub.description || null,
        vibe: Object.keys(vibe).length > 0 ? vibe : null,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "클럽 생성에 실패했어요."); return; }
    setClubs((prev) => [{ club: data.club, meetings: [] }, ...prev]);
    setSelectedClubId(data.club.id);
    setShowNewClub(false);
    setNewClub({ name: "", slug: "", location_name: "", capacity: "", join_policy: "open", description: "", format_note: "", review_excerpts: "", faqQ: "", faqA: "" });
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubId) return;
    setError("");
    const res = await fetch("/api/admin/qmeetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        club_id: selectedClubId,
        book_title: newMeeting.book_title || null,
        starts_at: new Date(newMeeting.starts_at).toISOString(),
        place_name: newMeeting.place_name || null,
        capacity: newMeeting.capacity || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "회차 생성에 실패했어요."); return; }
    setClubs((prev) => prev.map((c) => c.club.id === selectedClubId ? { ...c, meetings: [...c.meetings, data.meeting] } : c));
    setNewMeeting({ book_title: "", starts_at: "", place_name: "", capacity: "" });
  };

  const loadAttendances = async (meetingId: string) => {
    if (expandedMeetingId === meetingId) { setExpandedMeetingId(null); return; }
    const res = await fetch(`/api/admin/qmeetings/${meetingId}/attendances`);
    const data = await res.json();
    if (res.ok) setAttendances((prev) => ({ ...prev, [meetingId]: data.attendances }));
    setExpandedMeetingId(meetingId);
  };

  const updateAttendance = async (meetingId: string, userId: string, status: string) => {
    const res = await fetch(`/api/admin/qmeetings/${meetingId}/attendances`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, status }),
    });
    if (res.ok) {
      setAttendances((prev) => ({
        ...prev,
        [meetingId]: (prev[meetingId] ?? []).map((a) => a.user_id === userId ? { ...a, status } : a),
      }));
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "280px 1fr", gap: 28 }}>
      {/* ── 클럽 목록 ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>클럽 관리</h1>
          <button onClick={() => setShowNewClub((v) => !v)} style={{ ...btn, padding: "6px 10px", fontSize: 12 }}>+ 새 클럽</button>
        </div>

        {showNewClub && (
          <form onSubmit={handleCreateClub} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, padding: 14, border: "1px solid var(--line-soft)", borderRadius: 10 }}>
            <div><label style={label}>이름 *</label><input required style={inp} value={newClub.name} onChange={(e) => setNewClub({ ...newClub, name: e.target.value })} /></div>
            <div><label style={label}>slug (비워두면 자동)</label><input style={inp} value={newClub.slug} onChange={(e) => setNewClub({ ...newClub, slug: e.target.value })} placeholder={slugify(newClub.name)} /></div>
            <div><label style={label}>지역명</label><input style={inp} value={newClub.location_name} onChange={(e) => setNewClub({ ...newClub, location_name: e.target.value })} /></div>
            <div><label style={label}>정원</label><input type="number" style={inp} value={newClub.capacity} onChange={(e) => setNewClub({ ...newClub, capacity: e.target.value })} /></div>
            <div>
              <label style={label}>참여 방식</label>
              <select style={inp} value={newClub.join_policy} onChange={(e) => setNewClub({ ...newClub, join_policy: e.target.value })}>
                <option value="open">자유 참여</option>
                <option value="approval">승인제</option>
              </select>
            </div>
            <div><label style={label}>소개</label><textarea style={{ ...inp, minHeight: 60 }} value={newClub.description} onChange={(e) => setNewClub({ ...newClub, description: e.target.value })} /></div>
            <div><label style={label}>진행 방식 (분위기)</label><textarea style={{ ...inp, minHeight: 50 }} value={newClub.format_note} onChange={(e) => setNewClub({ ...newClub, format_note: e.target.value })} /></div>
            <div><label style={label}>후기 발췌 (줄바꿈으로 구분)</label><textarea style={{ ...inp, minHeight: 60 }} value={newClub.review_excerpts} onChange={(e) => setNewClub({ ...newClub, review_excerpts: e.target.value })} /></div>
            <div><label style={label}>FAQ 질문</label><input style={inp} value={newClub.faqQ} onChange={(e) => setNewClub({ ...newClub, faqQ: e.target.value })} /></div>
            <div><label style={label}>FAQ 답변</label><input style={inp} value={newClub.faqA} onChange={(e) => setNewClub({ ...newClub, faqA: e.target.value })} /></div>
            <button type="submit" style={btn}>클럽 생성</button>
          </form>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {clubs.map(({ club }) => (
            <button
              key={club.id}
              onClick={() => setSelectedClubId(club.id)}
              style={{
                textAlign: "left", padding: "10px 12px", borderRadius: 8, fontSize: 13.5,
                background: selectedClubId === club.id ? "rgba(94,70,50,0.08)" : "transparent",
                color: selectedClubId === club.id ? "var(--accent)" : "var(--ink-soft)",
                border: "none", cursor: "pointer",
              }}
            >
              {club.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── 선택된 클럽의 모임 관리 ── */}
      <div>
        {error && <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        {selected ? (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 16 }}>{selected.club.name} — 회차 관리</h2>

            <form onSubmit={handleCreateMeeting} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, padding: 14, border: "1px solid var(--line-soft)", borderRadius: 10 }}>
              <div style={{ flex: "1 1 160px" }}><label style={label}>도서명</label><input style={inp} value={newMeeting.book_title} onChange={(e) => setNewMeeting({ ...newMeeting, book_title: e.target.value })} /></div>
              <div style={{ flex: "1 1 180px" }}><label style={label}>일시 *</label><input required type="datetime-local" style={inp} value={newMeeting.starts_at} onChange={(e) => setNewMeeting({ ...newMeeting, starts_at: e.target.value })} /></div>
              <div style={{ flex: "1 1 140px" }}><label style={label}>장소</label><input style={inp} value={newMeeting.place_name} onChange={(e) => setNewMeeting({ ...newMeeting, place_name: e.target.value })} /></div>
              <div style={{ flex: "0 1 90px" }}><label style={label}>정원</label><input type="number" style={inp} value={newMeeting.capacity} onChange={(e) => setNewMeeting({ ...newMeeting, capacity: e.target.value })} /></div>
              <div style={{ display: "flex", alignItems: "flex-end" }}><button type="submit" style={btn}>회차 추가</button></div>
            </form>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {selected.meetings.length === 0 && <p style={{ color: "var(--muted)", fontSize: 13.5 }}>등록된 회차가 없어요.</p>}
              {selected.meetings.map((m) => (
                <div key={m.id} style={{ border: "1px solid var(--line-soft)", borderRadius: 10, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{formatSeoulDateTime(m.starts_at)}</p>
                      <p style={{ fontSize: 12.5, color: "var(--muted)" }}>{m.book_title} {m.place_name && `· ${m.place_name}`}</p>
                    </div>
                    <button onClick={() => loadAttendances(m.id)} style={{ ...btn, background: "white", color: "var(--ink-soft)", border: "1px solid var(--line)" }}>
                      참가자 {expandedMeetingId === m.id ? "닫기" : "관리"}
                    </button>
                  </div>

                  {expandedMeetingId === m.id && (
                    <div style={{ marginTop: 12, borderTop: "1px solid var(--line-soft)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                      {(attendances[m.id] ?? []).length === 0 && <p style={{ fontSize: 12.5, color: "var(--muted)" }}>신청자가 없어요.</p>}
                      {(attendances[m.id] ?? []).map((a) => (
                        <div key={a.user_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                          <span>{a.profile?.nickname ?? a.user_id.slice(0, 8)} — <em style={{ color: "var(--muted)" }}>{a.status}</em></span>
                          <div style={{ display: "flex", gap: 6 }}>
                            {a.status === "pending" && (
                              <button onClick={() => updateAttendance(m.id, a.user_id, "applied")} style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>승인</button>
                            )}
                            {a.status !== "attended" && (
                              <button onClick={() => updateAttendance(m.id, a.user_id, "attended")} style={{ fontSize: 12, color: "#10B981", background: "none", border: "none", cursor: "pointer" }}>출석</button>
                            )}
                            {a.status !== "no_show" && (
                              <button onClick={() => updateAttendance(m.id, a.user_id, "no_show")} style={{ fontSize: 12, color: "#EF4444", background: "none", border: "none", cursor: "pointer" }}>노쇼</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p style={{ color: "var(--muted)" }}>왼쪽에서 클럽을 선택하거나 새로 만들어주세요.</p>
        )}
      </div>
    </div>
  );
}
