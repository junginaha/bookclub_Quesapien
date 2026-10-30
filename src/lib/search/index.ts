/**
 * 사이트 검색 — 실제 내용을 찾는다.
 *
 * 지금까지 헤더 검색(⌘K)은 **고정 링크 5개**만 들고 있었다. "체호프"도 "카너먼"도
 * "민주주의"도 아무것도 찾지 못했다. 팔레트 UI라 기술적으로 보였을 뿐 뒤에 아무것도
 * 없었다. 이 모듈이 그 뒤를 채운다.
 *
 * 색인은 이미 저장소에 있는 것만 쓴다 — 북클럽 세션, 오픈 예정 도서, 참여 안내.
 * DB도 API도 거치지 않으므로 즉시 뜨고 운영비가 0이다.
 */
import { BOOKCLUB_SESSIONS } from "@/lib/bookclub/data";
import { UPCOMING_BOOKS } from "@/lib/bookclub/upcoming";
import { activeGuides } from "@/content/ai-guides";
import { getStatus } from "@/lib/bookclub/selectors";

export type SearchKind = "club" | "book" | "guide" | "page";

export interface SearchDoc {
  kind: SearchKind;
  /** 화면에 크게 뜨는 줄 */
  title: string;
  /** 그 아래 작은 줄 — 지은이·날짜·장소 같은 사실 */
  sub: string;
  href: string;
  /** 제목 다음으로 가중치를 두는 말(지은이·장소 등) */
  strong: string;
  /** 본문 — 맞으면 점수가 가장 낮다 */
  body: string;
}

/* ── 한글 맞춤 ───────────────────────────────────────────────
   "이 처럼 사소한것들"처럼 띄어쓰기가 달라도 찾혀야 하고,
   "ㅊㅎㅍ"로 체호프가 나와야 한국 사용자가 "검색이 된다"고 느낀다.        */

