/**
 * Schema.org JSON-LD generators
 * Used for AEO/GEO (AI Engine / Generative Engine Optimization)
 * Structured data helps AI crawlers understand page context.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.qsapiens.com";
const ORG_NAME = "질문하는 사람들";

// ─── Organization ─────────────────────────────────────────────
// sameAs는 운영자가 확인한 공식 채널만 NEXT_PUBLIC_SAME_AS(콤마 구분)로 넣는다 — 추측 URL 금지.
const SAME_AS = (process.env.NEXT_PUBLIC_SAME_AS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function orgSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: ORG_NAME,
    alternateName: ["Qsapiens", "큐사피엔스", "질문하는 사람들 북클럽"],
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512`,
    image: `${SITE_URL}/og-default.png`,
    email: "junginaha@qsapiens.com",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "junginaha@qsapiens.com",
      availableLanguage: ["Korean"],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "서초구",
      addressRegion: "서울특별시",
      addressCountry: "KR",
    },
    description:
      "질문하는 사람들은 질문을 중심으로 사람과 책을 연결하는 오프라인 북토크 커뮤니티입니다. 서초구 선정 미래혁신형 북클럽.",
    foundingDate: "2025",
    areaServed: { "@type": "Country", name: "대한민국" },
    sameAs: SAME_AS,
    knowsAbout: [
      "독서모임",
      "북클럽",
      "질문 기반 대화",
      "지적 커뮤니티",
      "북토크",
      "발제",
      "독서토론 질문",
      "서초구 독서모임",
      "강남 독서모임",
    ],
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
    alternateName: ["Qsapiens", "큐사피엔스"],
    inLanguage: "ko-KR",
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
  bookTitle: string;
  author: string;
  coverUrl?: string;
  summary: string;
  startsAt: string;
  endsAt: string;
  venue: { name: string; address: string; lat: number; lng: number };
  capacity: number;
  reserved: number;
  fee: number;
  /** "별도 안내" 등 금액 미확정 문구 — 있으면 price/무료 여부를 단정하지 않는다. */
  feeLabelOverride?: string;
  registrationClosed?: boolean;
}

// http(s) 표지는 그대로, 사이트 내부 표지(/images/covers/...)는 절대 URL로 바꾼다.
// 그 외(빈 값 등)는 null → 동적 OG 이미지로 대체.
export function absoluteCoverUrl(url?: string): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  if (url.startsWith("/")) return `${SITE_URL}${url}`;
  return null;
}

export function bookclubSessionEventSchema(session: SessionSchemaInput) {
  const url = `${SITE_URL}/bookclub/${session.slug}`;
  // 신청을 닫은 모임은 좌석 수와 무관하게 남은 자리 0으로 표시(SoldOut과 모순되지 않게).
  const remaining = session.registrationClosed ? 0 : Math.max(0, session.capacity - session.reserved);
  const name = session.title.includes(session.bookTitle)
    ? session.title
    : `${session.title} · 『${session.bookTitle}』`;
  const image =
    absoluteCoverUrl(session.coverUrl) ??
    `${SITE_URL}/og?${new URLSearchParams({ title: session.title }).toString()}`;
  const priceKnown = !session.feeLabelOverride;
  const hasGeo = Number.isFinite(session.venue.lat) && Number.isFinite(session.venue.lng);

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${url}#event`,
    name,
    description: session.summary,
    url,
    image,
    startDate: session.startsAt,
    endDate: session.endsAt,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: session.venue.name,
      address: {
        "@type": "PostalAddress",
        ...(session.venue.address ? { streetAddress: session.venue.address } : {}),
        addressLocality: "서울특별시",
        addressCountry: "KR",
      },
      ...(hasGeo
        ? { geo: { "@type": "GeoCoordinates", latitude: session.venue.lat, longitude: session.venue.lng } }
        : {}),
    },
    about: { "@type": "Book", name: session.bookTitle, author: { "@type": "Person", name: session.author } },
    offers: {
      "@type": "Offer",
      url,
      ...(priceKnown ? { price: session.fee, priceCurrency: "KRW" } : {}),
      availability:
        remaining === 0
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
    },
    ...(priceKnown ? { isAccessibleForFree: session.fee === 0 } : {}),
    organizer: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: ORG_NAME, url: SITE_URL },
    maximumAttendeeCapacity: session.capacity,
    remainingAttendeeCapacity: remaining,
    inLanguage: "ko",
  };
}

// ─── ItemList (발제 질문) ─────────────────────────────────────
interface DiscussionQuestionsInput {
  slug: string;
  bookTitle: string;
  author: string;
  questions: string[];
}

export function discussionQuestionsSchema(input: DiscussionQuestionsInput) {
  if (!input.questions.length) return null;
  const book = { "@type": "Book", name: input.bookTitle, author: { "@type": "Person", name: input.author } };
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/bookclub/${input.slug}#questions`,
    name: `『${input.bookTitle}』 독서모임 발제 질문`,
    itemListElement: input.questions.map((q, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "Question", name: q, about: book },
    })),
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
