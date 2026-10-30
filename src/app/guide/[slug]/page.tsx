import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { activeGuides } from "@/content/ai-guides";
import { CLUB } from "@/content/club-facts";
import { guideJsonLd } from "@/lib/jsonld";
import { breadcrumbSchema } from "@/lib/schema";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import "@/components/home/v3/home-v3.css";
import "../guide.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return activeGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = activeGuides().find((x) => x.slug === slug);
  if (!g) return {};
  const url = `${CLUB.siteUrl}/guide/${g.slug}`;
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: url, types: { "text/plain": `${CLUB.siteUrl}/llms.txt` } },
    openGraph: {
      title: g.title, description: g.description, url, siteName: CLUB.brand, locale: "ko_KR", type: "article",
      images: [{ url: `${CLUB.siteUrl}/og?title=${encodeURIComponent(g.title)}&sub=${encodeURIComponent(g.description.slice(0, 80))}`, width: 1200, height: 630, alt: g.title }],
    },
    twitter: { card: "summary_large_image", title: g.title, description: g.description },
    robots: { index: true, follow: true },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = activeGuides().find((x) => x.slug === slug);
  if (!g) notFound();
  const others = activeGuides().filter((x) => x.slug !== g.slug);

  return (
    <div className="qv3">
      <Header />
      <main className="qv3-guide">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              breadcrumbSchema([
                { name: "홈", href: "/" },
                { name: "처음 오시는 분께", href: "/guide" },
                { name: g.title, href: `/guide/${g.slug}` },
              ]),
              ...guideJsonLd(g),
            ]),
          }}
        />
        <article>
          <span className="qv3-guide-eyebrow">GUIDE</span>
          <h1>{g.title}</h1>
          <p className="qv3-guide-lead">{g.answer}</p>

          {g.sections.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              <p>{s.p}</p>
            </section>
          ))}

          {g.faqs.length > 0 && (
            <section>
              <h2>자주 묻는 질문</h2>
              <div className="qv3-guide-faq">
                {g.faqs.map((f) => (
                  <div key={f.q}>
                    <h3>{f.q}</h3>
                    <p>{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="qv3-guide-next">
            <h2>바로 보기</h2>
            <p>일정과 장소를 확인하고 예약할 수 있습니다.</p>
            <a className="qv3-guide-cta" href="/bookclub">열리는 북클럽 보기</a>
          </div>

          <p className="qv3-guide-verified">정보 확인일: {CLUB.lastVerified}</p>
        </article>

        {others.length > 0 && (
          <nav aria-label="관련 안내" className="qv3-guide-next">
            <h2>이런 것도 궁금하실 거예요</h2>
            <ul className="qv3-guide-list">
              {others.map((o) => (
                <li key={o.slug}>
                  <a href={`/guide/${o.slug}`}>{o.title}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </main>
      <Footer />
    </div>
  );
}
