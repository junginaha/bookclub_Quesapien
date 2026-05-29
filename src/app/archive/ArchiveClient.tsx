"use client";

import { useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Filter } from "lucide-react";
import { formatDate } from "@/lib/utils";
import LikeButton from "@/components/reviews/LikeButton";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Review = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

const FILTERS = [
  { value: "all",   label: "전체" },
  { value: "text",  label: "텍스트" },
  { value: "photo", label: "사진" },
] as const;

export default function ArchiveClient({ initialReviews }: { initialReviews: Review[] }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? initialReviews : initialReviews.filter((r) => r.type === filter);
  const totalLikes = initialReviews.reduce((a: number, r: Review) => a + (r.likes ?? 0), 0);

  return (
    <>
      <div className="bg-warm-50 border-b border-warm-100">
        <div className="container-base py-12 sm:py-16">
          <p className="text-xs font-semibold text-warm-400 uppercase tracking-widest mb-2">생각 변화 기록</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-warm-900 mb-3">후기 아카이브</h1>
          <p className="text-warm-500 text-base leading-relaxed max-w-lg">
            모임에서 나눈 질문들이 사람들에게 남긴 흔적들.
          </p>
          <div className="flex gap-6 mt-8">
            {[
              { value: String(initialReviews.length), label: "후기" },
              { value: String(initialReviews.filter((r: Review) => r.type === "photo").length), label: "사진 후기" },
              { value: String(totalLikes), label: "공감" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col">
                <span className="font-serif text-2xl font-bold text-warm-900">{s.value}</span>
                <span className="text-xs text-warm-400 mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-base py-12 sm:py-16">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 mb-8">
          <Filter className="h-4 w-4 text-warm-400 shrink-0" />
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`shrink-0 px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === f.value ? "bg-warm-900 text-white" : "bg-warm-100 text-warm-600 hover:bg-warm-200"
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-warm-400 text-sm">
            {initialReviews.length === 0
              ? "아직 후기가 없습니다. 모임에 참여하고 첫 후기를 남겨보세요!"
              : "해당 유형의 후기가 없습니다."}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filtered.map((review: Review) => (
              <div key={review.id} className="break-inside-avoid card-base flex flex-col overflow-hidden">
                {review.photo_url && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image src={review.photo_url} alt="후기 사진" fill className="object-cover"
                      sizes="(max-width:640px) 100vw, 33vw" />
                  </div>
                )}
                <div className="flex flex-col gap-3 p-5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={review.author?.avatar_url ?? undefined} alt={review.author?.name ?? ""} />
                        <AvatarFallback>{(review.author?.name ?? "?")[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium text-warm-800">{review.author?.name ?? "익명"}</p>
                        <p className="text-[10px] text-warm-400">{formatDate(review.created_at)}</p>
                      </div>
                    </div>
                    <LikeButton reviewId={review.id} likes={review.likes ?? 0} />
                  </div>

                  {review.session?.question && (
                    <p className="text-[10px] text-warm-400 bg-warm-50 rounded-lg px-2 py-1 line-clamp-1">
                      {review.session.question.title}
                    </p>
                  )}

                  {review.quote && (
                    <blockquote className="font-serif text-sm font-medium text-warm-800 leading-relaxed border-l-[3px] border-warm-300 pl-3 italic">
                      &ldquo;{review.quote}&rdquo;
                    </blockquote>
                  )}
                  <p className="text-xs text-warm-500 leading-relaxed line-clamp-4">{review.content}</p>

                  {review.transformation && (
                    <div className="mt-auto pt-3 border-t border-warm-50">
                      <p className="text-[11px] text-warm-400 leading-relaxed">
                        <span className="font-semibold text-warm-500">생각 변화 · </span>
                        {review.transformation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