/** 비교용으로 눕힌다 — 공백·문장부호를 지우고 소문자로. */
export function norm(s: string): string {
  return s.toLowerCase().replace(/[\s·・,.\-—–_'"“”‘’()[\]{}『』「」<>!?:;/\\]/g, "");
}

const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

/** 한글 음절을 첫 자음으로 바꾼다. 한글이 아닌 글자는 그대로 둔다. */
export function toCho(s: string): string {
  let out = "";
  for (const ch of s) {
    const c = ch.charCodeAt(0);
    if (c >= 0xac00 && c <= 0xd7a3) out += CHO[Math.floor((c - 0xac00) / 588)];
    else out += ch;
  }
  return out;
}

/** 질의가 전부 자음이면 초성 검색으로 본다("ㅊㅎㅍ"). 섞여 있으면 아니다. */
function isChoQuery(q: string): boolean {
  return q.length >= 2 && /^[ㄱ-ㅎ]+$/.test(q);
}

/* ── 색인 ───────────────────────────────────────────────── */

function clubDocs(): SearchDoc[] {
  return BOOKCLUB_SESSIONS.map((s) => {
    const past = getStatus(s) === "past";
    // 모임명에 이미 책 이름이 들어 있는 경우가 많다("누구나 책수다 · 『사랑과 욕망의
    // 변주곡』") — 그대로 앞에 또 붙이면 같은 제목이 두 번 나온다.
    const hasBook = s.title.includes(s.bookTitle);
    return {
      kind: "club" as const,
      title: hasBook ? s.title : `『${s.bookTitle}』 ${s.title}`,
      sub: [s.author, s.venue?.name, past ? "지난 북클럽" : "열리는 북클럽"].filter(Boolean).join(" · "),
      href: `/bookclub/${s.slug}`,
      strong: [s.bookTitle, s.author, s.title, s.venue?.name].filter(Boolean).join(" "),
      body: [s.leadQuestion, s.summary].filter(Boolean).join(" "),
    };
  });
}

function bookDocs(): SearchDoc[] {
  return UPCOMING_BOOKS.map((b) => ({
    kind: "book" as const,
    title: `『${b.bookTitle}』`,
    sub: [b.author || "저자 확인 중", b.publisher, b.genre].filter(Boolean).join(" · "),
    // 오픈 예정 도서는 자기 페이지가 없다. 섹션으로만 보내면 27개 카드 중에서
    // 그 책을 눈으로 다시 찾아야 하므로, 카드 자체에 앵커를 달아 바로 보낸다.
    href: `/#${b.slug}`,
    strong: [b.bookTitle, b.author, b.translator, b.publisher, b.genre].filter(Boolean).join(" "),
    body: b.pitch ?? "",
  }));
}

function guideDocs(): SearchDoc[] {
  return activeGuides().map((g) => ({
    kind: "guide" as const,
    title: g.title,
    sub: "참여 안내",
    href: `/guide/${g.slug}`,
    strong: g.title,
    // 가이드는 자주 묻는 질문이 곧 사람들이 치는 말이다 — 본문에 같이 넣는다.
    body: [g.description, g.answer, ...g.faqs.map((f) => f.q)].filter(Boolean).join(" "),
  }));
}

const PAGE_DOCS: SearchDoc[] = [
  { kind: "page", title: "북클럽 찾기", sub: "목록 · 지도 · 달력", href: "/bookclub", strong: "북클럽 찾기 모임 일정 지도 달력", body: "서초 강남 독서모임 일정" },
  { kind: "page", title: "우리 다시 만나요", sub: "5명이 모이면 다시 여는 책", href: "/#encore", strong: "우리 다시 만나요 앵콜 다시 읽기", body: "지난 북클럽 다시 열기 오픈 예정" },
  { kind: "page", title: "처음 오시는 분께", sub: "참여 안내", href: "/guide", strong: "처음 오시는 분께 안내 가이드", body: "혼자 가도 되나요 처음 참여" },
  { kind: "page", title: "질문", sub: "오늘의 질문 · 인기 질문", href: "/questions", strong: "질문", body: "질문 아카이브 오늘의 질문" },
  { kind: "page", title: "내 북클럽", sub: "예약 · 대기 · 함께 읽은 책", href: "/mypage", strong: "내 북클럽 마이페이지 예약 확인 취소", body: "예약 확인 취소 대기" },
  { kind: "page", title: "아카이빙", sub: "지난 기록", href: "/archive", strong: "아카이빙 기록 후기", body: "후기 기록" },
  { kind: "page", title: "이용약관 · 환불 기준", sub: "취소·환불", href: "/terms#refund", strong: "환불 취소 약관 청약철회", body: "환불 규정 취소 수수료 청약철회" },
];

let CACHE: SearchDoc[] | null = null;

export function searchIndex(): SearchDoc[] {
  if (!CACHE) CACHE = [...clubDocs(), ...bookDocs(), ...guideDocs(), ...PAGE_DOCS];
  return CACHE;
}

/* ── 점수 ───────────────────────────────────────────────── */

export interface SearchHit extends SearchDoc {
  score: number;
}

/**
 * 맞는 자리에 따라 점수를 다르게 준다 — 제목이 가장 세고 본문이 가장 약하다.
 * 초성 질의는 제목·강조만 본다(본문까지 초성으로 보면 아무거나 걸린다).
 */
export function search(query: string, limit = 8): SearchHit[] {
  const raw = query.trim();
  if (raw.length < 1) return [];
  const q = norm(raw);
  if (!q) return [];
  const cho = isChoQuery(raw.replace(/\s/g, ""));

  const hits: SearchHit[] = [];
  for (const d of searchIndex()) {
    const t = norm(d.title);
    const s = norm(d.strong);
    const b = norm(d.body);
    let score = 0;

    if (cho) {
      const tc = toCho(t);
      const sc = toCho(s);
      if (tc.startsWith(q)) score = 90;
      else if (tc.includes(q)) score = 70;
      else if (sc.includes(q)) score = 50;
    } else {
      if (t === q) score = 100;
      else if (t.startsWith(q)) score = 85;
      else if (t.includes(q)) score = 70;
      else if (s.startsWith(q)) score = 60;
      else if (s.includes(q)) score = 50;
      else if (b.includes(q)) score = 25;
    }

    if (!score) continue;
    // 열리는 북클럽을 지난 북클럽보다 위로 — 지금 할 수 있는 일이 먼저다.
    if (d.kind === "club" && !d.sub.includes("지난")) score += 6;
    hits.push({ ...d, score });
  }

  return hits.sort((a, b) => b.score - a.score || a.title.length - b.title.length).slice(0, limit);
}
