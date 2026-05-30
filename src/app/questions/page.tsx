import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import QuestionsClient from "./QuestionsClient";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "질문",
  description: "오늘의 질문, 인기 질문, 최근 질문을 발견하고 당신만의 질문을 남겨보세요.",
};

export const revalidate = 60;

export default async function QuestionsPage() {
  let todayQuestion = null;
  let featuredQuestions: unknown[] = [];
  let recentQuestions: unknown[] = [];

  try {
    const supabase = await createClient();

    const [todayRes, featuredRes, recentRes] = await Promise.all([
      supabase.from("landing_questions").select("*").eq("is_today", true).limit(1).single(),
      supabase.from("landing_questions").select("*").eq("is_featured", true).eq("is_approved", true).order("likes", { ascending: false }).limit(5),
      supabase.from("landing_questions").select("*").eq("is_approved", true).order("created_at", { ascending: false }).limit(12),
    ]);

    todayQuestion = todayRes.data;
    featuredQuestions = featuredRes.data ?? [];
    recentQuestions = recentRes.data ?? [];
  } catch {
    // static fallback
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <Header />
      <main style={{ flex: 1, paddingTop: 64 }}>
        <QuestionsClient
          todayQuestion={todayQuestion}
          featuredQuestions={featuredQuestions}
          recentQuestions={recentQuestions}
        />
      </main>
      <Footer />
    </div>
  );
}
