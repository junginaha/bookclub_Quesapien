import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { BOOKCLUBS, getBookClub, status as computeStatus } from "@/lib/bookclubs";
import { getJoinedCounts } from "@/lib/bookclubs.server";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import DetailClient from "./DetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

// joinedCount는 매 요청 실시간 조회가 원칙이라(§B "하드코딩 금지") 정적 캐싱을 쓰지 않는다.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const club = getBookClub(decodeURIComponent(slug));
  if (!club) {
    return buildMetadata({
      title: "북클럽",
      description: "질문하는 사람들의 오프라인 북토크.",
      path: `/bookclub/${slug}`,
      noIndex: true,
    });
  }
  return buildMetadata({
    title: `${club.title}`,
    description: club.reasonOneLine,
    path: `/bookclub/${club.slug}`,
    type: "event",
    image: club.bookCover || undefined,
    keywords: [club.bookTitle, club.bookAuthor, "북토크", "오프라인독서"],
  });
}

export default async function BookClubDetailPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const club = getBookClub(slug);
  if (!club) notFound();

  // 한 번의 병렬 조회로 전부 처리 — Supabase 미연결 시 club당 순차 DNS 실패 지연이
  // 누적되지 않게 한다(이 클럽 + 나머지 클럽을 두 번에 나눠 부르지 않음).
  const allCounts = await getJoinedCounts(BOOKCLUBS.map((c) => c.slug));
  const joinedCount = allCounts[slug] ?? 0;
  const status = computeStatus(club, joinedCount);

  const nextClubs = BOOKCLUBS.filter((c) => c.slug !== slug)
    .map((c) => ({ club: c, status: computeStatus(c, allCounts[c.slug] ?? 0), joinedCount: allCounts[c.slug] ?? 0 }))
    .filter((c) => c.status !== "past")
    .sort((a, b) => a.club.startAt.localeCompare(b.club.startAt))
    .slice(0, 3);

  const crumbLd = breadcrumbSchema([
    { name: "홈", href: "/" },
    { name: "북클럽", href: "/bookclub" },
    { name: club.title, href: `/bookclub/${slug}` },
  ]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <JsonLd data={crumbLd} />
      <Header />
      <DetailClient club={club} status={status} joinedCount={joinedCount} nextClubs={nextClubs} />
      <Footer />
    </div>
  );
}
