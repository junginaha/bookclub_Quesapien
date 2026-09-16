import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { BOOKCLUB_SESSIONS, getSession } from "@/lib/bookclub/data";
import { getStatus, isPast } from "@/lib/bookclub/selectors";
import { getReservedCounts } from "@/lib/bookclub/server";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbSchema } from "@/lib/schema";
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
  return buildMetadata({
    title: session.title,
    description: session.leadQuestion || session.summary.split("\n")[0],
    path: `/bookclub/${session.slug}`,
    type: "event",
    image: session.coverUrl || undefined,
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
  const resolved = { ...session, reserved: allCounts[slug] ?? 0 };
  const status = getStatus(resolved);

  const nextSessions = BOOKCLUB_SESSIONS.filter((s) => s.slug !== slug)
    .map((s) => ({ ...s, reserved: allCounts[s.slug] ?? 0 }))
    .filter((s) => !isPast(s))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 3)
    .map((s) => ({ session: s, status: getStatus(s) }));

  const crumbLd = breadcrumbSchema([
    { name: "홈", href: "/" },
    { name: "북클럽", href: "/bookclub" },
    { name: session.title, href: `/bookclub/${slug}` },
  ]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <JsonLd data={crumbLd} />
      <Header />
      <DetailClient session={resolved} status={status} nextSessions={nextSessions} />
      <Footer />
    </div>
  );
}
