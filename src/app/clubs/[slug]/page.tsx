import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/metadata";
import { createClient } from "@/lib/supabase/server";
import {
  getClubBySlug,
  getUpcomingMeetings,
  getClubMemberCount,
  getMeetingSeats,
  getMyAttendanceStatus,
} from "@/lib/clubQueries";
import ClubDetailClient from "./ClubDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  if (!club) return buildMetadata({ title: "북클럽", description: "북클럽 상세", path: `/clubs/${slug}` });
  return buildMetadata({
    title: `${club.name} — 북클럽`,
    description: club.description ?? `${club.name} 북클럽에 참여해보세요.`,
    path: `/clubs/${club.slug}`,
    type: "event",
  });
}

export default async function ClubDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  if (!club) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [upcomingMeetings, memberCount] = await Promise.all([
    getUpcomingMeetings(club.id, 5),
    getClubMemberCount(club.id),
  ]);

  const nextMeeting = upcomingMeetings[0] ?? null;
  const [seats, myStatus] = await Promise.all([
    nextMeeting ? getMeetingSeats(nextMeeting.id) : Promise.resolve(null),
    nextMeeting && user ? getMyAttendanceStatus(nextMeeting.id, user.id) : Promise.resolve(null),
  ]);

  const crumb = breadcrumbSchema([
    { name: "홈", href: "/" },
    { name: "북클럽", href: "/clubs" },
    { name: club.name, href: `/clubs/${club.slug}` },
  ]);
  const faqs = club.vibe?.faq ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={crumb} />
      {faqs.length > 0 && <JsonLd data={faqSchema(faqs.map((f) => ({ question: f.q, answer: f.a })))} />}
      <Header />
      <main className="flex-1">
        <ClubDetailClient
          club={club}
          nextMeeting={nextMeeting}
          upcomingMeetings={upcomingMeetings}
          memberCount={memberCount}
          seats={seats}
          myStatus={myStatus}
          isLoggedIn={!!user}
        />
      </main>
      <Footer />
    </div>
  );
}
