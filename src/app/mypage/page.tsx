import { redirect } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import MyPageClient from "./MyPageClient";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getMyReviews, getMySessions } from "@/lib/supabase/queries";

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile, myReviews, mySessions] = await Promise.all([
    getProfile(user.id),
    getMyReviews(user.id).catch(() => []),
    getMySessions(user.id).catch(() => []),
  ]);

  if (!profile) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <MyPageClient profile={profile} myReviews={myReviews} mySessions={mySessions} />
      </main>
      <Footer />
    </div>
  );
}
