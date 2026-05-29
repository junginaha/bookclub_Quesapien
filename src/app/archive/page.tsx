import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import ArchiveClient from "./ArchiveClient";
import { getReviews } from "@/lib/supabase/queries";

export const revalidate = 60;

export default async function ArchivePage() {
  let reviews: Awaited<ReturnType<typeof getReviews>> = [];
  try { reviews = await getReviews(60); } catch { /* use empty */ }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ArchiveClient initialReviews={reviews} />
      </main>
      <Footer />
    </div>
  );
}
