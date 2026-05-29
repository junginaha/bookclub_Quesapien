import Link from "next/link";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { getQuestions } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { PenLine, Users, BookOpen } from "lucide-react";
import { formatDate, getCategoryColor } from "@/lib/utils";

export const revalidate = 30;

/* eslint-disable @typescript-eslint/no-explicit-any */
type Q = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export default async function QuestionsPage() {
  let questions: Q[] = [];
  try { questions = await getQuestions(40); } catch { /* empty */ }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-warm-50 border-b border-warm-100">
          <div className="container-base py-12 sm:py-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-warm-400 uppercase tracking-widest mb-2">질문 목록</p>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-warm-900 mb-2">모든 발제 질문</h1>
              <p className="text-warm-500 text-sm">사람들이 던진 질문들이 모여 있습니다.</p>
            </div>
            <Link href="/questions/create">
              <Button className="gap-2 shrink-0"><PenLine className="h-4 w-4" />새 발제 만들기</Button>
            </Link>
          </div>
        </div>

        <div className="container-base py-10 sm:py-14">
          {questions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-warm-400 text-sm mb-4">아직 등록된 질문이 없습니다.</p>
              <Link href="/questions/create"><Button variant="outline">첫 발제 만들기</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map((q: Q) => {
                const author = Array.isArray(q.author) ? q.author[0] : q.author;
                return (
                  <Link key={q.id} href={`/questions/${q.id}`} className="card-base p-6 flex flex-col gap-3 group">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`tag-base ${getCategoryColor(q.category)}`}>{q.category}</span>
                      {(q.tags ?? []).slice(0, 2).map((tag: string) => (
                        <span key={tag} className="tag-base bg-warm-50 text-warm-500">#{tag}</span>
                      ))}
                    </div>
                    <h2 className="font-serif text-lg font-bold text-warm-900 group-hover:text-warm-600 transition-colors leading-snug line-clamp-2">
                      &ldquo;{q.title}&rdquo;
                    </h2>
                    {q.description && (
                      <p className="text-sm text-warm-500 line-clamp-2 leading-relaxed">{q.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-warm-50">
                      <span className="text-xs text-warm-400">{author?.name ?? "익명"} · {formatDate(q.created_at)}</span>
                      <div className="flex items-center gap-3 text-xs text-warm-400">
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{q.session_count}회</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{q.participant_total}명</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
