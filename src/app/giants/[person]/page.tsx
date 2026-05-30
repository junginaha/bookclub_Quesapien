import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import GiantDetailClient from "./GiantDetailClient";
import { GIANTS } from "../GiantsClient";

interface Props {
  params: Promise<{ person: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { person } = await params;
  const giant = GIANTS.find((g) => g.slug === person);
  if (!giant) return { title: "거인의 어깨" };
  return {
    title: `${giant.name} — 거인의 어깨`,
    description: `${giant.name}의 사상과 AI 대화. ${giant.tagline}`,
  };
}

export default async function GiantDetailPage({ params }: Props) {
  const { person } = await params;
  const giant = GIANTS.find((g) => g.slug === person);
  if (!giant) notFound();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Header />
      <GiantDetailClient giant={giant} />
      <Footer />
    </div>
  );
}
