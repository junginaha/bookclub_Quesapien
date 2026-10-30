import type { Metadata } from "next";
import { activeGuides } from "@/content/ai-guides";
import { CLUB } from "@/content/club-facts";
import { breadcrumbSchema } from "@/lib/schema";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import "@/components/home/v3/home-v3.css";
import "./guide.css";

export const metadata: Metadata = {
  title: "서울 북클럽 참여 안내 — 처음 오시는 분께",
  description: `혼자 가도 편안한 서울 북클럽, ${CLUB.brand}(${CLUB.brandAlt[0]})의 참여 안내 모음입니다.`,
  alternates: { canonical: `${CLUB.siteUrl}/guide`, types: { "text/plain": `${CLUB.siteUrl}/llms.txt` } },
  openGraph: {
    title: "서울 북클럽 참여 안내 — 처음 오시는 분께",
    description: `혼자 가도 편안한 서울 북클럽, ${CLUB.brand}의 참여 안내 모음입니다.`,
    url: `${CLUB.siteUrl}/guide`,
    siteName: CLUB.brand,
    locale: "ko_KR",
    type: "website",
    images: [{ url: `${CLUB.siteUrl}/og?title=${encodeURIComponent("처음 오시는 분께")}&sub=${encodeURIComponent("혼자 가도 편안한 서울 북클럽 참여 안내")}`, width: 1200, height: 630, alt: "서울 북클럽 참여 안내 — 처음 오시는 분께" }],
  },
  twitter: { card: "summary_large_image", title: "서울 북클럽 참여 안내 — 처음 오시는 분께", description: `혼자 가도 편안한 서울 북클럽, ${CLUB.brand}의 참여 안내 모음입니다.` },
};

export default function GuideHub() {
  const guides = activeGuides();
  return (
    <div className="qv3">
      <Header />
      <main className="qv3-guide">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema([{ name: "홈", href: "/" }, { name: "처음 오시는 분께", href: "/guide" }])]) }} />
        <span className="qv3-guide-eyebrow">GUIDE</span>
        <h1>처음 오시는 분께</h1>
        <p className="qv3-guide-lead">
          {CLUB.brand}는 {CLUB.city}에서 운영하는, 혼자 가도 편안한 북클럽입니다.{" "}
          {CLUB.format}입니다.
        </p>
        <p className="qv3-guide-say">궁금한 것부터 골라 읽어보세요.</p>

        <ul className="qv3-guide-list">
          {guides.map((g) => (
            <li key={g.slug}>
              <a href={`/guide/${g.slug}`}>{g.title}</a>
            </li>
          ))}
        </ul>

        <div className="qv3-guide-next">
          <h2>바로 보기</h2>
          <p>일정과 장소를 확인하고 예약할 수 있습니다.</p>
          <a className="qv3-guide-cta" href="/bookclub">열리는 북클럽 보기</a>
        </div>

        <p className="qv3-guide-verified">정보 확인일: {CLUB.lastVerified}</p>
      </main>
      <Footer />
    </div>
  );
}
