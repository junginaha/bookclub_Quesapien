import type { Metadata } from "next";
import LandingPage from "@/components/home/LandingPage";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { createClient } from "@/lib/supabase/server";
import type { LandingQuestion } from "@/components/home/LandingPage";
import { getUpcomingMeetingsFeed } from "@/lib/clubQueries";

export const revalidate = 300; // 5분 캐시

export const metadata: Metadata = buildMetadata({
  title: "질문하는 사람들 — 미래혁신형 북클럽 | 서초구 선정",
  description:
    "좋은 질문은 좋은 사람을 데려옵니다. 질문하는 사람들은 질문·책·대화로 사람을 연결하는 서초구 선정 미래혁신형 오프라인 북클럽입니다. 위치 기반 내 근처 북클럽 참여, 오늘의 질문, 거인의 어깨 발제 생성기.",
  path: "/",
  type: "website",
  keywords: [
    "질문하는사람들", "Qsapiens", "서초구북클럽",
    "미래혁신형북클럽", "오프라인독서모임", "북토크",
    "독서질문", "지적커뮤니티", "북클럽서울", "내근처북클럽",
    "독서모임참여", "거인의어깨", "오늘의질문",
  ],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jilmunhaneun-saramdeul.vercel.app";

const landingSchema = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "질문하는 사람들",
    alternateName: "Qsapiens",
    description: "질문을 중심으로 책과 사람을 연결하는 서초구 선정 미래혁신형 북클럽",
    inLanguage: "ko",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/questions?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "질문하는 사람들 — Qsapiens",
    url: SITE_URL,
    logo: `${SITE_URL}/og-default.png`,
    description: "서초구 선정 미래혁신형 북클럽. 질문 → 책 → 대화 → 사람 → 성장.",
    foundingDate: "2025",
    areaServed: { "@type": "City", name: "서울특별시" },
    sameAs: [],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#homepage`,
    url: SITE_URL,
    name: "질문하는 사람들 — 미래혁신형 북클럽",
    description: "좋은 질문은 좋은 사람을 데려옵니다. 질문·책·대화로 사람을 연결하는 지적 커뮤니티.",
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "ko",
    about: [
      { "@type": "Thing", name: "독서모임" },
      { "@type": "Thing", name: "북클럽" },
      { "@type": "Thing", name: "질문 기반 대화" },
      { "@type": "Thing", name: "지적 커뮤니티" },
    ],
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".lp-h-display", ".lp-lede", ".lp-q-text", ".lp-q-feature"],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "질문하는 사람들 북클럽은 어떤 곳인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "질문하는 사람들은 서초구 선정 미래혁신형 북클럽입니다. 좋은 질문 하나로 사람과 책을 연결하며, 오프라인 북토크와 온라인 아카이빙을 통해 지적 커뮤니티를 만들어갑니다.",
        },
      },
      {
        "@type": "Question",
        name: "내 근처 북클럽에 참여하려면 어떻게 하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "홈페이지에서 '내 근처 북클럽' 버튼을 클릭하고 위치를 허용하면 가장 가까운 모임을 찾아드립니다. 또는 /bookclub 페이지에서 전체 북클럽 목록을 확인할 수 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "거인의 어깨 서비스는 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "책 제목이나 문장을 입력하면, 위대한 사유자들의 통찰을 빌려 AI가 북클럽 발제 10개를 만들어주는 발제 생성기입니다.",
        },
      },
      {
        "@type": "Question",
        name: "오늘의 질문은 어떻게 선정되나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "매일 아침 멤버 한 분이 마음에 오래 머물던 질문을 선정합니다. 누구나 질문을 제안할 수 있으며, 가장 많은 공감을 받은 질문이 오늘의 질문으로 선정됩니다.",
        },
      },
    ],
  },
];

export default async function HomePage() {
  let todayQuestion: LandingQuestion | null = null;
  let recentQuestions: LandingQuestion[] = [];

  try {
    const supabase = await createClient();
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const sb = supabase as any;
    const [todayRes, recentRes] = await Promise.all([
      sb.from("landing_questions")
        .select("id, content, author_name, likes, saves, answers_count")
        .eq("is_today", true).eq("is_approved", true).limit(1).single(),
      sb.from("landing_questions")
        .select("id, content, author_name, likes, saves, answers_count")
        .eq("is_approved", true).order("likes", { ascending: false }).limit(6),
    ]);
    if (todayRes.data) todayQuestion = todayRes.data as LandingQuestion;
    if (recentRes.data) recentQuestions = recentRes.data as LandingQuestion[];
    /* eslint-enable @typescript-eslint/no-explicit-any */
  } catch {
    // static fallback in LandingPage
  }

  // Qsapiens 2.0 — 홈 = 내 근처 다음 모임 피드(§C1 구조적 귀결①). 신규 clubs/meetings
  // 마이그레이션(010) 적용 전에는 빈 배열로 조용히 폴백한다(기존 홈 동작에 영향 없음).
  const upcomingMeetings = await getUpcomingMeetingsFeed(6).catch(() => []);

  return (
    <>
      <JsonLd data={landingSchema} />
      <LandingPage
        todayQuestion={todayQuestion}
        recentQuestions={recentQuestions}
        upcomingMeetings={upcomingMeetings}
      />
    </>
  );
}
