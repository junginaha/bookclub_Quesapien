import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { BOOKCLUB_SESSIONS, getSession } from "@/lib/bookclub/data";
import { feeLabel, formatMonthDay, formatTimeOfDay, formatWeekdayFull, getStatus } from "@/lib/bookclub/selectors";
import { getReservedCounts } from "@/lib/bookclub/server";
import { buildMetadata } from "@/lib/metadata";
import { absoluteCoverUrl, breadcrumbSchema, bookclubSessionEventSchema, discussionQuestionsSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import DetailClient from "./DetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

// reserved는 매 요청 실시간 조회가 원칙이라(§작업원칙4) 정적 캐싱을 쓰지 않는다.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const session = getSession(decodeURIComponent(slug));
  if (!session) {
    return buildMetadata({
      title: "북클럽",
      description: "질문하는 사람들의 오프라인 북토크.",
      path: `/bookclub/${slug}`,
      noIndex: true,
    });
  }
  const book = `『${session.bookTitle}』`;
  const title = session.title.includes(session.bookTitle)
    ? `${session.title} 독서모임`
    : `${session.title} · ${book} 독서모임`;
  const when = `${formatMonthDay(session.startsAt)} ${formatWeekdayFull(session.startsAt)} ${formatTimeOfDay(session.startsAt)}`;
  const fee = session.feeLabelOverride ?? feeLabel(session.fee);
  const description = [
    `${book}(${session.author}) 함께 읽는 북토크 · ${when} · ${session.venue.name}.`,
    session.leadQuestion ? `대표 발제: ${session.leadQuestion}` : "",
    `참여비 ${fee}.`,
  ]
    .filter(Boolean)
    .join(" ");
  return buildMetadata({
    title,
    description: description.length > 155 ? `${description.slice(0, 154)}…` : description,
    path: `/bookclub/${session.slug}`,
    type: "event",
    keywords: [
      session.bookTitle,
      session.author,
      `${session.bookTitle} 독서모임`,
      `${session.bookTitle} 발제`,
      "강남 독서모임",
      "서초 북클럽",
    ],
    ogSub: `${when} · ${session.venue.name} · 참여비 ${fee}`,
    image: absoluteCoverUrl(session.coverUrl) ?? undefined,
  });
}

export default async function BookClubDetailPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const session = getSession(slug);
  if (!session) notFound();

  // 한 번의 병렬 조회로 전부 처리 — Supabase 미연결 시 세션당 순차 DNS 실패 지연이
  // 누적되지 않게 한다.
  const allCounts = await getReservedCounts(BOOKCLUB_SESSIONS.map((s) => s.slug));
  const allSessions = BOOKCLUB_SESSIONS.map((s) => ({ ...s, reserved: allCounts[s.slug] ?? 0 }));
  const resolved = allSessions.find((s) => s.slug === slug)!;
  const status = getStatus(resolved);

  const crumbLd = breadcrumbSchema([
    { name: "홈", href: "/" },
    { name: "북클럽", href: "/bookclub" },
    { name: session.title, href: `/bookclub/${slug}` },
  ]);
  const eventLd = bookclubSessionEventSchema(resolved);
  const questionsLd = discussionQuestionsSchema({
    slug: resolved.slug,
    bookTitle: resolved.bookTitle,
    author: resolved.author,
    questions: resolved.agendaPreview,
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <JsonLd data={questionsLd ? [crumbLd, eventLd, questionsLd] : [crumbLd, eventLd]} />
      <Header />
      <Suspense fallback={<div className="qc-skel" style={{ height: 480 }} />}>
        <DetailClient session={resolved} status={status} allSessions={allSessions} />
      </Suspense>
      <Footer />
    </div>
  );
}
