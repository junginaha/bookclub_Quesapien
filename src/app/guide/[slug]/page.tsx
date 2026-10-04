import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { activeGuides } from "@/content/ai-guides";
import { CLUB } from "@/content/club-facts";
import { guideJsonLd, orgJsonLd } from "@/lib/jsonld";

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
    title: `${g.title} | ${CLUB.brand}`,
    description: g.description,
    alternates: { canonical: url },
    openGraph: { title: g.title, description: g.description, url, locale: "ko_KR", type: "article" },
    robots: { index: true, follow: true },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = activeGuides().find((x) => x.slug === slug);
  if (!g) notFound();
  const others = activeGuides().filter((x) => x.slug !== g.slug);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 64px", lineHeight: 1.8, wordBreak: "keep-all" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([orgJsonLd(), ...guideJsonLd(g)]) }} />
      <article>
        <h1 style={{ fontSize: 28, lineHeight: 1.35, marginBottom: 16 }}>{g.title}</h1>
        <p style={{ fontSize: 18, fontWeight: 500 }}>{g.answer}</p>
        {g.sections.map((s) => (
          <section key={s.h}>
            <h2 style={{ fontSize: 21, marginTop: 32 }}>{s.h}</h2>
            <p>{s.p}</p>
          </section>
        ))}
        <section>
          <h2 style={{ fontSize: 21, marginTop: 32 }}>자주 묻는 질문</h2>
          {g.faqs.map((f) => (
            <div key={f.q} style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 17, margin: 0 }}>{f.q}</h3>
              <p style={{ margin: "4px 0 0" }}>{f.a}</p>
            </div>
          ))}
        </section>
        {CLUB.joinUrl && (
          <p style={{ marginTop: 40 }}>
            <a href={CLUB.joinUrl} style={{ display: "inline-block", padding: "14px 22px", borderRadius: 10, background: "#1E2A47", color: "#fff", textDecoration: "none", fontWeight: 700 }}>
              {CLUB.brand} 참여 안내 보기
            </a>
          </p>
        )}
        <p style={{ marginTop: 24, fontSize: 14, color: "#666" }}>정보 확인일: {CLUB.lastVerified}</p>
      </article>
      <nav aria-label="관련 안내" style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 18 }}>관련 안내</h2>
        <ul>
          {others.map((o) => (
            <li key={o.slug}><a href={`/guide/${o.slug}`}>{o.title}</a></li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
