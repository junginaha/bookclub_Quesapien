"use client";

import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { useAppStore } from "@/lib/store";
import { useState } from "react";
import LikeButton from "@/components/reviews/LikeButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Filter, Heart } from "lucide-react";

const FILTER_TYPES = [
  { value: "all",   label: "전체" },
  { value: "text",  label: "텍스트" },
  { value: "photo", label: "사진" },
  { value: "video", label: "영상" },
] as const;

type FilterType = (typeof FILTER_TYPES)[number]["value"];

export default function ArchivePage() {
  const reviews     = useAppStore((s) => s.reviews);
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.type === filter);
  const totalLikes = reviews.reduce((a, r) => a + r.likes, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-warm-50 border-b border-warm-100">
          <div className="container-base py-12 sm:py-16">
            <p className="text-xs font-semibold text-warm-400 uppercase tracking-widest mb-2">생각 변화 기록</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-warm-900 mb-3">후기 아카이브</h1>
            <p className="text-warm-500 text-base leading-relaxed max-w-lg">
              모임에서 나눈 질문들이 사람들에게 남긴 흔적들.
              단순한 리뷰가 아닌 생각의 변화를 기록합니다.
            </p>
            <div className="flex gap-6 mt-8">
              {[
                { value: String(reviews.length), label: "후기" },
                { value: String(reviews.filter((r) => r.type === "photo").length), label: "사진 후기" },
                { value: String(totalLikes), label: "공감" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="font-serif text-2xl font-bold text-warm-900">{stat.value}</span>
                  <span className="text-xs text-warm-400 mt-0.5">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container-base py-12 sm:py-16">
          {/* 필터 */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 mb-8">
            <Filter className="h-4 w-4 text-warm-400 shrink-0" />
            {FILTER_TYPES.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`shrink-0 px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filter === f.value ? "bg-warm-900 text-white" : "bg-warm-100 text-warm-600 hover:bg-warm-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-warm-400 text-sm">후기가 없습니다.</div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {filtered.map((review) => (
                <div key={review.id} className="break-inside-avoid card-base flex flex-col overflow-hidden">
                  {review.photo_url && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image src={review.photo_url} alt="후기 사진" fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}
                  <div className="flex flex-col gap-3 p-5 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={review.author_avatar} alt={review.author_name} />
                          <AvatarFallback>{review.author_name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-medium text-warm-800">{review.author_name}</p>
                          <p className="text-[10px] text-warm-400">{formatDate(review.created_at)}</p>
                        </div>
                      </div>
                      <LikeButton reviewId={review.id} likes={review.likes} />
                    </div>

                    {review.quote && (
                      <blockquote className="font-serif text-sm font-medium text-warm-800 leading-relaxed border-l-[3px] border-warm-300 pl-3 italic">
                        &ldquo;{review.quote}&rdquo;
                      </blockquote>
                    )}
                    <p className="text-xs text-warm-500 leading-relaxed line-clamp-3">{review.content}</p>

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
      </main>
      <Footer />
    </div>
  );
}
