"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";

export interface BookClub {
  slug: string;
  title: string;
  author?: string;
  color: string;
  genre?: string;
  tag?: string;
  recommender?: string;
  reason?: string;
  emotionTags?: string[];
  isMini?: boolean;
  schedule?: string;
  location?: string;
  locationUrl?: string;
  joinUrl?: string;
  description?: string;
  hostName?: string;
  hostIntro?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  sessionDates?: Array<{ date: string; topic: string; closed?: boolean }>;
  photo_url?: string;
  lat?: number;
  lng?: number;
}

interface SessionRow { date: string; topic: string; closed: boolean; }

interface Props { book: BookClub | null; onClose: () => void; }

const ADMIN_EMAILS = ["junginaha@gmail.com", "kimjungin@quesapience.com"];
const DEADLINE_MARKER = "__deadline__";

// session_dates 안에 마감일을 특수 항목으로 저장·추출
function getDeadline(dates?: BookClub["sessionDates"]) {
  return dates?.find((s) => s.topic === DEADLINE_MARKER)?.date ?? "";
}
function getNormalDates(dates?: BookClub["sessionDates"]): SessionRow[] {
  return (dates ?? [])
    .filter((s) => s.topic !== DEADLINE_MARKER)
    .map((s) => ({ date: s.date, topic: s.topic, closed: s.closed ?? false }));
}
function buildDates(rows: SessionRow[], deadline: string): BookClub["sessionDates"] {
  const base = rows.map((r) => ({ date: r.date, topic: r.topic, closed: r.closed }));
  if (deadline) base.push({ date: deadline, topic: DEADLINE_MARKER, closed: false });
  return base;
}
function isDeadlinePast(deadline: string) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export default function BookDetailModal({ book, onClose }: Props) {
  const currentUser = useAppStore((s) => s.currentUser);
  const [detail, setDetail]     = useState<BookClub | null>(null);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk]     = useState(false);
  const [joined, setJoined]     = useState(false);
  const [quickUrl, setQuickUrl] = useState("");
  const [quickSaving, setQuickSaving] = useState(false);
  const [quickMsg, setQuickMsg] = useState("");

  // 편집 폼 상태
  const [form, setForm] = useState<Partial<BookClub>>({});
  const [rows, setRows] = useState<SessionRow[]>([]);          // 회차 목록
  const [deadline, setDeadline] = useState("");                  // 참석 마감일

  const isAdmin = currentUser
    ? ADMIN_EMAILS.includes(currentUser.email) || currentUser.name === "kimjungin"
    : false;
  const canEdit = isAdmin || (currentUser && detail?.hostName === currentUser.name);

  const loadDetail = useCallback(async (b: BookClub) => {
    const key = `bc_detail_${b.slug}`;
    const cached = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (cached) {
      try { setDetail({ ...b, ...JSON.parse(cached) }); } catch { setDetail(b); }
    } else {
      setDetail(b);
    }
    try {
      const res = await fetch(`/api/book-clubs/${b.slug}`);
      if (res.ok) {
        const data = await res.json() as { club: Record<string, unknown> };
        const merged: BookClub = {
          ...b,
          schedule:           data.club.schedule as string,
          location:           data.club.location as string,
          locationUrl:        data.club.location_url as string,
          // 관리자: join_url 직접, 비관리자: has_join_url 플래그로 처리
          joinUrl: (data.club.join_url as string | undefined)
            ?? (data.club.has_join_url ? "__hidden__" : undefined),
          description:        data.club.description as string,
          hostName:           data.club.host_name as string,
          hostIntro:          data.club.host_intro as string,
          maxParticipants:    data.club.max_participants as number,
          currentParticipants: data.club.current_participants as number,
          sessionDates:       data.club.session_dates as BookClub["sessionDates"],
          photo_url:          data.club.photo_url as string,
        };
        setDetail(merged);
        localStorage.setItem(key, JSON.stringify(merged));
      }
    } catch { /* offline */ }
  }, []);

  useEffect(() => {
    if (!book) { setDetail(null); setEditing(false); return; }
    loadDetail(book);
    setJoined(typeof window !== "undefined" && localStorage.getItem(`joined_${book.slug}`) === "1");
  }, [book, loadDetail]);

  useEffect(() => {
    if (!book) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [book, onClose]);

  const startEdit = () => {
    setForm({
      schedule: detail?.schedule ?? "",
      location: detail?.location ?? "",
      locationUrl: detail?.locationUrl ?? "",
      joinUrl: detail?.joinUrl ?? "",
      description: detail?.description ?? "",
      hostName: detail?.hostName ?? "",
      hostIntro: detail?.hostIntro ?? "",
      maxParticipants: detail?.maxParticipants,
      photo_url: detail?.photo_url ?? "",
    });
    setRows(getNormalDates(detail?.sessionDates));
    setDeadline(getDeadline(detail?.sessionDates));
    setEditing(true);
  };

  const handleSave = async () => {
    if (!detail) return;
    setSaving(true); setSaveError(""); setSaveOk(false);
    const allDates = buildDates(rows, deadline);
    const payload = {
      title:           detail.title,
      color:           detail.color,
      schedule:        form.schedule ?? "",
      location:        form.location ?? "",
      location_url:    form.locationUrl ?? "",
      join_url:        form.joinUrl ?? "",
      description:     form.description ?? "",
      host_name:       form.hostName ?? "",
      host_intro:      form.hostIntro ?? "",
      max_participants: form.maxParticipants ?? 8,
      session_dates:   allDates,
    };
    try {
      const res = await fetch(`/api/book-clubs/${detail.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json() as { club?: Record<string, unknown>; error?: string };
      if (res.ok && json.club) {
        const c = json.club;
        const merged: BookClub = {
          ...detail,
          schedule:       c.schedule as string,
          location:       c.location as string,
          locationUrl:    c.location_url as string,
          joinUrl:        c.join_url as string,
          description:    c.description as string,
          hostName:       c.host_name as string,
          hostIntro:      c.host_intro as string,
          maxParticipants: c.max_participants as number,
          sessionDates:   c.session_dates as BookClub["sessionDates"],
        };
        setDetail(merged);
        localStorage.setItem(`bc_detail_${detail.slug}`, JSON.stringify(merged));
        setSaveOk(true);
        setTimeout(() => setSaveOk(false), 3000);
      } else {
        setSaveError(json.error ?? "저장에 실패했어요. 다시 시도해주세요.");
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "네트워크 오류");
    }
    setSaving(false);
  };

  // 빠른 URL 저장
  const handleQuickUrlSave = async () => {
    if (!detail || !quickUrl.trim()) return;
    setQuickSaving(true);
    const u = quickUrl.trim();
    try {
      const res = await fetch(`/api/book-clubs/${detail.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ join_url: u, title: detail.title, color: detail.color }),
      });
      if (res.ok) {
        setQuickMsg("✓ 참여 링크 저장됐어요!");
      } else {
        const j = await res.json() as { error?: string };
        setQuickMsg(`⚠ ${j.error ?? "저장 실패"}`);
      }
    } catch { setQuickMsg("⚠ 네트워크 오류"); }
    const merged = { ...detail, joinUrl: u };
    setDetail(merged);
    localStorage.setItem(`bc_detail_${detail.slug}`, JSON.stringify(merged));
    setQuickUrl("");
    setQuickSaving(false);
    setTimeout(() => setQuickMsg(""), 4000);
  };

  // 참여 클릭 — /join API로 서버 리다이렉트 (URL 비노출)
  const handleJoin = () => {
    if (!detail?.slug) return;
    window.open(`/api/book-clubs/${detail.slug}/join`, "_blank", "noopener,noreferrer");
    localStorage.setItem(`joined_${detail.slug}`, "1");
    setJoined(true);
  };

  const addRow = () => setRows((r) => [...r, { date: "", topic: "", closed: false }]);
  const updateRow = (i: number, field: keyof SessionRow, val: string | boolean) =>
    setRows((r) => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));

  const deadlinePast = isDeadlinePast(getDeadline(detail?.sessionDates));
  // __hidden__ = 비관리자용 플래그 (실제 URL은 서버에서 처리)
  const hasJoinUrl   = !!(detail?.joinUrl?.trim()) || !!(detail as any)?.has_join_url;
  const normalDates  = getNormalDates(detail?.sessionDates);
  const detailDeadline = getDeadline(detail?.sessionDates);

  if (!book) return null;

  // 마감일 표시용
  function fmtDeadline(d: string) {
    if (!d) return "";
    const dt = new Date(d);
    return dt.toLocaleString("ko-KR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="bdm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bdm-panel" onClick={(e) => e.stopPropagation()}>
        <button className="bdm-close" onClick={onClose} aria-label="닫기">✕</button>

        {/* 커버 */}
        <div className={`bdm-cover ${detail?.color ?? book.color}`}>
          <div className="bdm-spine" />
          <div className="bdm-cover-top">
            {detail?.genre && <div className="bdm-genre">{detail.genre}</div>}
          </div>
          <div className="bdm-cover-bot">
            <h2 className="bdm-title">{detail?.title ?? book.title}</h2>
            {detail?.author && <p className="bdm-author">— {detail.author}</p>}
          </div>
        </div>

        <div className="bdm-body">
          {!editing ? (
            <>
              {detail?.tag && (
                <div className="bdm-tag-row">
                  <span className="bdm-tag">{detail.tag}</span>
                  {(detail.currentParticipants ?? 0) > 0 && (
                    <span className="bdm-members">
                      <span className="bdm-dot" />
                      {detail.currentParticipants}명 참여 중
                    </span>
                  )}
                </div>
              )}

              {detail?.recommender && <p className="bdm-rec">— {detail.recommender}이 건넵니다</p>}
              {detail?.reason && <p className="bdm-reason">{detail.reason}</p>}
              <div className="bdm-div" />

              {/* 진행자 */}
              {detail?.hostName && (
                <div className="bdm-section">
                  <div className="bdm-section-label">모임 진행</div>
                  <div className="bdm-host-name">{detail.hostName}</div>
                  {detail.hostIntro && <p className="bdm-host-intro">{detail.hostIntro}</p>}
                </div>
              )}

              {/* 일정·장소 */}
              {(detail?.schedule || detail?.location) && (
                <div className="bdm-section">
                  <div className="bdm-section-label">일정 · 장소</div>
                  {detail.schedule && <div className="bdm-info-val">{detail.schedule}</div>}
                  {detail.location && (
                    <div className="bdm-info-val">
                      {detail.locationUrl
                        ? <a href={detail.locationUrl} target="_blank" rel="noopener" className="bdm-loc-link">📍 {detail.location}</a>
                        : <>📍 {detail.location}</>
                      }
                    </div>
                  )}
                </div>
              )}

              {/* 회차 일정 */}
              {normalDates.length > 0 && (
                <div className="bdm-section">
                  <div className="bdm-section-label">회차 일정</div>
                  <div className="bdm-dates">
                    {normalDates.map((s, i) => (
                      <div key={i} className={`bdm-date-row${s.closed ? " closed" : ""}`}>
                        <span className="bdm-date-n">{String(i + 1).padStart(2, "0")}</span>
                        <span className="bdm-date-d">{s.date}</span>
                        <span className="bdm-date-t">{s.topic}</span>
                        {s.closed && <span className="bdm-date-closed">마감</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 참석 마감일 */}
              {detailDeadline && (
                <div className="bdm-section">
                  <div className="bdm-section-label">참석 마감</div>
                  <div className="bdm-info-val" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: deadlinePast ? "#EF4444" : "var(--accent)", fontWeight: 500 }}>
                      {deadlinePast ? "⛔ 마감됨" : "⏰ " + fmtDeadline(detailDeadline)}
                    </span>
                    {!deadlinePast && (
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>
                        {(() => {
                          const diff = Math.ceil((new Date(detailDeadline).getTime() - Date.now()) / 86400000);
                          return diff <= 3 ? `(${diff}일 남음 — 마감 임박!)` : `(${diff}일 남음)`;
                        })()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 모임 소개 */}
              {detail?.description && (
                <div className="bdm-section">
                  <div className="bdm-section-label">모임 소개</div>
                  <p className="bdm-desc">{detail.description}</p>
                </div>
              )}

              {!detail?.schedule && !detail?.hostName && !detail?.description && (
                <div className="bdm-empty">
                  <p>모임 상세 정보가 아직 등록되지 않았습니다.</p>
                  {canEdit && <p>편집 버튼으로 내용을 추가해주세요.</p>}
                </div>
              )}

              {detail?.emotionTags && detail.emotionTags.length > 0 && (
                <div className="bdm-emotion-tags">
                  {detail.emotionTags.map((t) => <span key={t} className="bdm-etag">{t}</span>)}
                </div>
              )}

              {/* 관리자: 참여 링크 빠른 설정 */}
              {canEdit && (
                <div className="bdm-admin-url">
                  <div className="bdm-admin-url-label">
                    참여 링크 {hasJoinUrl ? "✓ 설정됨" : "— 미설정"}
                  </div>
                  <div className="bdm-admin-url-row">
                    <input
                      className="bdm-admin-url-input"
                      type="url"
                      value={quickUrl}
                      onChange={(e) => setQuickUrl(e.target.value)}
                      placeholder="참여 링크를 붙여넣으세요 (자동 저장)"
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData("text");
                        if (pasted.startsWith("http")) {
                          e.preventDefault();
                          setQuickUrl(pasted);
                          setTimeout(async () => {
                            if (!detail) return;
                            try {
                              await fetch(`/api/book-clubs/${detail.slug}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ join_url: pasted, title: detail.title, color: detail.color }),
                              });
                            } catch { /* local fallback */ }
                            const merged = { ...detail, joinUrl: pasted };
                            setDetail(merged);
                            localStorage.setItem(`bc_detail_${detail.slug}`, JSON.stringify(merged));
                            setQuickUrl("");
                          }, 100);
                        }
                      }}
                    />
                    <button className="bdm-admin-url-btn" type="button"
                      disabled={!quickUrl.trim() || quickSaving} onClick={handleQuickUrlSave}>
                      {quickSaving ? "저장 중" : "저장"}
                    </button>
                  </div>
                  <div className="bdm-admin-url-hint">URL은 사용자에게 노출되지 않습니다 · 붙여넣으면 자동 저장</div>
                  {quickMsg && (
                    <div style={{ marginTop: 6, fontSize: 12.5, color: quickMsg.startsWith("✓") ? "#10B981" : "#EF4444", fontWeight: 500 }}>
                      {quickMsg}
                    </div>
                  )}
                </div>
              )}

              {/* CTA */}
              <div className="bdm-footer">
                {canEdit && <button className="bdm-btn-edit" onClick={startEdit}>편집</button>}
                {detail?.maxParticipants && (
                  <span className="bdm-spots">
                    {Math.max(0, (detail.maxParticipants - (detail.currentParticipants ?? 0)))}자리 남음
                  </span>
                )}
                {deadlinePast ? (
                  <span className="bdm-btn-join-pending">참석 마감됐습니다</span>
                ) : hasJoinUrl ? (
                  <button className={`bdm-btn-join${joined ? " joined" : ""}`} onClick={handleJoin}>
                    {joined ? "참여 신청 완료 ✓" : "참여 신청하기"}
                    {!joined && <span className="bdm-arrow" />}
                  </button>
                ) : (
                  <span className="bdm-btn-join-pending">모집 준비 중입니다</span>
                )}
              </div>
            </>
          ) : (
            /* ── 편집 폼 ── */
            <form className="bdm-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="bdm-form-title">모임 정보 작성 · 수정</div>

              <label className="bdm-label">진행자 이름</label>
              <input className="bdm-input" value={form.hostName ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, hostName: e.target.value }))}
                placeholder="예: 정해린" />

              <label className="bdm-label">진행자 소개</label>
              <textarea className="bdm-textarea" rows={2} value={form.hostIntro ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, hostIntro: e.target.value }))}
                placeholder="진행자에 대한 짧은 소개를 적어주세요." />

              <label className="bdm-label">모임 일정 (전체 요약)</label>
              <input className="bdm-input" value={form.schedule ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
                placeholder="예: 2026년 7월 5일 (토) 오후 3시 – 5시 30분" />

              {/* 회차 일정 관리 */}
              <label className="bdm-label">회차별 일정</label>
              {rows.map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto auto", gap: 6, marginBottom: 6, alignItems: "center" }}>
                  <input className="bdm-input" style={{ margin: 0 }} type="date" value={row.date}
                    onChange={(e) => updateRow(i, "date", e.target.value)} placeholder="날짜" />
                  <input className="bdm-input" style={{ margin: 0 }} value={row.topic}
                    onChange={(e) => updateRow(i, "topic", e.target.value)} placeholder="주제 · 제목" />
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap", cursor: "pointer" }}>
                    <input type="checkbox" checked={row.closed}
                      onChange={(e) => updateRow(i, "closed", e.target.checked)} style={{ margin: 0 }} />
                    마감
                  </label>
                  <button type="button" onClick={() => removeRow(i)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", fontSize: 16, padding: "0 4px" }}>
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" onClick={addRow}
                style={{ fontSize: 12.5, color: "var(--accent)", background: "none", border: "1px dashed var(--line)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", width: "100%", marginBottom: 4 }}>
                + 회차 추가
              </button>

              <label className="bdm-label">참석 마감일</label>
              <input className="bdm-input" type="datetime-local" value={deadline}
                onChange={(e) => setDeadline(e.target.value)} />
              {deadline && (
                <div style={{ fontSize: 11.5, color: isDeadlinePast(deadline) ? "#EF4444" : "var(--accent)", marginTop: 3, marginBottom: 6 }}>
                  {isDeadlinePast(deadline) ? "⛔ 이미 지난 날짜입니다" : `⏰ ${fmtDeadline(deadline)} 마감`}
                </div>
              )}
              {deadline && (
                <button type="button" onClick={() => setDeadline("")}
                  style={{ fontSize: 11.5, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", marginBottom: 8, padding: 0 }}>
                  마감일 제거
                </button>
              )}

              <label className="bdm-label">장소</label>
              <input className="bdm-input" value={form.location ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="예: 서울 서초구 교대역 인근" />

              <label className="bdm-label">
                장소 지도 링크
                {form.locationUrl ? <span style={{ color: "var(--accent)", marginLeft: 8 }}>✓ 연결됨</span> : <span style={{ color: "var(--muted)", marginLeft: 8, fontWeight: 400 }}>— 미설정</span>}
              </label>
              <input className="bdm-input" type="url" value={form.locationUrl ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, locationUrl: e.target.value }))}
                placeholder="카카오맵·네이버맵 URL 붙여넣기"
                onPaste={async (e) => {
                  const pasted = e.clipboardData.getData("text").trim();
                  if (!pasted.startsWith("http") || !detail) return;
                  setForm((f) => ({ ...f, locationUrl: pasted }));
                }}
              />
              {form.locationUrl && (
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:-4, marginBottom:6 }}>
                  <span style={{ fontSize:11, color:"var(--muted)" }}>→ 사용자가 장소 클릭 시 지도 열림</span>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, locationUrl:"" }))}
                    style={{ fontSize:11, color:"#EF4444", background:"none", border:"none", cursor:"pointer", padding:0 }}>삭제</button>
                </div>
              )}

              <label className="bdm-label">
                참여 신청 링크
                {form.joinUrl ? <span style={{ color: "var(--accent)", marginLeft: 8 }}>✓ 연결됨 (URL 비공개)</span> : <span style={{ color: "var(--muted)", marginLeft: 8, fontWeight: 400 }}>— 미설정</span>}
              </label>
              <input
                className="bdm-input" type="url"
                value={form.joinUrl ? (form.joinUrl.length > 40 ? form.joinUrl.slice(0,38)+"…" : form.joinUrl) : ""}
                onChange={(e) => setForm((f) => ({ ...f, joinUrl: e.target.value }))}
                placeholder="참여 링크 붙여넣기 → 자동 저장 · 사용자에게 URL 비공개"
                onFocus={(e) => { (e.target as HTMLInputElement).value = form.joinUrl ?? ""; }}
                onBlur={(e) => { if(form.joinUrl && form.joinUrl.length > 40) (e.target as HTMLInputElement).value = form.joinUrl.slice(0,38)+"…"; }}
                onPaste={async (e) => {
                  const pasted = e.clipboardData.getData("text").trim();
                  if (!pasted.startsWith("http") || !detail) return;
                  setForm((f) => ({ ...f, joinUrl: pasted }));
                  try {
                    const res = await fetch(`/api/book-clubs/${detail.slug}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        join_url: pasted,
                        title: detail.title,
                        color: detail.color,
                      }),
                    });
                    if (res.ok) {
                      const data = await res.json() as { club: Record<string, unknown> };
                      setDetail((prev) => prev ? { ...prev, joinUrl: pasted, ...(data.club.join_url !== undefined ? {} : {}) } : prev);
                      localStorage.setItem(`bc_detail_${detail.slug}`, JSON.stringify({ ...detail, joinUrl: pasted }));
                    }
                  } catch { /* local only */ }
                }}
              />
              {form.joinUrl && (
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:-4, marginBottom:6 }}>
                  <span style={{ fontSize:11, color:"var(--muted)" }}>→ 사용자에게 URL 비공개 · "참여 신청하기" 버튼으로만 표시</span>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, joinUrl:"" }))}
                    style={{ fontSize:11, color:"#EF4444", background:"none", border:"none", cursor:"pointer", padding:0 }}>삭제</button>
                </div>
              )}

              <label className="bdm-label">최대 인원</label>
              <input className="bdm-input" type="number" min={1} max={100}
                value={form.maxParticipants ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, maxParticipants: parseInt(e.target.value) || undefined }))}
                placeholder="8" />

              <label className="bdm-label">모임 소개 (세부내용)</label>
              <textarea className="bdm-textarea" rows={5} value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="이 북클럽에 대해 소개해주세요. 어떤 사람에게 어떤 시간이 될지 자유롭게 적어주세요." />

              {saveError && (
                <div style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", fontSize: 13, color: "#EF4444" }}>
                  ⚠ {saveError}
                </div>
              )}
              {saveOk && (
                <div style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", fontSize: 13, color: "#10B981" }}>
                  ✓ 저장됐어요!
                </div>
              )}
              <div className="bdm-form-actions">
                <button type="button" className="bdm-btn-cancel" onClick={() => { setEditing(false); setSaveError(""); }}>취소</button>
                <button type="submit" className="bdm-btn-save" disabled={saving}>
                  {saving ? "저장 중…" : "저장 · 업데이트"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
