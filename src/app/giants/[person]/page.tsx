import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import GiantDetailClient from "./GiantDetailClient";
import { GIANTS } from "@/data/giants";
import { personSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/seo/JsonLd";

interface Props { params: Promise<{ person: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { person } = await params;
  const giant = GIANTS.find((g) => g.slug === person);
  if (!giant) return { title: "거인의 어깨" };

  return buildMetadata({
    title: `${giant.name} (${giant.name_en}) — 거인의 어깨`,
    description: `${giant.name}의 핵심 사상과 AI 대화. ${giant.tagline} 대표 저서: ${giant.key_works.slice(0, 2).join(", ")}.`,
    path: `/giants/${giant.slug}`,
    type: "profile",
    keywords: [giant.name, giant.name_en, ...giant.key_works, giant.nationality, "철학", "AI대화"],
    author: giant.name,
  });
}

export default async function GiantDetailPage({ params }: Props) {
  const { person } = await params;
  const giant = GIANTS.find((g) => g.slug === person);
  if (!giant) notFound();

  // Stage 1: Person + FAQ + Breadcrumb JSON-LD
  const personLd = personSchema(giant);
  const faqLd = faqSchema(
    giant.related_questions.map((q) => ({
      question: q,
      answer: `${giant.name}의 관점에서 이 질문을 탐구할 수 있습니다. 대표 저서 ${giant.key_works[0]}를 참고하세요.`,
    }))
  );
  const crumbLd = breadcrumbSchema([
    { name: "홈", href: "/" },
    { name: "거인의 어깨", href: "/giants" },
    { name: giant.name, href: `/giants/${giant.slug}` },
  ]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Stage 1: Structured data */}
      <JsonLd data={personLd} />
      <JsonLd data={faqLd} />
      <JsonLd data={crumbLd} />

      <Header />
      <GiantDetailClient giant={giant} />
      <Footer />
    </div>
  );
}
