import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import BookClubDetailClient from "./BookClubDetailClient";
import { createClient } from "@/lib/supabase/server";
import { bookTalkEventSchema, bookSchema, reviewsSchema, breadcrumbSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/seo/JsonLd";

// ─── Static fallback data ─────────────────────────────────────
const STATIC_CLUBS: Record<string, object> = {
  "다정함의-발명": {
    id: "1", slug: "다정함의-발명", title: "다정함의 발명", author: "허지영",
    color: "cream", genre: "에세이 · 산문", tag: "#관계 #사랑",
    host_name: "정해린", host_intro: "정답보다 진심을 믿습니다. 우리는 결론을 미루는 연습 중입니다.",
    host_books_read: 28, host_sessions_count: 12, host_rating: 4.9,
    host_philosophy: "대화는 답을 찾는 과정이 아니라, 함께 머무는 과정입니다. 이 공간에서 당신은 옳은 대답을 할 필요가 없어요.",
    schedule: "2026년 6월 14일 (토) 오후 3시 — 5시 30분", location: "서울시 서초구 서초동",
    location_detail: "강남 교보문고 근처 (참여 확정 후 정확한 장소 안내)",
    
    max_participants: 8, current_participants: 5, status: "active",
    description: "사랑은 큰 사건이 아니라 매일 발명되는 작은 다정함이라는 말. 우리가 일상에서 놓치고 있는 다정함의 순간들을 함께 발견합니다.",
    why_this_book: "사랑을 거창하게 생각해온 우리에게 필요한 책입니다. 거대한 로맨스보다 매일의 작은 행동들이 우리를 연결한다는 것을 이 책은 조용히, 하지만 분명하게 말합니다.",
    key_questions: [
      "당신이 가장 다정했던 순간은 언제인가요?",
      "받은 다정함 중 가장 오래 남은 것은 무엇인가요?",
      "다정함과 의존의 차이는 무엇일까요?",
      "당신은 다정한 사람인가요, 아니면 다정함을 받기를 원하는 사람인가요?",
    ],
    recommended_for: ["관계에서 지쳐 있는 분", "일상의 작은 것들을 놓치고 있는 분", "다정함이 무엇인지 다시 생각해보고 싶은 분"],
    session_format: "자유로운 원형 대화 / 질문 카드 방식 / 음료 제공 / 사진 촬영 가능",
    session_dates: [{ date: "2026-06-14", topic: "다정함의 정의와 발명" }],
    reviews: [
      { id: "r1", author_name: "채현", content: "처음으로 모르는 사람 앞에서 솔직한 대화를 했어요. 그 밤이 한 달 동안 저를 흔들고 있었습니다.", rating: 5, created_at: "2026-05-15" },
      { id: "r2", author_name: "진우", content: "리더 정해린님이 질문을 정말 잘 던지세요. 강요하지 않는데 자연스럽게 마음을 열게 됩니다.", rating: 5, created_at: "2026-05-16" },
      { id: "r3", author_name: "윤서", content: "다시 신청할 것 같아요. 2시간이 금방 지나갔고, 집에 오는 길에 오래 생각했습니다.", rating: 4, created_at: "2026-05-20" },
    ],
    emotion_tags: ["#다정함", "#일상", "#연결"],
  },
  "혼자라는-감각": {
    id: "2", slug: "혼자라는-감각", title: "혼자라는 감각", author: "주성원",
    color: "rust", genre: "철학 · 에세이", tag: "#외로움 #인생전환",
    host_name: "서민준", host_intro: "조용한 사람의 한 문장은 시끄러운 사람의 한 시간보다 길게 남습니다.",
    host_books_read: 34, host_sessions_count: 8, host_rating: 4.8,
    host_philosophy: "저는 빠른 대화보다 느린 대화를 선호합니다. 침묵도 대화의 일부라고 생각해요.",
    schedule: "2026년 6월 21일 (토) 오후 2시 — 4시 30분", location: "서울시 마포구 상수동",
    location_detail: "합정 근처 독립서점 (참여 확정 후 상세 주소 안내)",
    
    max_participants: 6, current_participants: 4, status: "active",
    description: "고독을 결핍이 아니라 깊이로 다루는 책. 혼자 있는 것이 부끄럽지 않아진 첫 번째 모임입니다.",
    why_this_book: "혼자이기 때문에 더 깊어지는 것들이 있습니다. 이 책은 혼자라는 감각을 두려움이 아니라 능력으로 바라보게 합니다.",
    key_questions: [
      "혼자 있을 때 당신은 무엇을 느끼나요?",
      "외로움과 고독의 차이는 무엇이라 생각하나요?",
      "혼자인 시간이 당신에게 준 것은?",
      "혼자임을 즐기는 순간이 있나요?",
    ],
    recommended_for: ["혼자 있는 시간이 불편한 분", "고독을 두려워하는 분", "내면의 소리를 듣고 싶은 분"],
    session_format: "소규모 원형 대화 / 노트 필기 권장 / 침묵의 시간도 있음",
    session_dates: [{ date: "2026-06-21", topic: "고독의 의미와 힘" }],
    reviews: [
      { id: "r4", author_name: "도연", content: "대답을 잘 하려 애쓰지 않게 된 첫 번째 자리였어요. 정답 없이 머무는 법을 배웠습니다.", rating: 5, created_at: "2026-05-10" },
    ],
    emotion_tags: ["#고독", "#성장", "#사유"],
  },
};

interface Props { params: Promise<{ slug: string }>; }

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const club = (STATIC_CLUBS[slug] ?? {}) as any;
  const title = club.title ?? "북클럽";
  const author = club.author ? ` — ${club.author}` : "";
  return buildMetadata({
    title: `${title}${author} 북토크`,
    description: club.description ?? `${title} 북토크. 질문하는 사람들의 오프라인 독서 모임.`,
    path: `/bookclub/${slug}`,
    type: "event",
    keywords: [title, club.genre, "북토크", "오프라인독서", club.host_name].filter(Boolean),
    author: club.host_name,
  });
}

export default async function BookClubDetailPage({ params }: Props) {
  const { slug } = await params;
  let club: any = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("landing_book_clubs")
      .select("*")
      .eq("slug", slug)
      .single();
    if (data) club = data;
  } catch { /* fallback */ }

  if (!club) club = STATIC_CLUBS[slug] ?? null;
  if (!club) notFound();

  const eventLd = bookTalkEventSchema(club);
  const bookLd = bookSchema(club);
  const reviewLd = reviewsSchema(slug, club.title ?? "", club.reviews ?? []);
  const crumbLd = breadcrumbSchema([
    { name: "홈", href: "/" },
    { name: "북클럽", href: "/bookclub" },
    { name: club.title ?? slug, href: `/bookclub/${slug}` },
  ]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Stage 1: Structured data */}
      <JsonLd data={eventLd} />
      <JsonLd data={bookLd} />
      <JsonLd data={reviewLd} />
      <JsonLd data={crumbLd} />

      <Header />
      <BookClubDetailClient club={club} />
      <Footer />
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
