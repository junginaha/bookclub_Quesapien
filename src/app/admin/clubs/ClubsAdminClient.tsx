"use client";

import { useState } from "react";
import Link from "next/link";

const SEED_CLUBS = [
  // main 6
  { slug: "최신간-북토크", title: "최신간 북토크, 핫한 문장들", is_mini: false },
  { slug: "다정함의-발명", title: "다정함의 발명", is_mini: false },
  { slug: "혼자라는-감각", title: "혼자라는 감각", is_mini: false },
  { slug: "아무도-보지-않는-오후", title: "아무도 보지 않는 오후", is_mini: false },
  { slug: "오늘-저녁-당신께", title: "오늘 저녁, 당신께", is_mini: false },
  { slug: "인간이라는-풍경", title: "인간이라는 풍경", is_mini: false },
  // mini 24
  { slug: "제자리로-돌아오는-밤에", title: "제자리로 돌아오는 밤에", is_mini: true },
  { slug: "느리게-읽는-일", title: "느리게 읽는 일", is_mini: true },
  { slug: "어머니의-문장들", title: "어머니의 문장들", is_mini: true },
  { slug: "흐린-날의-사유", title: "흐린 날의 사유", is_mini: true },
  { slug: "아무것도-하지-않는-연습", title: "아무것도 하지 않는 연습", is_mini: true },
  { slug: "일을-사랑하면서", title: "일을 사랑하면서 일에 지지 않는 법", is_mini: true },
  { slug: "이름-없는-감정들에게", title: "이름 없는 감정들에게", is_mini: true },
  { slug: "수요일-저녁-낭독회", title: "수요일 저녁 낭독회", is_mini: true },
  { slug: "아버지라는-낯선-사람", title: "아버지라는 낯선 사람", is_mini: true },
  { slug: "쓰이지-않는-시간이-있다", title: "쓰이지 않는 시간이 있다", is_mini: true },
  { slug: "어둠-속의-밝은-한-줄", title: "어둠 속의 밝은 한 줄", is_mini: true },
  { slug: "온전하지-않은-시절", title: "온전하지 않은 시절", is_mini: true },
  { slug: "헤어진-이들의-재회", title: "헤어진 이들의 재회", is_mini: true },
  { slug: "도시의-올랜-해", title: "도시의 올랜 해", is_mini: true },
  { slug: "죽음을-읽는-일곱-가지", title: "죽음을 읽는 일곱 가지 시선", is_mini: true },
  { slug: "난-당신을-잘-모릅니다", title: "난 당신을 잘 모릅니다", is_mini: true },
  { slug: "돈이-말해주지-않는", title: "돈이 말해주지 않는 것들", is_mini: true },
  { slug: "높은-곳의-창가에서", title: "높은 곳의 창가에서", is_mini: true },
  { slug: "다시-걸을-수-있는-사람들", title: "다시 걸을 수 있는 사람들", is_mini: true },
  { slug: "외국어로-읽는-한국-소설", title: "외국어로 읽는 한국 소설", is_mini: true },
  { slug: "넘어진-자리에서", title: "넘어진 자리에서 주워 든 것들", is_mini: true },
  { slug: "밤에만-편지를-씁니다", title: "밤에만 편지를 씁니다", is_mini: true },
  { slug: "자연을-읽는-일요일", title: "자연을 읽는 일요일", is_mini: true },
  { slug: "철학이-필요한-저녁", title: "철학이 필요한 저녁", is_mini: true },
];

type ClubRow = typeof SEED_CLUBS[0] & {
  author?: string;
  schedule?: string;
  location?: string;
  location_url?: string;
  join_url?: string;
  description?: string;
  host_name?: string;
  host_intro?: string;
  max_participants?: number;
  current_participants?: number;
  status?: string;
  // 011 마이그레이션 — 지금/앵콜 재구조화
  event_starts_at?: string;
  event_ends_at?: string;
  registration_closes_at?: string;
  area?: string;
  price?: number;
  author_hosts?: boolean;
  encore_eligible?: boolean;
  encore_threshold?: number;
  // 북클럽 참가 게시판(/bookclub) 전용 — 홈과 게시판이 같은 행을 읽으므로
  // 여기서 같이 채워야 양쪽 다 반영된다.
  reason?: string;
  key_questions?: string[];
  recommended_for?: string[];
  price_note?: string;
  bring?: string;
  name_example?: string;
};

