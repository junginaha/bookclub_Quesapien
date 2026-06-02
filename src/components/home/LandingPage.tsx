"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import BookDetailModal, { type BookClub } from "./BookDetailModal";
import { josa } from "@/lib/utils";
import "./landing.css";

// ─── 거리 계산 (Haversine) ────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

// ─── Static data ──────────────────────────────────────────────
const books: BookClub[] = [
  {
    color: "navy", genre: "NEW", slug: "최신간-북토크",
    title: "최신간 북토크, 핫한 문장들", author: "Quesapience",
    tag: "#신간 #트렌드", recommender: "Q5",
    reason: "새벽 세 시에 깨어 있는 사람만 아는 문장이 여기 있습니다. 잠들지 못한 누군가에게 이 책이 곁에 있다고 말해주고 싶었어요.",
    emotionTags: ["#불면", "#회복", "#고요"],
    hostName: "정해린", hostIntro: "정답보다 진심을 믿습니다. 우리는 결론을 미루는 연습 중입니다.",
    schedule: "2026년 6월 28일 (토) 오후 3시", location: "서울 서초구 교대역 인근",
    lat: 37.4930, lng: 127.0151,
    joinUrl: undefined, maxParticipants: 8, currentParticipants: 3,
    description: "새로 출간된 책들 중 가장 뜨거운 문장들을 함께 읽습니다. 매 회 다른 책, 같은 깊이의 질문.",
    sessionDates: [{ date: "2026-06-28", topic: "왜 지금 이 문장인가" }],
  },
  {
    color: "cream", genre: "ESSAY · 산문", slug: "다정함의-발명",
    title: "다정함의 발명", author: "허지영",
    tag: "#관계 · #사랑", recommender: "지영",
    reason: "사랑은 큰 사건이 아니라 매일 발명되는 작은 다정함이라는 말. 헤어진 친구에게 부치지 못한 편지처럼 읽었습니다.",
    emotionTags: ["#다정함", "#일상", "#연결"],
    hostName: "정해린", hostIntro: "대화는 답을 찾는 과정이 아니라 함께 머무는 과정입니다.",
    schedule: "2026년 6월 14일 (토) 오후 3시 – 5시 30분", location: "서울 서초구 서초동",
    lat: 37.4946, lng: 127.0209,
    joinUrl: undefined, maxParticipants: 8, currentParticipants: 5,
    description: "사랑은 큰 사건이 아니라 매일 발명되는 작은 다정함이라는 말. 우리가 일상에서 놓치고 있는 다정함의 순간들을 함께 발견합니다.",
    sessionDates: [
      { date: "2026-06-14", topic: "다정함의 정의" },
      { date: "2026-06-28", topic: "다정함을 주고받는 방법" },
    ],
  },
  {
    color: "rust", genre: "PHILOSOPHY", slug: "혼자라는-감각",
    title: "혼자라는 감각", author: "주성원",
    tag: "#외로움 · #인생전환", recommender: "성원",
    reason: "고독을 결핍이 아니라 깊이로 다루는 책. 혼자 있는 것이 부끄럽지 않아진 첫 책이었어요.",
    emotionTags: ["#고독", "#성장", "#사유"],
    hostName: "서민준", hostIntro: "조용한 사람의 한 문장은 시끄러운 사람의 한 시간보다 길게 남습니다.",
    schedule: "2026년 6월 21일 (토) 오후 2시 – 4시 30분", location: "서울 마포구 합정동",
    lat: 37.5492, lng: 126.9148,
    joinUrl: undefined, maxParticipants: 6, currentParticipants: 4,
    description: "고독을 결핍이 아니라 깊이로 다루는 책. 혼자라는 감각이 두려움이 아닌 능력이 되는 공간을 함께 만들어봅니다.",
    sessionDates: [{ date: "2026-06-21", topic: "고독의 의미" }],
  },
  {
    color: "olive", genre: "MEMOIR · 회고", slug: "아무도-보지-않는-오후",
    title: "아무도 보지 않는 오후", author: "김범",
    tag: "#창업 · #번아웃", recommender: "범",
    reason: "실패한 사람이 아니라, 멈춰본 적 있는 사람의 문장. 무너졌던 시기에 이 책의 챕터 7이 저를 일으켰습니다.",
    emotionTags: ["#회복", "#쉼", "#용기"],
    hostName: "유은재", hostIntro: "대화는 답을 찾는 일이 아니라, 함께 머무는 일입니다.",
    schedule: "2026년 6월 28일 (토) 오후 4시 – 6시 30분", location: "서울 용산구 한남동",
    lat: 37.5344, lng: 127.0049,
    joinUrl: undefined, maxParticipants: 10, currentParticipants: 3,
    description: "실패한 사람이 아니라 멈춰본 적 있는 사람의 문장. 번아웃 이후를 살아가는 법을 함께 이야기합니다.",
    sessionDates: [
      { date: "2026-06-28", topic: "멈춤의 의미" },
      { date: "2026-07-12", topic: "다시 시작하는 법" },
    ],
  },
  {
    color: "dusk", genre: "POETRY · 시", slug: "오늘-저녁-당신께",
    title: "오늘 저녁, 당신께", author: "박상현",
    tag: "#사랑 · #이별", recommender: "상현",
    reason: "시집은 빠르게 읽지 않는 것이라고 가르쳐준 책. 한 페이지에서 일주일을 머문 적이 있어요.",
    emotionTags: ["#느림", "#이별", "#기억"],
    hostName: "서민준", hostIntro: "느리게 읽는 것의 가치를 믿습니다.",
    schedule: "2026년 7월 12일 (토) 오후 6시 – 8시", location: "서울 종로구 부암동",
    lat: 37.5921, lng: 126.9602,
    joinUrl: undefined, maxParticipants: 8, currentParticipants: 8,
    description: "시집은 빠르게 읽지 않는 것이라고 가르쳐준 책. 한 줄의 시로 한 시간을 이야기하는 모임입니다.",
    sessionDates: [{ date: "2026-07-12", topic: "이별을 기억하는 방법", closed: true }],
  },
  {
    color: "sage", genre: "NON-FICTION", slug: "인간이라는-풍경",
    title: "인간이라는 풍경", author: "한강",
    tag: "#인간 · #사유", recommender: "한강",
    reason: "인간을 풍경처럼 멀리서 바라보는 시선. 미워하던 사람을 다시 사람으로 보게 만드는 책입니다.",
    emotionTags: ["#관계", "#용서", "#거리"],
    hostName: "유은재", hostIntro: "모든 사람은 이해받아야 할 이유가 있습니다.",
    schedule: "2026년 7월 19일 (토) 오후 2시 – 4시 30분", location: "서울 마포구 망원동",
    lat: 37.5558, lng: 126.9073,
    joinUrl: undefined, maxParticipants: 10, currentParticipants: 2,
    description: "인간을 풍경처럼 멀리서 바라보는 시선. 미워하던 사람을 다시 사람으로 보게 만드는 책을 함께 읽습니다.",
    sessionDates: [
      { date: "2026-07-19", topic: "인간이란 무엇인가" },
      { date: "2026-08-02", topic: "용서와 거리" },
    ],
  },
];

