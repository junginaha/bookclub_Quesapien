"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, LogOut, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import type { ProfileRow, ReviewRow, SessionRow } from "@/lib/supabase/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type SessionWithQ = SessionRow & { question?: any };
/* eslint-enable @typescript-eslint/no-explicit-any */

interface Props {
  profile: ProfileRow;
  myReviews: ReviewRow[];
  mySessions: SessionWithQ[];
}

export default function MyPageClient({ profile, myReviews, mySessions }: Props) {
  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <>
      <div className="bg-warm-50 border-b border-warm-100">
        <div className="container-base py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-white ring-offset-2">
                <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.name} />
                <AvatarFallback className="text-xl">{profile.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-serif text-2xl font-bold text-warm-900">{profile.name}</h1>
                <p className="text-warm-500 text-sm mt-0.5">{profile.bio ?? "아직 소개가 없어요."}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">{profile.session_count}번 참여</Badge>
                  <span className="text-xs text-warm-400">{new Date(profile.joined_at).getFullYear()}년부터</span>
                </div>
              </div>
            </div>
            <form action={handleLogout}>
              <Button type="submit" variant="outline" size="sm"
                className="gap-1.5 text-warm-500 border-warm-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50">
                <LogOut className="h-3.5 w-3.5" /> 로그아웃
              </Button>
            </form>
          </div>

          <div className="flex gap-6 mt-8">
            {[
              { value: String(profile.session_count), label: "참여 모임" },
              { value: String(myReviews.length), label: "작성 후기" },
              { value: String(mySessions.filter((s) => s.status === "upcoming").length), label: "예정 모임" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col">
                <span className="font-serif text-2xl font-bold text-warm-900">{s.value}</span>
                <span className="text-xs text-warm-400 mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-base py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section>
          <h2 className="font-serif text-xl font-bold text-warm-900 mb-5 flex items-center gap-2">
            <Calendar className="h-5 w-5" />내 모임
          </h2>
          {mySessions.length === 0 ? (
            <div className="text-center py-10 text-warm-400 text-sm rounded-2xl border border-warm-100 bg-warm-50">
              <p>아직 참여한 모임이 없어요.</p>
              <Link href="/questions/create" className="mt-3 inline-block">
                <Button size="sm" variant="outline">첫 모임 만들기</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {mySessions.map((s) => (
                <div key={s.id} className="card-base p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      s.status === "live" ? "bg-red-100 text-red-600" :
                      s.status === "upcoming" ? "bg-emerald-100 text-emerald-700" : "bg-warm-100 text-warm-500"
                    }`}>
                      {s.status === "live" ? "진행 중" : s.status === "upcoming" ? "예정" : "종료"}
                    </span>
                    <span className="text-xs text-warm-400">{s.date}</span>
                  </div>
                  {s.question && (
                    <Link href={`/questions/${s.question.id}`}
                      className="font-serif text-sm font-semibold text-warm-900 hover:text-warm-600 line-clamp-2">
                      &ldquo;{s.question.title}&rdquo;
                    </Link>
                  )}
                  <div className="flex items-center gap-3 text-xs text-warm-500">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{s.start_time} – {s.end_time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-warm-900 mb-5 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />내 후기
          </h2>
          {myReviews.length === 0 ? (
            <div className="text-center py-10 text-warm-400 text-sm rounded-2xl border border-warm-100 bg-warm-50">
              <p>아직 작성한 후기가 없어요.</p>
              <p className="mt-1 text-xs">모임 후 느낀 점을 기록해보세요.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {myReviews.map((r) => (
                <div key={r.id} className="card-base p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-warm-400">{formatDate(r.created_at)}</span>
                    <span className="text-xs text-warm-400">♥ {r.likes}</span>
                  </div>
                  {r.quote && (
                    <p className="font-serif text-sm italic text-warm-700 border-l-2 border-warm-300 pl-2">&ldquo;{r.quote}&rdquo;</p>
                  )}
                  <p className="text-xs text-warm-500 line-clamp-3">{r.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
