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
  // Editable details
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
}

interface Props {
  book: BookClub | null;
  onClose: () => void;
}

const ADMIN_EMAILS = ["junginaha@gmail.com", "kimjungin@quesapience.com"];

export default function BookDetailModal({ book, onClose }: Props) {
  const currentUser = useAppStore((s) => s.currentUser);
  const [detail, setDetail] = useState<BookClub | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<BookClub>>({});
  const [saving, setSaving] = useState(false);
  const [joined, setJoined] = useState(false);

  const isAdmin = currentUser
    ? ADMIN_EMAILS.includes(currentUser.email) || currentUser.name === "kimjungin"
    : false;
  const isHost = currentUser && detail?.hostName === currentUser.name;
  const canEdit = isAdmin || isHost;

  // Load from API (with localStorage fallback)
  const loadDetail = useCallback(async (b: BookClub) => {
    const cacheKey = `bc_detail_${b.slug}`;
    const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
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
          schedule: data.club.schedule as string,
          location: data.club.location as string,
          locationUrl: data.club.location_url as string,
          joinUrl: data.club.join_url as string,
          description: data.club.description as string,
          hostName: data.club.host_name as string,
          hostIntro: data.club.host_intro as string,
          maxParticipants: data.club.max_participants as number,
          currentParticipants: data.club.current_participants as number,
          sessionDates: data.club.session_dates as BookClub["sessionDates"],
        };
        setDetail(merged);
        localStorage.setItem(cacheKey, JSON.stringify(merged));
      }
    } catch { /* offline / not configured */ }
  }, []);

  useEffect(() => {
    if (!book) { setDetail(null); setEditing(false); return; }
    loadDetail(book);
    const key = `joined_${book.slug}`;
    setJoined(typeof window !== "undefined" && localStorage.getItem(key) === "1");
  }, [book, loadDetail]);

  useEffect(() => {
    if (!book) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [book, onClose]);

  const startEdit = () => {
    setForm({
      schedule: detail?.schedule ?? "",
      location: detail?.location ?? "",
      locationUrl: detail?.locationUrl ?? "",
      joinUrl: detail?.joinUrl ?? "https://jamjamlink-wujdhsmq.manus.space/?code=NkR5M28GWYafp5h7Hgnbah",
      description: detail?.description ?? "",
      hostName: detail?.hostName ?? "",
      hostIntro: detail?.hostIntro ?? "",
      maxParticipants: detail?.maxParticipants,
      photo_url: detail?.photo_url ?? "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!detail) return;
    setSaving(true);
    const update = {
      schedule: form.schedule,
      location: form.location,
      location_url: form.locationUrl,
      join_url: form.joinUrl,
      description: form.description,
      host_name: form.hostName,
      host_intro: form.hostIntro,
      max_participants: form.maxParticipants,
      photo_url: form.photo_url,
    };
    try {
      const res = await fetch(`/api/book-clubs/${detail.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (res.ok) {
        const data = await res.json() as { club: Record<string, unknown> };
        const merged: BookClub = {
          ...detail,
          schedule: data.club.schedule as string,
          location: data.club.location as string,
          locationUrl: data.club.location_url as string,
          joinUrl: data.club.join_url as string,
          description: data.club.description as string,
          hostName: data.club.host_name as string,
          hostIntro: data.club.host_intro as string,
          maxParticipants: data.club.max_participants as number,
          photo_url: data.club.photo_url as string | undefined,
        };
        setDetail(merged);
        localStorage.setItem(`bc_detail_${detail.slug}`, JSON.stringify(merged));
      } else {
        // Fallback: save locally
        const merged = { ...detail, ...form };
        setDetail(merged);
        localStorage.setItem(`bc_detail_${detail.slug}`, JSON.stringify(merged));
      }
    } catch {
      const merged = { ...detail, ...form };
      setDetail(merged);
      localStorage.setItem(`bc_detail_${detail.slug}`, JSON.stringify(merged));
    }
    setSaving(false);
    setEditing(false);
  };

  // 참여 신청 — admin이 설정한 URL로 이동 (URL 없으면 준비 중 안내)
  const hasJoinUrl = !!(detail?.joinUrl?.trim());
  const handleJoin = () => {
    if (!hasJoinUrl) return; // URL 미설정 시 동작 없음
    window.open(detail!.joinUrl!, "_blank", "noopener,noreferrer");
    if (detail?.slug) {
      localStorage.setItem(`joined_${detail.slug}`, "1");
      setJoined(true);
    }
  };

  // 관리자용: 참여 링크 빠른 저장 (편집 폼 열지 않고 즉시 적용)
  const [quickUrl, setQuickUrl] = useState("");
  const [quickSaving, setQuickSaving] = useState(false);
  const handleQuickUrlSave = async () => {
    if (!detail || !quickUrl.trim()) return;
    setQuickSaving(true);
    const update = { ...detail, joinUrl: quickUrl.trim() };
    try {
      await fetch(`/api/book-clubs/${detail.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ join_url: quickUrl.trim() }),
      });
    } catch { /* fallback to local */ }
    setDetail(update);
    localStorage.setItem(`bc_detail_${detail.slug}`, JSON.stringify(update));
    setQuickUrl("");
    setQuickSaving(false);
  };

  if (!book) return null;

  return (
    <div className="bdm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bdm-panel" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className="bdm-close" onClick={onClose} aria-label="닫기">✕</button>

        {/* Cover strip */}
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

        {/* Body */}
        <div className="bdm-body">
          {!editing ? (
            <>
              {/* Tag row */}
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

              {/* Recommender + Reason */}
              {detail?.recommender && (
                <p className="bdm-rec">— {detail.recommender}이 건넵니다</p>
              )}
              {detail?.reason && (
                <p className="bdm-reason">{detail.reason}</p>
              )}

              {/* Divider */}
              <div className="bdm-div" />

              {/* Host */}
              {detail?.hostName && (
                <div className="bdm-section">
                  <div className="bdm-section-label">모임 진행</div>
                  <div className="bdm-host-name">{detail.hostName}</div>
                  {detail.hostIntro && (
                    <p className="bdm-host-intro">{detail.hostIntro}</p>
                  )}
                </div>
              )}

              {/* Schedule & Location */}
              {(detail?.schedule || detail?.location) && (
                <div className="bdm-section">
                  <div className="bdm-section-label">일정 · 장소</div>
                  {detail.schedule && <div className="bdm-info-val">{detail.schedule}</div>}
                  {detail.location && (
                    <div className="bdm-info-val">
                      {detail.locationUrl ? (
                        <a href={detail.locationUrl} target="_blank" rel="noopener" className="bdm-loc-link">
                          📍 {detail.location}
                        </a>
                      ) : (
                        <>📍 {detail.location}</>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Session dates */}
              {detail?.sessionDates && detail.sessionDates.length > 0 && (
                <div className="bdm-section">
                  <div className="bdm-section-label">회차 일정</div>
                  <div className="bdm-dates">
                    {detail.sessionDates.map((s, i) => (
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

              {/* Description */}
              {detail?.description && (
                <div className="bdm-section">
                  <div className="bdm-section-label">모임 소개</div>
                  <p className="bdm-desc">{detail.description}</p>
                </div>
              )}

              {/* Empty state */}
              {!detail?.schedule && !detail?.hostName && !detail?.description && (
                <div className="bdm-empty">
                  <p>모임 상세 정보가 아직 등록되지 않았습니다.</p>
                  {canEdit && <p>편집 버튼으로 내용을 추가해주세요.</p>}
                </div>
              )}

              {/* Emotion tags */}
              {detail?.emotionTags && detail.emotionTags.length > 0 && (
                <div className="bdm-emotion-tags">
                  {detail.emotionTags.map((t) => (
                    <span key={t} className="bdm-etag">{t}</span>
                  ))}
                </div>
              )}

              {/* 관리자 전용: 참여 링크 빠른 설정 (사용자에게 보이지 않음) */}
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
                      placeholder="잼잼 결제 링크를 붙여넣으세요"
                      onPaste={(e) => {
                        // 붙여넣기 즉시 자동 저장
                        const pasted = e.clipboardData.getData("text");
                        if (pasted.startsWith("http")) {
                          e.preventDefault();
                          setQuickUrl(pasted);
                          setTimeout(async () => {
                            if (!detail) return;
                            const update = { ...detail, joinUrl: pasted };
                            try {
                              await fetch(`/api/book-clubs/${detail.slug}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ join_url: pasted }),
                              });
                            } catch { /* local fallback */ }
                            setDetail(update);
                            localStorage.setItem(`bc_detail_${detail.slug}`, JSON.stringify(update));
                            setQuickUrl("");
                          }, 100);
                        }
                      }}
                    />
                    <button
                      className="bdm-admin-url-btn"
                      type="button"
                      disabled={!quickUrl.trim() || quickSaving}
                      onClick={handleQuickUrlSave}
                    >
                      {quickSaving ? "저장 중" : "저장"}
                    </button>
                  </div>
                  <div className="bdm-admin-url-hint">붙여넣으면 자동 저장됩니다</div>
                </div>
              )}

              {/* CTA */}
              <div className="bdm-footer">
                {canEdit && (
                  <button className="bdm-btn-edit" onClick={startEdit}>
                    편집
                  </button>
                )}
                {detail?.maxParticipants && (
                  <span className="bdm-spots">
                    {(detail.maxParticipants - (detail.currentParticipants ?? 0))}자리 남음
                  </span>
                )}
                {hasJoinUrl ? (
                  <button
                    className={`bdm-btn-join${joined ? " joined" : ""}`}
                    onClick={handleJoin}
                  >
                    {joined ? "참여 신청 완료 ✓" : "참여 신청하기"}
                    {!joined && <span className="bdm-arrow" />}
                  </button>
                ) : (
                  <span className="bdm-btn-join-pending">
                    모집 준비 중입니다
                  </span>
                )}
              </div>
            </>
          ) : (
            /* Edit form */
            <form className="bdm-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="bdm-form-title">모임 정보 작성 · 수정</div>

              <label className="bdm-label">진행자 이름</label>
              <input className="bdm-input" value={form.hostName ?? ""} onChange={(e) => setForm((f) => ({ ...f, hostName: e.target.value }))} placeholder="예: 정해린" />

              <label className="bdm-label">진행자 소개</label>
              <textarea className="bdm-textarea" rows={2} value={form.hostIntro ?? ""} onChange={(e) => setForm((f) => ({ ...f, hostIntro: e.target.value }))} placeholder="진행자에 대한 짧은 소개를 적어주세요." />

              <label className="bdm-label">모임 일정</label>
              <input className="bdm-input" value={form.schedule ?? ""} onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))} placeholder="예: 2026년 7월 5일 (토) 오후 3시 – 5시 30분" />

              <label className="bdm-label">장소</label>
              <input className="bdm-input" value={form.location ?? ""} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="예: 서울 서초구 교대역 인근" />

              <label className="bdm-label">장소 지도 링크</label>
              <input className="bdm-input" type="url" value={form.locationUrl ?? ""} onChange={(e) => setForm((f) => ({ ...f, locationUrl: e.target.value }))} placeholder="https://map.kakao.com/..." />

              <label className="bdm-label">참여 링크 (잼잼 — 내부용)</label>
              <input className="bdm-input" type="url" value={form.joinUrl ?? ""} onChange={(e) => setForm((f) => ({ ...f, joinUrl: e.target.value }))} placeholder="잼잼 결제 링크를 붙여넣으세요" />

              <label className="bdm-label">최대 인원</label>
              <input className="bdm-input" type="number" min={1} max={100} value={form.maxParticipants ?? ""} onChange={(e) => setForm((f) => ({ ...f, maxParticipants: parseInt(e.target.value) || undefined }))} placeholder="8" />

              <label className="bdm-label">모임 소개</label>
              <textarea className="bdm-textarea" rows={4} value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="이 북클럽에 대해 소개해주세요. 어떤 사람에게 어떤 시간이 될지 자유롭게 적어주세요." />

              <label className="bdm-label">북클럽 이미지 URL</label>
              <input className="bdm-input" type="url" value={form.photo_url ?? ""} onChange={(e) => setForm((f) => ({ ...f, photo_url: e.target.value }))} placeholder="https://... (커버 이미지 URL)" />

              <div className="bdm-form-actions">
                <button type="button" className="bdm-btn-cancel" onClick={() => setEditing(false)}>취소</button>
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