// ─── 위치 기반 근처 모임 컴포넌트 ─────────────────────────────
interface NearbyBook extends BookClub { distKm: number }

function NearbyClubsBanner({ books: allBooks, onOpen }: { books: BookClub[]; onOpen: (b: BookClub) => void }) {
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "denied" | "unsupported">("idle");
  const [nearby, setNearby] = useState<NearbyBook[]>([]);

  const detect = () => {
    if (!navigator.geolocation) { setStatus("unsupported"); return; }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // PostGIS 지오쿼리 우선 시도
          const res = await fetch(
            `/api/book-clubs/nearby?lat=${latitude}&lng=${longitude}&radius=15`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.clubs?.length > 0) {
              const withDist: NearbyBook[] = data.clubs.map((c: BookClub & { distance_km?: number }) => ({
                ...c,
                distKm: c.distance_km ?? haversineKm(latitude, longitude, c.lat!, c.lng!),
              }));
              setNearby(withDist.slice(0, 3));
              setStatus("found");
              return;
            }
          }
        } catch { /* fall through */ }
        // Fallback: 클라이언트 Haversine
        const withDist = allBooks
          .filter((b) => b.lat !== undefined && b.lng !== undefined && (b.currentParticipants ?? 0) < (b.maxParticipants ?? 8))
          .map((b) => ({ ...b, distKm: haversineKm(latitude, longitude, b.lat!, b.lng!) }))
          .sort((a, b) => a.distKm - b.distKm)
          .slice(0, 3);
        setNearby(withDist);
        setStatus("found");
      },
      () => setStatus("denied"),
      { timeout: 8000, maximumAge: 300000 }
    );
  };

  if (status === "idle") {
    return (
      <div className="lp-nearby-spark-wrap">
        {/* 반짝 파티클 */}
        <span className="lp-spark lp-spark-1" aria-hidden="true">✦</span>
        <span className="lp-spark lp-spark-2" aria-hidden="true">✦</span>
        <span className="lp-spark lp-spark-3" aria-hidden="true">·</span>
        <span className="lp-spark lp-spark-4" aria-hidden="true">✦</span>
        <button className="lp-nearby-spark-btn" onClick={detect}>
          {/* 펄스 링 */}
          <span className="lp-spark-ring lp-spark-ring-1" aria-hidden="true" />
          <span className="lp-spark-ring lp-spark-ring-2" aria-hidden="true" />
          <span className="lp-nearby-pin-icon lp-spark-pin" aria-hidden="true">
            <svg width="13" height="16" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 0C3.36 0 0 3.36 0 7.5C0 13.125 7.5 18 7.5 18C7.5 18 15 13.125 15 7.5C15 3.36 11.64 0 7.5 0ZM7.5 10.125C6.045 10.125 4.875 8.955 4.875 7.5C4.875 6.045 6.045 4.875 7.5 4.875C8.955 4.875 10.125 6.045 10.125 7.5C10.125 8.955 8.955 10.125 7.5 10.125Z" fill="currentColor"/>
            </svg>
          </span>
          <span>근처에 북클럽이 있어요</span>
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="lp-nearby-trigger">
        <div className="lp-nearby-loading">
          <span className="lp-nearby-spin" />
          <span>근처 모임을 찾고 있어요…</span>
        </div>
      </div>
    );
  }

  if (status === "denied" || status === "unsupported") {
    return (
      <div className="lp-nearby-trigger">
        <span className="lp-nearby-hint" style={{ color: "var(--lp-muted)" }}>
          {status === "denied" ? "위치 권한이 필요해요. 브라우저 설정에서 허용해 주시면 찾아드릴게요." : "이 브라우저에서는 위치 기반 서비스를 지원하지 않아요."}
        </span>
      </div>
    );
  }

  if (status === "found" && nearby.length === 0) {
    return (
      <div className="lp-nearby-trigger">
        <span className="lp-nearby-hint">지금은 근처에 빈 자리가 없어요. 곧 새 모임이 열릴 거예요.</span>
      </div>
    );
  }

  return (
    <div className="lp-nearby-panel">
      <div className="lp-nearby-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="lp-nearby-pin-icon lp-nearby-pin-active" aria-hidden="true">
            <svg width="14" height="17" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 0C3.36 0 0 3.36 0 7.5C0 13.125 7.5 18 7.5 18C7.5 18 15 13.125 15 7.5C15 3.36 11.64 0 7.5 0ZM7.5 10.125C6.045 10.125 4.875 8.955 4.875 7.5C4.875 6.045 6.045 4.875 7.5 4.875C8.955 4.875 10.125 6.045 10.125 7.5C10.125 8.955 8.955 10.125 7.5 10.125Z" fill="currentColor"/>
            </svg>
          </span>
          <span className="lp-nearby-title">내 근처 북클럽</span>
        </div>
        <button className="lp-nearby-reset" onClick={() => { setStatus("idle"); setNearby([]); }} aria-label="닫기">×</button>
      </div>
      <div className="lp-nearby-list">
        {nearby.map((b) => (
          <button key={b.slug} className="lp-nearby-item" onClick={() => onOpen(b)}>
            <div className={`lp-nearby-dot ${b.color}`} />
            <div className="lp-nearby-info">
              <span className="lp-nearby-name">{b.title}</span>
              <span className="lp-nearby-loc">{b.location}</span>
            </div>
            <div className="lp-nearby-dist">
              <span className="lp-nearby-km">{fmtDist(b.distKm)}</span>
              <span className="lp-nearby-seats">{(b.maxParticipants ?? 8) - (b.currentParticipants ?? 0)}자리 남음</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const miniBooks: BookClub[] = [
  { color: "terra", slug: "제자리로-돌아오는-밤에", title: "제자리로 돌아오는 밤에", recommender: "서연", tag: "#귀환", currentParticipants: 8, isMini: true },
  { color: "smoke", slug: "느리게-읽는-일", title: "느리게 읽는 일", recommender: "진호", tag: "#느림", currentParticipants: 11, isMini: true },
  { color: "mauve", slug: "어머니의-문장들", title: "어머니의 문장들", recommender: "지우", tag: "#가족", currentParticipants: 9, isMini: true },
  { color: "fog", slug: "흐린-날의-사유", title: "흐린 날의 사유", recommender: "민재", tag: "#우울", currentParticipants: 14, isMini: true },
  { color: "ochre", slug: "아무것도-하지-않는-연습", title: "아무것도 하지 않는 연습", recommender: "은지", tag: "#쉬이", currentParticipants: 16, isMini: true },
  { color: "navy", slug: "일을-사랑하면서", title: "일을 사랑하면서 일에 지지 않는 법", recommender: "태우", tag: "#번아웃", currentParticipants: 22, isMini: true },
  { color: "cream", slug: "이름-없는-감정들에게", title: "이름 없는 감정들에게", recommender: "은재", tag: "#감정", currentParticipants: 10, isMini: true },
  { color: "olive", slug: "수요일-저녁-낭독회", title: "수요일 저녁 낭독회", recommender: "현우", tag: "#시", currentParticipants: 7, isMini: true },
  { color: "rust", slug: "아버지라는-낯선-사람", title: "아버지라는 낯선 사람", recommender: "도현", tag: "#가족", currentParticipants: 13, isMini: true },
  { color: "sage", slug: "쓰이지-않는-시간이-있다", title: "쓰이지 않는 시간이 있다", recommender: "하은", tag: "#시간", currentParticipants: 9, isMini: true },
  { color: "dusk", slug: "어둠-속의-밝은-한-줄", title: "어둠 속의 밝은 한 줄", recommender: "제이", tag: "#시", currentParticipants: 6, isMini: true },
  { color: "terra", slug: "온전하지-않은-시절", title: "온전하지 않은 시절", recommender: "안녕", tag: "#청춘", currentParticipants: 12, isMini: true },
  { color: "mauve", slug: "헤어진-이들의-재회", title: "헤어진 이들의 재회", recommender: "다연", tag: "#관계", currentParticipants: 8, isMini: true },
  { color: "smoke", slug: "도시의-올랜-해", title: "도시의 올랜 해", recommender: "우재", tag: "#도시", currentParticipants: 11, isMini: true },
  { color: "ink", slug: "죽음을-읽는-일곱-가지", title: "죽음을 읽는 일곱 가지 시선", recommender: "혁", tag: "#생경", currentParticipants: 15, isMini: true },
  { color: "cream", slug: "난-당신을-잘-모릅니다", title: "난 당신을 잘 모릅니다", recommender: "재희", tag: "#대화", currentParticipants: 10, isMini: true },
  { color: "olive", slug: "돈이-말해주지-않는", title: "돈이 말해주지 않는 것들", recommender: "지훈", tag: "#삶", currentParticipants: 17, isMini: true },
  { color: "fog", slug: "높은-곳의-창가에서", title: "높은 곳의 창가에서", recommender: "세아", tag: "#고독", currentParticipants: 9, isMini: true },
  { color: "rust", slug: "다시-걸을-수-있는-사람들", title: "다시 걸을 수 있는 사람들", recommender: "혜원", tag: "#회복", currentParticipants: 13, isMini: true },
  { color: "ochre", slug: "외국어로-읽는-한국-소설", title: "외국어로 읽는 한국 소설", recommender: "명희", tag: "#언어", currentParticipants: 6, isMini: true },
  { color: "mauve", slug: "넘어진-자리에서", title: "넘어진 자리에서 주워 든 것들", recommender: "연우", tag: "#실패", currentParticipants: 11, isMini: true },
  { color: "dusk", slug: "밤에만-편지를-씁니다", title: "밤에만 편지를 씁니다", recommender: "레이", tag: "#서신", currentParticipants: 8, isMini: true },
  { color: "sage", slug: "자연을-읽는-일요일", title: "자연을 읽는 일요일", recommender: "소희", tag: "#생태", currentParticipants: 14, isMini: true },
  { color: "navy", slug: "철학이-필요한-저녁", title: "철학이 필요한 저녁", recommender: "윤", tag: "#사유", currentParticipants: 18, isMini: true },
];

const testimonials = [
  { who: "채현", sub: "UX 디자이너 · 30", said: "처음으로 모르는 사람 앞에서 솔직한 대화를 했어요. 그 밤이 한 달 동안 저를 흔들고 있었습니다.", when: "외로움 시즌 · Week 04" },
  { who: "진우", sub: "개발자 · 34", said: "'사람은 아직 믿을 만하다'는 감각을 4년 만에 다시 느꼈습니다. 그게 가장 큰 회복이었어요.", when: "관계 시즌 · 종료 후" },
  { who: "윤서", sub: "에디터 · 28", said: "질문 하나가 삶을 흔들었습니다. 그 후로 일을 그만두고 6개월을 쉬었어요. 후회하지 않습니다.", when: "사랑 시즌 · Week 02" },
  { who: "도연", sub: "대학원생 · 26", said: "대답을 잘 하려 애쓰지 않게 된 첫 번째 자리였어요. 정답 없이 머무는 법을 배웠습니다.", when: "인간 시즌" },
  { who: "하린", sub: "교사 · 39", said: "우리 반 아이들에게도 이런 자리를 만들어주고 싶다고 생각했습니다. 그게 변화의 시작이었어요.", when: "AI와 인간 시즌" },
];

const leaders = [
  { initial: "J", name: "정해린", role: "시즌 04 진행", philosophy: "정답보다 진심을 믿습니다. 우리는 결론을 미루는 연습 중입니다.", q: "\"당신이 가장 오래 미뤄둔 감정은 무엇인가요?\"" },
  { initial: "S", name: "서민준", role: "시즌 03 진행", philosophy: "조용한 사람의 한 문장은 시끄러운 사람의 한 시간보다 길게 남습니다.", q: "\"당신이 마지막으로 누군가에게 진심으로 사과한 건 언제였나요?\"" },
  { initial: "Y", name: "유은재", role: "시즌 02 진행", philosophy: "대화는 답을 찾는 일이 아니라, 함께 머무는 일입니다.", q: "\"기계가 더 잘하는 시대에, 인간으로 남고 싶은 부분이 있나요?\"" },
];

// Random float popup content pool
const floatPopupPool = [
  ...books.map((b) => ({ type: "book" as const, title: b.title, sub: b.genre ?? "", color: b.color, slug: b.slug })),
  ...leaders.map((l) => ({ type: "leader" as const, title: l.name, sub: l.role, color: "ink", slug: "" })),
];

// ─── Float popup component ─────────────────────────────────────
function FloatPopup({ color, title, sub, type, onOpen }: {
  color: string; title: string; sub: string; type: "book" | "leader"; onOpen: () => void;
}) {
  return (
    <div className="fp-popup">
      <div className={`fp-visual ${color}`}>
        {type === "book" ? "📖" : "💬"}
      </div>
      <div className="fp-body">
        <div className="fp-title">{title}</div>
        <div className="fp-sub">{sub}</div>
        <button className="fp-link" onClick={onOpen}>
          {type === "book" ? "자세히 보기" : "만나보기"} →
        </button>
      </div>
    </div>
  );
}

// ─── Archive Review Form 컴포넌트 ─────────────────────────────
function ArchiveReviewForm() {
  const [tab, setTab] = useState<"text" | "photo" | "video">("text");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
    setUploadStatus("uploading");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("upload failed");
      const { url } = await res.json();
      setPhotoUrl(url);
      setUploadStatus("done");
    } catch {
      setUploadStatus("error");
      setPhotoPreview("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 20) return;
    if (tab === "photo" && uploadStatus === "uploading") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/archive/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: tab,
          content: content.trim(),
          author_name: authorName.trim() || "익명",
          photo_url: tab === "photo" ? photoUrl.trim() || null : null,
          video_url: tab === "video" ? videoUrl.trim() || null : null,
          is_public: isPublic,
        }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("sent");
      setContent(""); setAuthorName(""); setPhotoUrl(""); setPhotoPreview(""); setVideoUrl("");
      setUploadStatus("idle");
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 4000);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 14,
    border: "1px solid var(--lp-line-soft)", background: "rgba(255,255,255,0.6)",
    color: "var(--lp-ink)", outline: "none", boxSizing: "border-box", fontFamily: "var(--lp-sans)",
  };

  const canSubmit = content.trim().length >= 20 && uploadStatus !== "uploading";

  return (
    <div style={{ padding: "36px 40px", borderRadius: 16, background: "rgba(255,255,255,0.4)", border: "1px solid var(--lp-line-soft)", maxWidth: 1020, margin: "56px auto 0" }}>
      <div style={{ fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--lp-muted)", marginBottom: 10 }}>아카이빙에 남기기</div>
      <p style={{ fontSize: 15, color: "var(--lp-ink-soft)", marginBottom: 6, lineHeight: 1.6 }}>
        한 번쯤 남겨볼까 싶으셨다면, 그 생각이 맞아요.
      </p>
      <p style={{ fontSize: 13.5, color: "var(--lp-muted)", marginBottom: 24, lineHeight: 1.6 }}>
        글·사진·영상으로 남겨주세요. 공개 여부는 직접 고르실 수 있어요.
      </p>

      {/* 공개/비공개 토글 */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{ display: "flex", borderRadius: 9999, overflow: "hidden", border: "1px solid var(--lp-line-soft)" }}>
          {[{ v: true, label: "공개" }, { v: false, label: "나만 보기" }].map(({ v, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setIsPublic(v)}
              style={{
                padding: "7px 18px", fontSize: 13, border: "none", cursor: "pointer",
                background: isPublic === v ? "var(--lp-ink)" : "transparent",
                color: isPublic === v ? "var(--lp-cream)" : "var(--lp-muted)",
                transition: "all .2s ease",
                fontFamily: "var(--lp-serif-ko)", letterSpacing: "-0.005em",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12.5, color: "var(--lp-muted)", fontFamily: "var(--lp-serif-ko)", fontStyle: "normal" }}>
          {isPublic ? "아카이빙에 올라가요." : "나만 간직해요."}
        </span>
      </div>

      {/* 유형 탭 */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "1px solid var(--lp-line-soft)" }}>
        {(["text", "photo", "video"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} style={{
            padding: "8px 22px", fontSize: 13.5, background: "none", border: "none",
            cursor: "pointer", color: tab === t ? "var(--lp-ink)" : "var(--lp-muted)",
            borderBottom: tab === t ? "2px solid var(--lp-ink)" : "2px solid transparent",
            marginBottom: -1, transition: "color 0.2s",
            fontFamily: "var(--lp-serif-ko)", letterSpacing: "-0.005em",
          }}>
            {t === "text" ? "글" : t === "photo" ? "사진" : "영상"}
          </button>
        ))}
      </div>

      {status === "sent" ? (
        <div style={{ padding: "32px 0", textAlign: "center" }}>
          <div style={{ fontSize: 22, marginBottom: 12, fontFamily: "var(--lp-serif)", color: "var(--lp-accent)", letterSpacing: "0.2em" }}>— ✦ —</div>
          <p style={{ fontSize: 16, color: "var(--lp-ink)", marginBottom: 8, fontFamily: "var(--lp-serif-ko)" }}>
            {isPublic ? "아카이빙에 올라갔어요." : "기록이 저장됐어요."}
          </p>
          <span style={{ fontSize: 13.5, color: "var(--lp-muted)" }}>
            {isPublic ? "다른 분들도 읽으실 수 있어요. 감사해요." : "소중한 기록, 안전하게 담아뒀어요."}
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {tab === "photo" && (
            <div style={{ marginBottom: 16 }}>
              {photoPreview ? (
                <div style={{ position: "relative", marginBottom: 8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="미리보기" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 10, display: "block" }} />
                  <button
                    type="button"
                    onClick={() => { setPhotoPreview(""); setPhotoUrl(""); setUploadStatus("idle"); }}
                    style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >×</button>
                  {uploadStatus === "uploading" && (
                    <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, gap: 8 }}>
                      <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                      올리는 중이에요…
                    </div>
                  )}
                  {uploadStatus === "error" && (
                    <p style={{ fontSize: 12, color: "rgba(239,68,68,0.9)", marginTop: 4 }}>올리기에 실패했어요. 링크로 입력해 주실 수 있어요.</p>
                  )}
                </div>
              ) : (
                <label
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "28px 16px", borderRadius: 10, border: "2px dashed var(--lp-line-soft)", cursor: "pointer", transition: "background .2s ease", background: "rgba(255,255,255,0.3)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.6)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.3)")}
                >
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoFile} />
                  <span style={{ fontSize: 14, color: "var(--lp-ink-soft)", fontFamily: "var(--lp-serif-ko)" }}>사진 고르기</span>
                  <span style={{ fontSize: 12, color: "var(--lp-muted)", fontFamily: "var(--lp-serif-ko)" }}>또는 아래에 링크로 올릴 수 있어요</span>
                </label>
              )}
              {!photoPreview && (
                <input type="url" placeholder="사진 링크 입력" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} style={{ ...inputStyle, marginTop: 8 }} />
              )}
            </div>
          )}
          {tab === "video" && (
            <div style={{ marginBottom: 16 }}>
              <input type="url" placeholder="YouTube · Vimeo 링크를 붙여넣어 주세요" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} style={inputStyle} />
              {videoUrl && (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) && (
                <div style={{ marginTop: 8, borderRadius: 10, overflow: "hidden", background: "#000" }}>
                  <iframe
                    src={videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}
                    style={{ width: "100%", height: 180, border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}
          <textarea
            placeholder={
              tab === "text"
                ? "모임 이후 달라진 것, 오래 남은 문장, 작은 변화를 적어주세요."
                : "이 사진·영상에 담긴 이야기를 들려주세요."
            }
            rows={tab === "text" ? 5 : 3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            minLength={20}
            required
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 10, fontSize: 14,
              border: "1px solid var(--lp-line-soft)", background: "rgba(255,255,255,0.6)",
              color: "var(--lp-ink)", outline: "none", resize: "vertical", boxSizing: "border-box",
              lineHeight: 1.7, fontFamily: "var(--lp-serif-ko)",
            }}
          />
          <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="닉네임 (익명도 괜찮아요)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              maxLength={20}
              style={{ flex: 1, minWidth: 160, padding: "10px 14px", borderRadius: 9, fontSize: 13.5, border: "1px solid var(--lp-line-soft)", background: "rgba(255,255,255,0.6)", color: "var(--lp-ink)", outline: "none", fontFamily: "var(--lp-sans)" }}
            />
            <button
              type="submit"
              disabled={!canSubmit || status === "sending"}
              style={{
                padding: "10px 26px", borderRadius: 9999, fontSize: 14, fontWeight: 500,
                background: canSubmit ? "var(--lp-ink)" : "var(--lp-line-soft)",
                color: canSubmit ? "var(--lp-cream)" : "var(--lp-muted)",
                border: "none", cursor: canSubmit ? "pointer" : "not-allowed",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
            >
              {status === "sending" ? "저장 중…" : "기록하기"}
            </button>
          </div>
          {status === "error" && (
            <p style={{ fontSize: 12.5, color: "rgba(239,68,68,0.8)", marginTop: 8 }}>잠시 후 다시 눌러주세요.</p>
          )}
        </form>
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────
export interface LandingQuestion {
  id: string;
  content: string;
  author_name: string;
  likes: number;
  saves: number;
  answers_count: number;
}

interface LandingPageProps {
  todayQuestion?: LandingQuestion | null;
  recentQuestions?: LandingQuestion[];
}

// ─── Main component ───────────────────────────────────────────
export default function LandingPage({ todayQuestion, recentQuestions }: LandingPageProps) {
  const [modalBook, setModalBook] = useState<BookClub | null>(null);
  const [activeFloat, setActiveFloat] = useState<number | null>(null);
  const [askContent, setAskContent] = useState("");
  const [navBtnIdx, setNavBtnIdx] = useState(0); // 0=로그인, 1=회원가입
  const [navBtnFading, setNavBtnFading] = useState(false);
  const [askAuthor, setAskAuthor] = useState("");
  const [askStatus, setAskStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [miniExpanded, setMiniExpanded] = useState(false);
  const [questionLikes, setQuestionLikes] = useState<number | null>(null);
  const [questionSaves, setQuestionSaves] = useState<number | null>(null);
  const [questionReacted, setQuestionReacted] = useState<{ like: boolean; save: boolean }>({ like: false, save: false });
  const [dbBooks, setDbBooks] = useState<BookClub[]>([]);
  const sessionKeyRef = useRef<string>(Math.random().toString(36).slice(2));
  const floatTimeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  // DB에서 북클럽 불러오기 (위치 기반용 lat/lng 포함)
  useEffect(() => {
    fetch("/api/book-clubs?mini=false")
      .then((r) => r.json())
      .then((d) => {
        if (d.clubs?.length > 0) setDbBooks(d.clubs);
      })
      .catch(() => {});
  }, []);

  // Pick random popup items for each float element (stable per session)
  const [floatItems] = useState(() =>
    [0, 1, 2, 3, 4].map(() => floatPopupPool[Math.floor(Math.random() * floatPopupPool.length)])
  );

  // 랜딩 nav 버튼 순환
  useEffect(() => {
    const interval = setInterval(() => {
      setNavBtnFading(true);
      setTimeout(() => { setNavBtnIdx((i) => (i + 1) % 2); setNavBtnFading(false); }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const nav = document.getElementById("lp-nav");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".lp-reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const ta = document.querySelector(".lp-ask-field textarea") as HTMLTextAreaElement;
    if (!ta) return;
    const grow = () => { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; };
    ta.addEventListener("input", grow);
    return () => ta.removeEventListener("input", grow);
  }, []);

  const openFloat = useCallback((idx: number) => {
    const t = floatTimeouts.current.get(idx);
    if (t) clearTimeout(t);
    setActiveFloat(idx);
  }, []);

  const closeFloat = useCallback((idx: number) => {
    const t = setTimeout(() => setActiveFloat(null), 200);
    floatTimeouts.current.set(idx, t);
  }, []);

  const handleFloatOpen = useCallback((idx: number) => {
    const item = floatItems[idx];
    if (item.type === "book") {
      const book = books.find((b) => b.slug === item.slug);
      if (book) setModalBook(book);
    }
  }, [floatItems]);

  const handleReact = async (type: "like" | "save") => {
    if (!todayQuestion?.id) return;
    try {
      const res = await fetch(`/api/landing-questions/${todayQuestion.id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, session_key: sessionKeyRef.current }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setQuestionReacted((prev) => ({ ...prev, [type]: data.reacted }));
      if (type === "like" && data.likes !== undefined) setQuestionLikes(data.likes);
      if (type === "save" && data.saves !== undefined) setQuestionSaves(data.saves);
    } catch { /* ignore */ }
  };

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askContent.trim() || askContent.trim().length < 5) return;
    setAskStatus("sending");
    try {
      const res = await fetch("/api/landing-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: askContent.trim(), author_name: askAuthor.trim() || "익명" }),
      });
      if (!res.ok) throw new Error("fail");
      setAskStatus("sent");
      setAskContent("");
      setAskAuthor("");
    } catch {
      setAskStatus("error");
    }
    setTimeout(() => setAskStatus("idle"), 3000);
  };

  return (
    <div className="lp">
      <div className="lp-grain" aria-hidden="true" />
      <div className="lp-grain-light" aria-hidden="true" />

      {/* NAV */}
      <nav className="lp-nav" id="lp-nav">
        <a href="#top" className="lp-wordmark">
          <span className="wm-mark" aria-hidden="true">
            <span className="wm-q">?</span><span className="wm-bang">!</span>
          </span>
          {/* 랜딩 nav 워드마크 교차 */}
          <span style={{ display: "inline-grid" }}>
            {(["질문하는 사람들", "Quesapience"] as const).map((w, i) => (
              <span key={w} style={{
                gridArea: "1 / 1", whiteSpace: "nowrap",
                fontFamily: i === 1 ? '"EB Garamond", Georgia, serif' : "var(--lp-serif-ko)",
                fontStyle: i === 1 ? "italic" : "normal",
                fontWeight: i === 1 ? 400 : 600,
                fontSize: i === 1 ? 15 : 19,
                letterSpacing: i === 1 ? "0.06em" : "-0.012em",
                transition: "opacity 0.4s ease, transform 0.4s cubic-bezier(.2,.8,.2,1)",
                opacity: navBtnIdx === i && !navBtnFading ? 1 : 0,
                transform: navBtnIdx === i && !navBtnFading ? "translateY(0)" : navBtnIdx === i ? "translateY(-4px)" : "translateY(4px)",
              }}>{w}</span>
            ))}
          </span>
        </a>
        <div className="lp-nav-links">
          <a href="/questions">질문</a>
          <a href="/bookclub">북클럽</a>
          <a href="/archive">아카이빙</a>
          <a href="/giants">거인의 어깨</a>
        </div>
        {/* 로그인/회원가입 순환 버튼 */}
        <div style={{ position: "relative", width: 90, height: 38, overflow: "hidden" }}>
          {[
            { href: "/login", label: "로그인", filled: false },
            { href: "/signup", label: "함께하기", filled: true },
          ].map((btn, i) => (
            <a
              key={btn.href}
              href={btn.href}
              className={btn.filled ? "lp-nav-cta" : ""}
              style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "var(--lp-sm)", fontWeight: 500,
                textDecoration: "none",
                ...(btn.filled ? {} : {
                  border: "1px solid var(--lp-line)",
                  borderRadius: 9999,
                  color: "var(--lp-ink-soft)",
                }),
                transition: "opacity .3s ease, transform .3s ease",
                opacity: navBtnIdx === i && !navBtnFading ? 1 : 0,
                transform: navBtnIdx === i && !navBtnFading ? "translateY(0)" : navBtnIdx === i ? "translateY(-5px)" : "translateY(5px)",
                pointerEvents: navBtnIdx === i ? "auto" : "none",
              }}
            >
              <span>{btn.label}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero" id="top">
        <div className="lp-hero-inner">
          <div className="lp-hero-meta">
            <div className="lp-eyebrow">서초구 선정 미래혁신형 북클럽</div>
            <div className="lp-right" />
          </div>
          <h1 className="lp-h-display">
            <span className="lp-reveal"><span>좋은 <span className="lp-em">질문</span>은</span></span>
            <span className="lp-reveal"><span>좋은 사람을 데려옵니다.</span></span>
          </h1>
          <div className="lp-hero-sub">
            <p>
              <span className="lp-kw">질문</span>으로{" "}
              <span className="lp-kw k2">연결</span>되는 미래혁신형{" "}
              <span className="lp-kw k3">북클럽</span>.<br />
              사람들이 가장 깊은 이야기를 나눠요.
            </p>
            <div className="lp-cta-stack">
              <div className="lp-cta-row">
                <a href="/questions" className="lp-btn-primary">
                  <span>질문 주고 받기</span>
                  <span className="lp-arrow" />
                </a>
              </div>
              <span className="lp-cta-note">— 생각보다 따뜻합니다.</span>
            </div>
          </div>

          {/* Subtle accent dots */}
          {([
            { cls: "dot d1", idx: 0 },
            { cls: "dot d2", idx: 1 },
          ] as const).map(({ cls, idx }) => (
            <div
              key={idx}
              className={`lp-float ${cls} lp-float-secret`}
              onMouseEnter={() => openFloat(idx)}
              onMouseLeave={() => closeFloat(idx)}
            >
              {activeFloat === idx && (
                <FloatPopup
                  {...floatItems[idx]}
                  onOpen={() => handleFloatOpen(idx)}
                />
              )}
            </div>
          ))}
        </div>
        <div className="lp-scroll-cue">
          <span>scroll</span>
          <span className="sc-line" />
        </div>
      </section>

      {/* BOOKS */}
      <section className="lp-section lp-books" id="books">
        <div className="lp-section-head">
          <div className="lp-left">
            <a href="/bookclub" className="lp-eyebrow lp-section-title-link">BOOK LOVERS — 책을 건네는 마음</a>
            <a href="/bookclub" className="lp-section-title-link" style={{ textDecoration: "none" }}>
              <h2 className="lp-h-section">
                이 책을 누군가에게<br /><span className="lp-em">꼭 건네고</span> 싶었던 이유.
              </h2>
            </a>
          </div>
          <p className="lp-lede">
            우리는 &lsquo;왜 이 책을 건네고 싶었는지&rsquo;를 씁니다. 이 책이 한 사람에게 어떻게 스며들었는지를 함께 기록합니다.
          </p>
        </div>

        {/* 위치 기반 근처 북클럽 — 섹션 상단 노출 */}
        <div className="lp-nearby-row">
          <NearbyClubsBanner books={dbBooks.length > 0 ? dbBooks : books} onOpen={(b) => setModalBook(b)} />
        </div>

        <div className="lp-books-grid">
          {books.map((b) => (
            <article
              key={b.title}
              className="lp-book lp-reveal"
              onClick={() => setModalBook(b)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setModalBook(b)}
            >
              <div className={`lp-book-cover ${b.color}`}>
                <span className="bc-spine" />
                <div className="bc-top">
                  <span className="bc-genre">{b.genre}</span>
                </div>
                <div className="bc-bot">
                  <h3>{b.title}</h3>
                  <p className="bc-author">— {b.author}</p>
                </div>
                <div className="bc-hover-hint">모임 상세 보기</div>
              </div>
              <div className="lp-book-info">
                <div className="bi-tag">{b.tag}</div>
                <p className="bi-rec">— {josa(b.recommender ?? "", "이가")} 건넵니다</p>
                <p className="bi-reason">{b.reason}</p>
                <div className="lp-emotion-tags">
                  {b.emotionTags?.map((t) => <span key={t}>{t}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Mini books — collapsible */}
        <div className="lp-books-more">
          <div className="lp-books-more-head">
            <div className="bm-rule" />
            <button
              className="lp-books-more-toggle"
              onClick={() => setMiniExpanded((v) => !v)}
              aria-expanded={miniExpanded}
            >
              <span>더 많은 북클럽</span>
              <span className="bmt-count">24개</span>
              <span className="bmt-chev" aria-hidden="true" />
            </button>
            <div className="bm-rule" />
          </div>
          <p className="lp-books-more-help">
            {miniExpanded
              ? "— 지금 바로 참여할 수 있는 모임들이에요."
              : "— 마음에 드는 모임이 있을지도 모르니까요."}
          </p>
          <div className={`lp-books-more-body${miniExpanded ? " open" : ""}`}>
            <div className="lp-mini-grid">
              {miniBooks.map((b) => (
                <div
                  key={b.title}
                  className="lp-mini-book"
                  onClick={() => setModalBook(b)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setModalBook(b)}
                >
                  <div className={`lp-mini-spine ${b.color}`} />
                  <div className="lp-mini-body">
                    <div className="lp-mini-title">{b.title}</div>
                    <div className="lp-mini-rec">— {josa(b.recommender ?? "", "이가")} 이끌어요</div>
                    <div className="lp-mini-meta">
                      <span className="lp-mini-tag">{b.tag}</span>
                      <span className="lp-mini-members">
                        <span className="mem-dot" />{b.currentParticipants}명 참여 중
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ARCHIVING — 후기 섹션 */}
      <section className="lp-section lp-testify" id="testify">
        <div className="lp-section-head">
          <div className="lp-left">
            <a href="/archive" className="lp-eyebrow lp-section-title-link">ARCHIVING — 사람, 변화, 기록</a>
            <a href="/archive" className="lp-section-title-link" style={{ textDecoration: "none" }}>
              <h2 className="lp-h-section">
                한 시즌이 지나면<br /><span className="lp-em">한 사람이</span> 바뀝니다.
              </h2>
            </a>
          </div>
          <p className="lp-lede">
            가장 아끼는, 작고 단단한 목소리들이에요.<br />
            <a href="/archive" style={{ fontSize: 13, color: "var(--lp-accent)", fontFamily: "var(--lp-serif)", letterSpacing: "0.04em", opacity: 0.8 }}>
              전체 아카이브 보기 →
            </a>
          </p>
        </div>
        <div className="lp-test-list">
          {testimonials.map((t) => (
            <div key={t.who} className="lp-test-item">
              <div className="ti-who">— {t.who}<span className="ti-sub">{t.sub}</span></div>
              <div className="ti-said">{t.said}</div>
              <div className="ti-when">{t.when}</div>
            </div>
          ))}
        </div>

        {/* 아카이빙 더 보기 */}
        <div style={{ maxWidth: 1020, margin: "32px auto 0", display: "flex", justifyContent: "flex-end" }}>
          <a
            href="/archive"
            style={{
              fontFamily: "var(--lp-serif)", fontSize: 13.5, letterSpacing: "0.06em",
              color: "var(--lp-accent)", textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 6,
              opacity: 0.85, transition: "opacity .2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.85")}
          >
            더 많은 기록 보기 — 아카이빙 →
          </a>
        </div>

        {/* 후기 남기기 폼 */}
        <ArchiveReviewForm />
      </section>


      {/* QUESTIONS HUB — Today + Ask 통합 */}
      <section className="lp-section lp-question-hub" id="questions">
        <div className="lp-section-head">
          <div className="lp-left">
            <a href="/questions" className="lp-eyebrow lp-section-title-link">QUESAPIENCE · QUESTIONS — 오늘의 질문</a>
            <a href="/questions" className="lp-section-title-link" style={{ textDecoration: "none" }}>
              <h2 className="lp-h-section">
                하루에 한 번,<br />
                <span className="lp-em">마음을 흔드는</span> 질문.
              </h2>
            </a>
          </div>
          <p className="lp-lede">
            답하지 않아도 괜찮아요. 잠시 머물러 주세요.<br />
            <a href="/questions" style={{ fontSize: 13, color: "var(--lp-accent)", fontFamily: "var(--lp-serif)", letterSpacing: "0.04em", opacity: 0.8 }}>
              전체 질문 보기 →
            </a>
          </p>
        </div>

        <div className="lp-q-grid">
          <article className="lp-q-feature lp-reveal">
            <div className="lp-q-marker">
              <span className="qm-pulse" /> Today
            </div>
            <p className="lp-q-text">
              {todayQuestion?.content ?? "당신은 마지막으로 언제,\n진심으로 울었나요?"}
            </p>
            <div className="lp-q-meta">
              <span>
                <strong>{(questionLikes ?? todayQuestion?.likes ?? 1284).toLocaleString()}</strong> 공감
              </span>
              <span>
                <strong>{(questionSaves ?? todayQuestion?.saves ?? 397).toLocaleString()}</strong> 저장
              </span>
              <span>
                <strong>{todayQuestion?.answers_count ?? "72"}</strong> 답변
              </span>
            </div>
            <div className="lp-q-comments">
              <div className="qc-label">In the margins · 답변 미리보기</div>
              <div className="qc-row">
                <span className="qc-who">서연 ―</span>
                <span className="qc-what">&ldquo;아버지 장례식 끝나고 지하철에서. 그게 마지막이었던 것 같아요.&rdquo;</span>
              </div>
              <div className="qc-row">
                <span className="qc-who">현우 ―</span>
                <span className="qc-what">&ldquo;운 적은 많은데, 진심으로 운 적은 기억이 잘 안 나요.&rdquo;</span>
              </div>
              <div className="qc-row">
                <span className="qc-who">민지 ―</span>
                <span className="qc-what">&ldquo;오늘 새벽이요. 이유는 모르겠어요.&rdquo;</span>
              </div>
            </div>
            <a
              href={todayQuestion?.id ? `/questions/${todayQuestion.id}` : "/questions"}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, marginTop: "var(--lp-sp3)",
                fontFamily: "var(--lp-serif)", fontSize: 13, letterSpacing: "0.04em",
                color: "var(--lp-accent)", textDecoration: "none", opacity: 0.85,
                transition: "opacity .2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.85")}
            >
              <span>대화 전체 보기 · {todayQuestion?.answers_count ?? 72}개 답변</span>
              <span style={{ letterSpacing: 0 }}>→</span>
            </a>
          </article>

          <div className="lp-q-card-stack">
            {(recentQuestions && recentQuestions.length >= 3
              ? recentQuestions.slice(0, 3)
              : [
                  { id: "s1", content: "인간은 왜 외로운가요?", likes: 842, answers_count: 56, author_name: "" },
                  { id: "s2", content: "AI 시대에도 사랑은 여전히 중요할까요?", likes: 1103, answers_count: 91, author_name: "" },
                  { id: "s3", content: "당신을 살게 만든 한 문장은 무엇인가요?", likes: 2071, answers_count: 143, author_name: "" },
                ]
            ).map((c, idx) => (
              <a
                key={c.id ?? idx}
                href={c.id && !c.id.startsWith("s") ? `/questions/${c.id}` : "/questions"}
                style={{ textDecoration: "none", display: "block" }}
              >
                <article className="lp-q-card lp-reveal">
                  <span className="qcard-num">No. {String(100 - idx).padStart(3, "0")}</span>
                  <p className="qcard-q">{c.content}</p>
                  <div className="qcard-foot">
                    <span className="qf-nums">
                      <span><b>{c.likes?.toLocaleString()}</b> 공감</span>
                      <span><b>{c.answers_count}</b> 답변</span>
                    </span>
                    <span style={{ fontSize: 12, color: "var(--lp-accent)", opacity: 0.7 }}>→</span>
                  </div>
                </article>
              </a>
            ))}
          </div>
        </div>

        {/* 구분선 */}
        <div style={{ borderTop: "1px solid var(--lp-line-soft)", margin: "56px 0 48px" }} />

        {/* ASK 폼 */}
        <div className="lp-ask-inner">
          <h3 className="lp-h-section" style={{ fontSize: "clamp(22px, 3vw, 32px)", marginBottom: 16 }}>
            당신 마음속에<br /><span className="lp-em">오래 남아 있던</span> 질문은.
          </h3>
          <p className="lp-lede" style={{ marginBottom: 32 }}>
            부끄러운 질문일수록 환영해요.
          </p>

          {askStatus === "sent" ? (
            <div className="lp-ask-success">
              <div className="lp-ask-success-icon">?</div>
              <p>질문이 잘 전달됐어요.</p>
              <span>누군가의 마음에 닿을 거예요.</span>
            </div>
          ) : (
            <form onSubmit={handleAskSubmit}>
              <div className="lp-ask-field" id="askField">
                <span className="af-pen">― 당신의 질문</span>
                <textarea
                  placeholder="마음속에 오래 담아두셨던 질문이 있으신가요?"
                  rows={3}
                  spellCheck={false}
                  aria-label="질문 입력"
                  value={askContent}
                  onChange={(e) => setAskContent(e.target.value)}
                  required
                  minLength={5}
                />
                <span className="lp-sparkle s1" />
                <span className="lp-sparkle s2" />
                <span className="lp-sparkle s3" />
              </div>
              <div className="lp-ask-name-row">
                <input
                  className="lp-ask-name"
                  type="text"
                  placeholder="닉네임 (익명도 괜찮아요)"
                  value={askAuthor}
                  onChange={(e) => setAskAuthor(e.target.value)}
                  maxLength={20}
                />
              </div>
              <div className="lp-ask-actions">
                <span className="aa-hint">
                  {askStatus === "error"
                    ? "— 잠시 후 다시 눌러주세요."
                    : "— 좋은 질문은 누군가를 살립니다."}
                </span>
                <button
                  className="lp-btn-cream"
                  type="submit"
                  disabled={askStatus === "sending" || askContent.trim().length < 5}
                >
                  <span>{askStatus === "sending" ? "전송 중…" : "질문 남겨보기"}</span>
                  <span className="lp-arrow" style={{ color: "var(--lp-bg-ink)" }} />
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* GIANTS + AT HEART — 통합 하단 섹션 */}
      <section className="lp-final lp-giants-final" id="final">
        {/* AT HEART 상단 */}
        <div className="lp-eyebrow">AT HEART</div>
        <p className="lp-final-quote">
          질문은<br />가장 <span className="lp-em">인간적인</span><br />대화의 시작이에요.
        </p>
        <div className="lp-final-divider" />

        {/* GIANTS 인물 카드 */}
        <div className="lp-final-giants-label">GIANTS — 거인의 어깨 · 위대한 지성들과 나누는 대화</div>
        <div className="lp-final-giants-grid">
          {[
            { slug: "friedrich-nietzsche", name: "니체", color: "#2D3748" },
            { slug: "immanuel-kant", name: "칸트", color: "#4A5568" },
            { slug: "socrates", name: "소크라테스", color: "#5B4A35" },
            { slug: "fyodor-dostoevsky", name: "도스토옙스키", color: "#4A3728" },
            { slug: "virginia-woolf", name: "버지니아 울프", color: "#4A3A5C" },
            { slug: "albert-einstein", name: "아인슈타인", color: "#1A3A5C" },
          ].map((g) => (
            <a key={g.slug} href={`/giants/${g.slug}`} className="lp-final-giant-chip">
              <span className="lfgc-dot" style={{ background: g.color }} />
              {g.name}
            </a>
          ))}
        </div>

        {/* CTA 작게 */}
        <a href="/giants" className="lp-final-giants-link">
          거인의 어깨 탐색하기 →
        </a>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-foot-inner">
          <div className="lp-foot-mark"><span className="lp-em">—</span>질문하는 사람들 · 미래혁신형 북클럽</div>
          <div className="lp-foot-links">
            <a href="/questions">질문</a>
            <a href="/bookclub">북클럽</a>
            <a href="/archive">아카이빙</a>
            <a href="/giants">거인의 어깨</a>
          </div>
          <div className="lp-foot-copy">© 2026 — Quesapience.</div>
        </div>
      </footer>

      {/* Book Detail Modal */}
      <BookDetailModal book={modalBook} onClose={() => setModalBook(null)} />
    </div>
  );
}
