import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "junginaha@gmail.com,kimjungin@quesapience.com").split(",");
  if (!ADMIN_EMAILS.includes(user.email ?? "")) redirect("/");

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const db = supabase as any;

  const [
    { data: profiles },
    { data: questions },
    { data: sessions },
    { data: reviews },
    { data: applications },
    { data: pendingQuestions },
    { data: allLandingQuestions },
  ] = await Promise.all([
    db.from("profiles").select("*").order("joined_at", { ascending: false }),
    db.from("questions").select("*, author:profiles(name,email)").order("created_at", { ascending: false }),
    db.from("sessions").select("*, question:questions(title), host:profiles(name)").order("created_at", { ascending: false }),
    db.from("reviews").select("*, author:profiles(name)").order("created_at", { ascending: false }),
    db.from("bookclub_applications").select("*").order("created_at", { ascending: false }).then(
      (r: any) => r,
      () => ({ data: [] })
    ),
    // 미승인 질문
    db.from("landing_questions").select("*").eq("is_approved", false).order("created_at", { ascending: false }),
    // 전체 랜딩 질문
    db.from("landing_questions").select("*").order("created_at", { ascending: false }).limit(200),
  ]);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <AdminClient
      profiles={profiles ?? []}
      questions={questions ?? []}
      sessions={sessions ?? []}
      reviews={reviews ?? []}
      applications={applications ?? []}
      landingQuestions={pendingQuestions ?? []}
      allLandingQuestions={allLandingQuestions ?? []}
      adminEmail={user.email ?? ""}
    />
  );
}
