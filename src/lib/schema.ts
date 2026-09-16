/**
 * Schema.org JSON-LD generators
 * Used for AEO/GEO (AI Engine / Generative Engine Optimization)
 * Structured data helps AI crawlers understand page context.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.qsapiens.com";
const ORG_NAME = "질문하는 사람들";

// ─── Organization ─────────────────────────────────────────────
export function orgSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: ORG_NAME,
    alternateName: "Qsapiens",
    url: SITE_URL,
    description:
      "질문하는 사람들은 질문을 중심으로 사람과 책을 연결하는 오프라인 북토크 커뮤니티입니다. 서초구 선정 미래혁신형 북클럽.",
    foundingDate: "2025",
    areaServed: { "@type": "Country", name: "대한민국" },
    sameAs: [],
    knowsAbout: ["독서모임", "북클럽", "질문 기반 대화", "지적 커뮤니티"],
  };
}

// ─── WebSite ──────────────────────────────────────────────────
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "질문하는 사람들",
    description: "질문 → 책 → 대화 → 사람 → 성장으로 이어지는 지적 커뮤니티",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/questions?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

// ─── BreadcrumbList ───────────────────────────────────────────
export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}

// ─── Event (북클럽 세션) ────────────────────────────────────────
// 구 bookTalkEventSchema(BookClubRecord 전용, startDate/endDate 누락 + 아무 곳에서도
// 호출되지 않던 죽은 코드)를 대체. lib/bookclub/types.ts의 BookClubSession 기준.
interface SessionSchemaInput {
  slug: string;
  title: string;
  summary: string;
  startsAt: string;
  endsAt: string;
  venue: { name: string; address: string; lat: number; lng: number };
  capacity: number;
  reserved: number;
}

export function bookclubSessionEventSchema(session: SessionSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${SITE_URL}/bookclub/${session.slug}#event`,
    name: session.title,
    description: session.summary,
    url: `${SITE_URL}/bookclub/${session.slug}`,
    startDate: session.startsAt,
    endDate: session.endsAt,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: session.venue.name,
      address: { "@type": "PostalAddress", streetAddress: session.venue.address, addressCountry: "KR" },
      geo: { "@type": "GeoCoordinates", latitude: session.venue.lat, longitude: session.venue.lng },
    },
    organizer: { "@id": `${SITE_URL}/#organization` },
    maximumAttendeeCapacity: session.capacity,
    remainingAttendeeCapacity: Math.max(0, session.capacity - session.reserved),
    inLanguage: "ko",
  };
}

export function bookclubItemListSchema(sessions: { slug: string; title: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/bookclub#itemlist`,
    itemListElement: sessions.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/bookclub/${s.slug}`,
      name: s.title,
    })),
  };
}

// ─── AggregateRating / Review ──────────────────────────────────
interface ReviewInput {
  id: string;
  author_name: string;
  content: string;
  rating?: number;
  created_at: string;
}

export function reviewsSchema(targetSlug: string, targetName: string, reviews: ReviewInput[]) {
  if (!reviews.length) return null;
  const avgRating = reviews.reduce((s, r) => s + (r.rating ?? 5), 0) / reviews.length;
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/bookclub/${targetSlug}#business`,
    name: targetName,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      reviewCount: reviews.length,
      bestRating: "5",
      worstRating: "1",
    },
    review: reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author_name },
      reviewBody: r.content,
      reviewRating: { "@type": "Rating", ratingValue: r.rating ?? 5 },
      datePublished: r.created_at,
    })),
  };
}

// ─── Person (Leader / Thinker) ────────────────────────────────
interface PersonSchemaInput {
  slug: string;
  name: string;
  name_en: string;
  birth_year: number;
  death_year?: number;
  nationality: string;
  tagline: string;
  core_idea: string;
  key_works: string[];
  category: string;
}

export function personSchema(person: PersonSchemaInput) {
  const typeMap: Record<string, string> = {
    philosopher: "Person",
    author: "Person",
    scientist: "Person",
    thinker: "Person",
    entrepreneur: "Person",
  };
  return {
    "@context": "https://schema.org",
    "@type": typeMap[person.category] ?? "Person",
    "@id": `${SITE_URL}/giants/${person.slug}#person`,
    name: person.name,
    alternateName: person.name_en,
    birthDate: String(person.birth_year),
    deathDate: person.death_year ? String(person.death_year) : undefined,
    nationality: person.nationality,
    description: person.core_idea,
    knowsAbout: person.key_works,
    sameAs: [],
    mainEntityOfPage: `${SITE_URL}/giants/${person.slug}`,
  };
}

// ─── FAQPage (Questions) ──────────────────────────────────────
export function faqSchema(questions: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
}

// ─── CollectionPage (Question list) ──────────────────────────
export function questionCollectionSchema(questions: { content: string; author_name: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/questions#collection`,
    name: "질문 아카이브 — 질문하는 사람들",
    description: "질문하는 사람들 커뮤니티의 인기 질문과 오늘의 질문 모음",
    url: `${SITE_URL}/questions`,
    hasPart: questions.slice(0, 10).map((q) => ({
      "@type": "Question",
      name: q.content,
      author: { "@type": "Person", name: q.author_name },
    })),
  };
}

// JsonLd component is in src/components/seo/JsonLd.tsx
