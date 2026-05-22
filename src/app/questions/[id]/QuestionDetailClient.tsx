"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SessionJoinButton from "@/components/sessions/SessionJoinButton";
import ReviewForm from "@/components/reviews/ReviewForm";
import LikeButton from "@/components/reviews/LikeButton";
import { MapPin, Clock, Users, ArrowLeft, BookOpen, MessageSquare } from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  getCategoryColor, formatDate, formatSessionDate,
  getParticipantRatio, getStatusLabel, getStatusColor,
} from "@/lib/utils";
import type { Question } from "@/types";

interface Props {
  questionId: string;
  seedQuestion: Question | null;
}

export default function QuestionDetailClient({ questionId, seedQuestion }: Props) {
  const storeQ    = useAppStore((s) => s.getQuestion(questionId));
  const storeSessions = useAppStore((s) => s.getSessionsByQuestion(questionId));
  const storeReviews  = useAppStore((s) => s.getReviewsByQuestion(questionId));
  const currentUser   = useAppStore((s) => s.currentUser);

  // 스토어 질문 우선, 없으면 seed
  const question = storeQ ?? (seedQuestion ? {
    id: seedQuestion.id,
    title: seedQuestion.title,
    description: seedQuestion.description,
    category: seedQuestion.category,
    tags: seedQuestion.tags,
    author_id: seedQuestion.author.id,
    author_name: seedQuestion.author.name,
    author_avatar: seedQuestion.author.avatar_url ?? undefined,
    created_at: seedQuestion.created_at,
    session_count: seedQuestion.session_count,
    participant_total: seedQuestion.participant_total,
    is_featured: !!seedQuestion.is_featured,
  } : null);

  if (!question) {
    return (
      <div className="container-base py-20 text-center">
        <p className="text-warm-400">질문을 찾을 수 없습니다.</p>
        <Link href="/" className="mt-4 inline-block"><Button variant="outline">홈으로</Button></Link>
      </div>
    );
  }

  return (
    <div className="container-base py-8 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-warm-400 hover:text-warm-800 transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" />홈으로
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 좌측 본문 */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`tag-base ${getCategoryColor(question.category)}`}>{question.category}</span>
              {question.tags.map((tag) => (
                <span key={tag} className="tag-base bg-warm-50 text-warm-500">#{tag}</span>
              ))}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-warm-900 leading-tight">
              &ldquo;{question.title}&rdquo;
            </h1>
            <p className="text-warm-500 text-base leading-relaxed">{question.description}</p>

            <div className="flex items-center gap-3 pt-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={question.author_avatar} alt={question.author_name} />
                <AvatarFallback>{question.author_name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-warm-800">{question.author_name}</p>
                <p className="text-xs text-warm-400">{formatDate(question.created_at)} 발제</p>
              </div>
              <Separator orientation="vertical" className="h-8 mx-2" />
              <div className="flex items-center gap-4 text-xs text-warm-500">
                <div className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /><span>{question.session_count}회 진행</span></div>
                <div className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /><span>{question.participant_total}명 참여</span></div>
              </div>
            </div>
          </div>

          {/* 토론 질문 */}
          {storeSessions.length > 0 && storeSessions[0].discussion_questions && (
            <div className="rounded-2xl border border-warm-100 bg-warm-50 p-6">
              <h2 className="font-serif text-lg font-semibold text-warm-900 mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />토론 질문
              </h2>
              <div className="flex flex-col gap-4">
                {storeSessions[0].discussion_questions.map((q, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="font-serif text-2xl font-bold text-warm-200 shrink-0 leading-none">{String(i + 1).padStart(2, "0")}</span>
                    <p className="text-warm-700 leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 후기 작성 */}
          {currentUser && storeSessions.length > 0 && (
            <ReviewForm sessionId={storeSessions[0].id} />
          )}
          {!currentUser && (
            <div className="rounded-2xl border border-dashed border-warm-200 p-6 text-center">
              <p className="text-warm-400 text-sm mb-3">로그인 후 후기를 남길 수 있어요.</p>
              <Link href="/login"><Button variant="outline" size="sm">로그인하기</Button></Link>
            </div>
          )}

          {/* 후기 목록 */}
          {storeReviews.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-xl font-semibold text-warm-900">참여자 후기 ({storeReviews.length})</h2>
              <div className="flex flex-col gap-4">
                {storeReviews.map((review) => (
                  <div key={review.id} className="rounded-2xl bg-white border border-warm-100 p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={review.author_avatar} alt={review.author_name} />
                          <AvatarFallback>{review.author_name[0]}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium text-warm-800">{review.author_name}</p>
                        <span className="text-xs text-warm-300">{formatDate(review.created_at)}</span>
                      </div>
                      <LikeButton reviewId={review.id} likes={review.likes} />
                    </div>
                    {review.quote && (
                      <blockquote className="font-serif text-base font-medium text-warm-800 border-l-2 border-warm-200 pl-3 italic leading-relaxed">
                        &ldquo;{review.quote}&rdquo;
                      </blockquote>
                    )}
                    <p className="text-sm text-warm-500 leading-relaxed">{review.content}</p>
                    {review.transformation && (
                      <div className="rounded-xl bg-warm-50 border border-warm-100 p-3">
                        <p className="text-[11px] text-warm-400 uppercase tracking-wide font-semibold mb-0.5">생각 변화</p>
                        <p className="text-xs text-warm-600 leading-relaxed">{review.transformation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 우측 사이드바 */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-warm-900">예정된 모임</h2>
            {!currentUser && (
              <Link href="/login" className="text-xs text-warm-400 hover:text-warm-700 transition-colors">로그인 후 참여</Link>
            )}
          </div>

          {storeSessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-warm-200 p-8 text-center">
              <p className="text-warm-400 text-sm mb-4">아직 예정된 모임이 없어요.</p>
              <Link href="/questions/create"><Button variant="outline" size="sm">모임 만들기</Button></Link>
            </div>
          ) : (
            storeSessions.map((session) => {
              const ratio = getParticipantRatio(session.current_participants, session.max_participants);
              return (
                <div key={session.id} className="card-base p-5 flex flex-col gap-4">
                  <div className={`inline-flex self-start items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(session.status)}`}>
                    {session.status === "live" && <span className="live-dot mr-1.5" />}
                    {getStatusLabel(session.status)}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs text-warm-500">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatSessionDate(session.date)} {session.start_time}–{session.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-warm-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0" /><span>{session.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-warm-500">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>{session.current_participants}/{session.max_participants}명</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-warm-100 overflow-hidden">
                    <div className={`h-full rounded-full ${ratio >= 90 ? "bg-red-400" : "bg-emerald-400"}`} style={{ width: `${Math.min(ratio, 100)}%` }} />
                  </div>
                  <SessionJoinButton
                    sessionId={session.id}
                    isFull={session.current_participants >= session.max_participants}
                    isClosed={session.status === "closed"}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
