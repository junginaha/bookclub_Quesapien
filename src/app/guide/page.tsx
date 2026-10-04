import type { Metadata } from "next";
import { activeGuides } from "@/content/ai-guides";
import { CLUB } from "@/content/club-facts";
import { orgJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: `서울 40대 이상 북클럽 안내 | ${CLUB.brand}`,
  description: `혼자 가도 편안한 서울 북클럽, ${CLUB.brand}(${CLUB.brandAlt[0]})의 참여 안내 모음입니다.`,
  alternates: { canonical: `${CLUB.siteUrl}/guide` },
};

export default function GuideHub() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 64px", lineHeight: 1.8, wordBreak: "keep-all" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd()) }} />
      <h1 style={{ fontSize: 28 }}>서울 40대 이상 북클럽 안내</h1>
      <p>{CLUB.brand}는 {CLUB.city}에서 {CLUB.ageFocus}이 중심이 되어 운영하는, 혼자 가도 편안한 북클럽입니다.</p>
      <ul>
        {activeGuides().map((g) => (
          <li key={g.slug}><a href={`/guide/${g.slug}`}>{g.title}</a></li>
        ))}
      </ul>
    </main>
  );
}
