import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 관리자 확인 (이메일 기반)
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "junginaha@gmail.com").split(",");
  if (!ADMIN_EMAILS.includes(user.email ?? "")) redirect("/");

  // 관리자 데이터 로드
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [
    { data: profiles },
    { data: questions },
    { data: sessions },
    { data: reviews },
  ] = await Promise.all([
    db.from("profiles").select("*").order("joined_at", { ascending: false }),
    db.from("questions").select("*, author:profiles(name,email)").order("created_at", { ascending: false }),
    db.from("sessions").select("*, question:questions(title), host:profiles(name)").order("created_at", { ascending: false }),
    db.from("reviews").select("*, author:profiles(name)").order("created_at", { ascending: false }),
  ]);

  return (
    <AdminClient
      profiles={profiles ?? []}
      questions={questions ?? []}
      sessions={sessions ?? []}
      reviews={reviews ?? []}
      adminEmail={user.email ?? ""}
    />
  );
}
