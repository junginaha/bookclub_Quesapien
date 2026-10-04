import { CLUB } from "@/content/club-facts";
import type { Guide } from "@/content/ai-guides";

export function orgJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: CLUB.brand,
    alternateName: CLUB.brandAlt,
    url: CLUB.siteUrl,
    description: `${CLUB.city}에서 ${CLUB.ageFocus}이 중심이 되어 ${CLUB.format}으로 운영하는 북클럽`,
    areaServed: CLUB.areas?.length ? CLUB.areas.map((a) => `${CLUB.city} ${a}`) : CLUB.city,
    ...(CLUB.sameAs.length ? { sameAs: CLUB.sameAs } : {}),
  };
}

export function guideJsonLd(g: Guide) {
  const url = `${CLUB.siteUrl}/guide/${g.slug}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      url,
      mainEntity: g.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: g.title,
      description: g.description,
      url,
      inLanguage: "ko-KR",
      dateModified: CLUB.lastVerified,
      author: { "@type": "Organization", name: CLUB.brand, url: CLUB.siteUrl },
      publisher: { "@type": "Organization", name: CLUB.brand, url: CLUB.siteUrl },
      about: g.queries,
    },
  ];
}