// key_questions/recommended_for는 배열이지만 폼에서는 줄바꿈으로 구분된
// 텍스트 하나로 다룬다 — 저장 시에만 배열로 변환한다. title은 ClubRow에서
// 필수 필드지만 폼 초기 상태({})는 비워둘 수 있어야 하므로 옵셔널로 다시 연다.
type EditForm = Omit<ClubRow, "slug" | "is_mini" | "key_questions" | "recommended_for" | "title"> & {
  title?: string;
  key_questions: string;
  recommended_for: string;
};

const AREA_CHOICES = ["강남·서초", "마포·홍대", "종로·광화문", "성수·건대", "온라인", "지역 무관"];

function emptyForm(club: ClubRow): EditForm {
  return {
    title: club.title ?? "",
    author: club.author ?? "",
    schedule: club.schedule ?? "",
    location: club.location ?? "",
    location_url: club.location_url ?? "",
    join_url: club.join_url ?? "",
    host_name: club.host_name ?? "",
    host_intro: club.host_intro ?? "",
    description: club.description ?? "",
    max_participants: club.max_participants,
    current_participants: club.current_participants,
    status: club.status ?? "active",
    event_starts_at: club.event_starts_at ?? "",
    event_ends_at: club.event_ends_at ?? "",
    registration_closes_at: club.registration_closes_at ?? "",
    area: club.area ?? "",
    price: club.price,
    author_hosts: club.author_hosts ?? false,
    encore_eligible: club.encore_eligible ?? false,
    encore_threshold: club.encore_threshold ?? 8,
    reason: club.reason ?? "",
    key_questions: (club.key_questions ?? []).join("\n"),
    recommended_for: (club.recommended_for ?? []).join("\n"),
    price_note: club.price_note ?? "",
    bring: club.bring ?? "",
    name_example: club.name_example ?? "",
  };
}

