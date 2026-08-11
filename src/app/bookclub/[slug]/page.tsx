import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import BookClubDetailClient from "./BookClubDetailClient";
import { createClient } from "@/lib/supabase/server";
import { attachEncoreCounts } from "@/lib/bookclub-server";
import { getFallbackClub } from "@/lib/bookclub";
import { bookTalkEventSchema, bookSchema, reviewsSchema, breadcrumbSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/seo/JsonLd";

// 예전 이 파일에 있던 6개 항목짜리 STATIC_CLUBS 하드코딩 폴백은
// src/lib/bookclub.ts의 FALLBACK_CLUBS(getFallbackClub)로 통합했다 —
// 리스트 페이지(clubsData.ts)가 쓰던 30개짜리 별도 폴백과 값이 어긋나던 문제를 없앤다.

interface Props { params: Promise<{ slug: string }>; }

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const club = (getFallbackClub(slug) ?? {}) as any;
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

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "junginaha@gmail.com,kimjungin@qsapiens.com").split(",");

export default async function BookClubDetailPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const fallbackClub = getFallbackClub(slug) ?? null;
  let club: any = null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? "");

  try {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const db = createServiceClient() as any;
    const { data } = await db
      .from("landing_book_clubs")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (data && !data.is_seed) {
      // 운영 DB가 아직 구조화 일정 컬럼을 갖기 전이어도 상세 페이지가 정확한
      // 일정·정원을 유지하도록, 비어 있지 않은 DB 값만 정식 폴백 위에 얹는다.
      // DB의 UUID·소개·현재 인원은 보존하고 누락된 event_starts_at 등만 보완한다.
      const dbValues = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== null && value !== undefined && value !== "")
      );
      const merged = { ...fallbackClub, ...dbValues };

      // 비관리자에게는 join_url 숨김 (has_join_url 플래그만 전달)
      if (!isAdmin && merged.join_url) {
        const { join_url, ...rest } = merged;
        void join_url;
        club = { ...rest, has_join_url: true };
      } else {
        club = merged;
      }
      const { data: signupCounts } = await db
        .from("landing_book_club_signup_counts")
        .select("applied_count, waiting_count")
        .eq("club_id", data.id)
        .maybeSingle();
      if (signupCounts) {
        club = {
          ...club,
          current_participants: Number(signupCounts.applied_count ?? 0),
          waiting_count: Number(signupCounts.waiting_count ?? 0),
        };
      }
      const [withCount] = await attachEncoreCounts(db, [club]);
      club = withCount;
    }
  } catch { /* fallback */ }

  if (!club) club = fallbackClub;
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
