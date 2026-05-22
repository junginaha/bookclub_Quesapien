"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, MessageSquare, Heart, LogOut, MapPin } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatDate, formatSessionDate, getCategoryColor } from "@/lib/utils";
import LikeButton from "@/components/reviews/LikeButton";

export default function MyPage() {
  const router      = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const logout      = useAppStore((s) => s.logout);
  const myReviews   = useAppStore((s) => s.getMyReviews());
  const mySessions  = useAppStore((s) => s.getMySessions());
  const questions   = useAppStore((s) => s.questions);

  useEffect(() => {
    if (!currentUser) router.push("/login");
  }, [currentUser, router]);

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* 프로필 헤더 */}
        <div className="bg-warm-50 border-b border-warm-100">
          <div className="container-base py-10 sm:py-14">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-white ring-offset-2">
                  <AvatarImage src={currentUser.avatar_url} alt={currentUser.name} />
                  <AvatarFallback className="text-xl">{currentUser.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-serif text-2xl font-bold text-warm-900">{currentUser.name}</h1>
                  <p className="text-warm-500 text-sm mt-0.5">{currentUser.bio ?? "아직 소개가 없어요."}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">{currentUser.session_count}번 참여</Badge>
                    <span className="text-xs text-warm-400">{new Date(currentUser.joined_at).getFullYear()}년부터</span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-warm-500 border-warm-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />로그아웃
              </Button>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-warm-200">
              {[
                { icon: Calendar,      value: currentUser.session_count, label: "참여한 모임" },
                { icon: MessageSquare, value: myReviews.length,          label: "작성한 후기" },
                { icon: BookOpen,      value: mySessions.length,         label: "예약된 모임" },
                { icon: Heart,         value: myReviews.reduce((a, r) => a + r.likes, 0), label: "받은 공감" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center sm:items-start gap-1 sm:flex-row sm:gap-3">
                  <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-warm-200 shrink-0">
                    <stat.icon className="h-4 w-4 text-warm-600" />
                  </div>
                  <div>
                    <p className="font-serif text-2xl font-bold text-warm-900">{stat.value}</p>
                    <p className="text-xs text-warm-400">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container-base py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 참여한 모임 */}
            <div>
              <h2 className="section-title mb-6">참여한 모임</h2>
              {mySessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-warm-200 p-8 text-center">
                  <p className="text-warm-400 text-sm mb-4">아직 참여한 모임이 없어요.</p>
                  <Link href="/"><Button variant="outline" size="sm">모임 찾기</Button></Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {mySessions.map((session) => {
                    const q = questions.find((qq) => qq.id === session.question_id);
                    return (
                      <Link key={session.id} href={q ? `/questions/${q.id}` : "#"}>
                        <div className="flex items-start gap-4 p-4 rounded-2xl border border-warm-100 bg-white hover:bg-warm-50 transition-colors">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warm-100">
                            <BookOpen className="h-5 w-5 text-warm-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-serif font-semibold text-warm-900 truncate">
                              &ldquo;{q?.title ?? "질문"}&rdquo;
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <MapPin className="h-3 w-3 text-warm-400" />
                              <p className="text-xs text-warm-400">{session.location} · {formatSessionDate(session.date)}</p>
                            </div>
                          </div>
                          {q && (
                            <span className={`tag-base ${getCategoryColor(q.category)} shrink-0`}>{q.category}</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 내 후기 */}
            <div>
              <h2 className="section-title mb-6">내가 쓴 후기</h2>
              {myReviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-warm-200 p-8 text-center">
                  <p className="text-warm-400 text-sm">아직 후기가 없어요.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {myReviews.map((review) => (
                    <div key={review.id} className="p-5 rounded-2xl border border-warm-100 bg-white">
                      {review.quote && (
                        <blockquote className="font-serif text-sm font-medium text-warm-800 italic border-l-2 border-warm-200 pl-3 mb-2 leading-relaxed">
                          &ldquo;{review.quote}&rdquo;
                        </blockquote>
                      )}
                      <p className="text-sm text-warm-500 leading-relaxed line-clamp-2">{review.content}</p>
                      <div className="flex items-center justify-between mt-3">
                        <LikeButton reviewId={review.id} likes={review.likes} />
                        <span className="text-xs text-warm-300">{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