function splitLines(text: string): string[] {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

export default function ClubsAdminClient() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [clubs, setClubs] = useState<ClubRow[]>(SEED_CLUBS);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>({ key_questions: "", recommended_for: "" });
  const [addingNew, setAddingNew] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"main" | "mini">("main");

  const loadClubs = async (adminKey: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clubs", {
        headers: { "x-admin-key": adminKey },
      });
      if (res.ok) {
        const data = await res.json() as { clubs: ClubRow[] };
        if (data.clubs?.length) {
          setClubs(data.clubs);
        }
      }
    } catch { /* use seed list */ }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/clubs", {
      headers: { "x-admin-key": keyInput },
    });
    if (res.status !== 401) {
      setKey(keyInput);
      setAuthed(true);
      await loadClubs(keyInput);
    } else {
      alert("관리자 키가 올바르지 않습니다.");
    }
  };

  const startEdit = (club: ClubRow) => {
    setExpanded(club.slug);
    setForm(emptyForm(club));
  };

  const handleSave = async (slug: string) => {
    setSaving(true);
    const { key_questions, recommended_for, ...rest } = form;
    const body = {
      slug,
      ...rest,
      key_questions: splitLines(key_questions),
      recommended_for: splitLines(recommended_for),
    };
    try {
      const res = await fetch("/api/admin/clubs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": key },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json() as { club: ClubRow };
        setClubs((prev) => prev.map((c) => c.slug === slug ? { ...c, ...data.club } : c));
        setSaveMsg((m) => ({ ...m, [slug]: "저장됨 ✓" }));
      } else {
        const errData = await res.json().catch(() => ({})) as { error?: string };
        setSaveMsg((m) => ({ ...m, [slug]: `⚠ ${errData.error ?? "저장 실패"}` }));
      }
    } catch {
      setSaveMsg((m) => ({ ...m, [slug]: "⚠ 네트워크 오류" }));
    }
    setSaving(false);
    setTimeout(() => setSaveMsg((m) => { const n = { ...m }; delete n[slug]; return n; }), 4000);
  };

  // 새 북클럽 추가 — 목록에 없던 새 slug로 첫 저장을 하면 서버가 upsert로
  // 새 행을 만든다(api/admin/clubs PATCH 참고). 여기서는 로컬 목록에 먼저
  // 반영해 바로 편집 폼을 열어준다.
  const handleAddNew = () => {
    const slug = newSlug.trim();
    const title = newTitle.trim();
    if (!slug || !title) { alert("슬러그와 제목을 모두 입력해주세요."); return; }
    if (clubs.some((c) => c.slug === slug)) { alert("이미 있는 슬러그입니다."); return; }
    const club: ClubRow = { slug, title, is_mini: false };
    setClubs((prev) => [club, ...prev]);
    setAddingNew(false);
    setNewSlug("");
    setNewTitle("");
    setTab("main");
    startEdit(club);
  };

  const visibleClubs = clubs.filter((c) => tab === "main" ? !c.is_mini : c.is_mini);

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#F4EFE5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <form onSubmit={handleLogin} style={{ background: "#fff", border: "1px solid #e0d9cc", borderRadius: "16px", padding: "40px", width: "360px", boxShadow: "0 8px 32px rgba(0,0,0,.08)" }}>
          <div style={{ fontSize: "22px", fontWeight: 600, marginBottom: "8px", color: "#2a1f14" }}>북클럽 관리</div>
          <div style={{ fontSize: "13px", color: "#8a7968", marginBottom: "24px" }}>관리자 키를 입력해주세요</div>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="관리자 키"
            autoFocus
            style={{ width: "100%", padding: "10px 14px", border: "1px solid #d8d0c4", borderRadius: "8px", fontSize: "14px", outline: "none", marginBottom: "12px", boxSizing: "border-box" }}
          />
          <button type="submit" style={{ width: "100%", padding: "11px", background: "#5E4632", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>
            입장
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F4EFE5", padding: "40px 20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <Link href="/" style={{ color: "#5E4632", textDecoration: "none", fontSize: "13px" }}>← 홈</Link>
          <div style={{ fontSize: "22px", fontWeight: 600, color: "#2a1f14" }}>북클럽 상세정보 관리</div>
          {loading && <span style={{ fontSize: "12px", color: "#8a7968" }}>불러오는 중…</span>}
        </div>

        {/* Tabs + 새 북클럽 추가 */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
          {(["main", "mini"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 20px", borderRadius: "9999px", border: "1px solid #d8d0c4",
              background: tab === t ? "#5E4632" : "#fff", color: tab === t ? "#fff" : "#5E4632",
              fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}>
              {t === "main" ? `메인 북클럽 (${clubs.filter(c => !c.is_mini).length})` : `미니 북클럽 (${clubs.filter(c => c.is_mini).length})`}
            </button>
          ))}
          <button onClick={() => setAddingNew((v) => !v)} style={{
            marginLeft: "auto", padding: "8px 20px", borderRadius: "9999px",
            border: "1px solid #5E4632", background: addingNew ? "#5E4632" : "#fff",
            color: addingNew ? "#fff" : "#5E4632", fontSize: "13px", fontWeight: 600, cursor: "pointer",
          }}>
            + 새 북클럽 추가
          </button>
        </div>

        {addingNew && (
          <div style={{ background: "#fff", border: "1px solid #e0d9cc", borderRadius: "12px", padding: "20px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>제목</label>
                <input style={inputStyle} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="예: 어떻게 민주주의는 무너지는가" autoFocus />
              </div>
              <div>
                <label style={labelStyle}>슬러그 (URL, 한글-하이픈)</label>
                <input style={inputStyle} value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="예: 어떻게-민주주의는-무너지는가" />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={() => setAddingNew(false)} style={{ padding: "9px 20px", border: "1px solid #d8d0c4", borderRadius: "8px", background: "none", fontSize: "13px", cursor: "pointer", color: "#5E4632" }}>취소</button>
              <button onClick={handleAddNew} style={{ padding: "9px 24px", background: "#5E4632", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                만들고 세부내용 입력하기
              </button>
            </div>
          </div>
        )}

        {/* Club list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {visibleClubs.map((club) => {
            const isOpen = expanded === club.slug;
            const hasData = !!(club.schedule || club.host_name || club.description);
            return (
              <div key={club.slug} style={{ background: "#fff", border: "1px solid #e0d9cc", borderRadius: "12px", overflow: "hidden" }}>
                {/* Club header row */}
                <div
                  onClick={() => { if (isOpen) setExpanded(null); else startEdit(club); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: hasData ? "#4CAF50" : "#d0c8bc",
                    }} />
                    <span style={{ fontSize: "15px", fontWeight: 500, color: "#2a1f14" }}>{club.title}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {saveMsg[club.slug] && (
                      <span style={{ fontSize: "12px", color: "#4CAF50", fontWeight: 500 }}>{saveMsg[club.slug]}</span>
                    )}
                    {hasData && !isOpen && (
                      <span style={{ fontSize: "12px", color: "#8a7968" }}>
                        {[club.host_name, club.schedule, club.location].filter(Boolean).join(" · ")}
                      </span>
                    )}
                    <span style={{ fontSize: "18px", color: "#8a7968", lineHeight: 1 }}>{isOpen ? "−" : "+"}</span>
                  </div>
                </div>

                {/* Edit form */}
                {isOpen && (
                  <div style={{ padding: "0 20px 20px", borderTop: "1px solid #f0ebe3" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
                      <div>
                        <label style={labelStyle}>제목</label>
                        <input style={inputStyle} value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="북클럽 제목" />
                      </div>
                      <div>
                        <label style={labelStyle}>작가</label>
                        <input style={inputStyle} value={form.author ?? ""} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} placeholder="예: 스티븐 레비츠키 · 대니얼 지블랫" />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>카드 얼굴 질문 (홈·게시판 카드 상단에 큰 글씨로 노출)</label>
                        <input style={inputStyle} value={form.reason ?? ""} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="예: 반대편을 '적'으로 보기 시작하면 어떤 일이 생길까요?" />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>핵심 질문 (한 줄에 하나씩, 게시판 "이 질문들로 시작해요")</label>
                        <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={form.key_questions ?? ""} onChange={(e) => setForm((f) => ({ ...f, key_questions: e.target.value }))} placeholder={"질문 1\n질문 2\n질문 3"} />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>이런 분을 기다려요 (한 줄에 하나씩)</label>
                        <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={form.recommended_for ?? ""} onChange={(e) => setForm((f) => ({ ...f, recommended_for: e.target.value }))} placeholder={"이런 분 1\n이런 분 2\n이런 분 3"} />
                      </div>
                      <div>
                        <label style={labelStyle}>참가비 (원)</label>
                        <input style={inputStyle} type="number" min={0} value={form.price ?? ""} onChange={(e) => setForm((f) => ({ ...f, price: parseInt(e.target.value) || undefined }))} placeholder="20000" />
                      </div>
                      <div>
                        <label style={labelStyle}>참가비 설명 (비우면 "커피와 대화, 전부 포함")</label>
                        <input style={inputStyle} value={form.price_note ?? ""} onChange={(e) => setForm((f) => ({ ...f, price_note: e.target.value }))} placeholder="커피와 대화, 전부 포함" />
                      </div>
                      <div>
                        <label style={labelStyle}>준비물 (비우면 "준비물은 책, 그리고 질문 하나.")</label>
                        <input style={inputStyle} value={form.bring ?? ""} onChange={(e) => setForm((f) => ({ ...f, bring: e.target.value }))} placeholder="준비물은 책, 그리고 질문 하나." />
                      </div>
                      <div>
                        <label style={labelStyle}>이름 입력란 예시 (신청 폼 placeholder)</label>
                        <input style={inputStyle} value={form.name_example ?? ""} onChange={(e) => setForm((f) => ({ ...f, name_example: e.target.value }))} placeholder="예: 서결" />
                      </div>
                      <div>
                        <label style={labelStyle}>신청 마감 일시</label>
                        <input style={inputStyle} type="datetime-local" value={form.registration_closes_at ?? ""} onChange={(e) => setForm((f) => ({ ...f, registration_closes_at: e.target.value }))} />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>모임 진행자</label>
                        <input style={inputStyle} value={form.host_name ?? ""} onChange={(e) => setForm((f) => ({ ...f, host_name: e.target.value }))} placeholder="이름" />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>진행자 소개</label>
                        <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2} value={form.host_intro ?? ""} onChange={(e) => setForm((f) => ({ ...f, host_intro: e.target.value }))} placeholder="진행자에 대한 짧은 소개" />
                      </div>
                      <div>
                        <label style={labelStyle}>모임 일정</label>
                        <input style={inputStyle} value={form.schedule ?? ""} onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))} placeholder="예: 매월 첫째 토요일 오후 2시" />
                      </div>
                      <div>
                        <label style={labelStyle}>상태</label>
                        <select style={inputStyle} value={form.status ?? "active"} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                          <option value="active">모집 중</option>
                          <option value="upcoming">예정</option>
                          <option value="closed">마감</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>장소</label>
                        <input style={inputStyle} value={form.location ?? ""} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="서울 마포구 …" />
                      </div>
                      <div>
                        <label style={labelStyle}>지도 링크 (카카오맵 등)</label>
                        <input style={inputStyle} type="url" value={form.location_url ?? ""} onChange={(e) => setForm((f) => ({ ...f, location_url: e.target.value }))} placeholder="https://map.kakao.com/..." />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>참여 신청 링크</label>
                        <input style={inputStyle} type="url" value={form.join_url ?? ""} onChange={(e) => setForm((f) => ({ ...f, join_url: e.target.value }))} placeholder="https://forms.gle/..." />
                      </div>
                      <div>
                        <label style={labelStyle}>최대 인원</label>
                        <input style={inputStyle} type="number" min={1} max={100} value={form.max_participants ?? ""} onChange={(e) => setForm((f) => ({ ...f, max_participants: parseInt(e.target.value) || undefined }))} placeholder="12" />
                      </div>
                      <div>
                        <label style={labelStyle}>현재 인원</label>
                        <input style={inputStyle} type="number" min={0} max={100} value={form.current_participants ?? ""} onChange={(e) => setForm((f) => ({ ...f, current_participants: parseInt(e.target.value) || undefined }))} placeholder="0" />
                      </div>
                      <div>
                        <label style={labelStyle}>모임 시작 일시 (구조화 — 요일·마감 자동 계산에 사용)</label>
                        <input style={inputStyle} type="datetime-local" value={form.event_starts_at ?? ""} onChange={(e) => setForm((f) => ({ ...f, event_starts_at: e.target.value }))} />
                      </div>
                      <div>
                        <label style={labelStyle}>모임 종료 일시</label>
                        <input style={inputStyle} type="datetime-local" value={form.event_ends_at ?? ""} onChange={(e) => setForm((f) => ({ ...f, event_ends_at: e.target.value }))} />
                      </div>
                      <div>
                        <label style={labelStyle}>지역 그룹</label>
                        <select style={inputStyle} value={form.area ?? ""} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}>
                          <option value="">선택 안 함</option>
                          {AREA_CHOICES.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingTop: "22px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#5E4632", cursor: "pointer" }}>
                          <input type="checkbox" checked={form.author_hosts ?? false} onChange={(e) => setForm((f) => ({ ...f, author_hosts: e.target.checked }))} />
                          저자 직접 진행
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#5E4632", cursor: "pointer" }}>
                          <input type="checkbox" checked={form.encore_eligible ?? false} onChange={(e) => setForm((f) => ({ ...f, encore_eligible: e.target.checked }))} />
                          앵콜 대상
                        </label>
                      </div>
                      <div>
                        <label style={labelStyle}>앵콜 재오픈 기준 인원</label>
                        <input style={inputStyle} type="number" min={1} max={100} value={form.encore_threshold ?? 8} onChange={(e) => setForm((f) => ({ ...f, encore_threshold: parseInt(e.target.value) || 8 }))} />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>모임 소개</label>
                        <textarea style={{ ...inputStyle, resize: "vertical" }} rows={4} value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="이 북클럽을 소개해주세요." />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" }}>
                      <button onClick={() => setExpanded(null)} style={{ padding: "9px 20px", border: "1px solid #d8d0c4", borderRadius: "8px", background: "none", fontSize: "13px", cursor: "pointer", color: "#5E4632" }}>
                        취소
                      </button>
                      <button onClick={() => handleSave(club.slug)} disabled={saving} style={{ padding: "9px 24px", background: "#5E4632", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                        {saving ? "저장 중…" : "저장하기"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info box */}
        <div style={{ marginTop: "32px", padding: "16px 20px", background: "rgba(94,70,50,.06)", borderRadius: "10px", fontSize: "12px", color: "#8a7968", lineHeight: 1.7 }}>
          <strong style={{ color: "#5E4632" }}>안내</strong><br />
          • Supabase 스키마가 적용되면 데이터가 DB에 저장됩니다.<br />
          • 스키마 미적용 시 데이터는 저장되지 않습니다. SQL Editor에서 schema.sql을 먼저 실행해주세요.<br />
          • 초록 점 = 정보 입력됨 / 회색 점 = 미입력
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", color: "#8a7968", marginBottom: "4px", fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1px solid #d8d0c4", borderRadius: "8px",
  fontSize: "13.5px", outline: "none", background: "#faf8f4", boxSizing: "border-box",
  fontFamily: "inherit",
};
