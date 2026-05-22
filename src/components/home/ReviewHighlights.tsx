import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Review } from "@/types";
import { formatDate } from "@/lib/utils";

interface ReviewHighlightsProps {
  reviews: Review[];
}

export default function ReviewHighlights({ reviews }: ReviewHighlightsProps) {
  return (
    <section className="bg-warm-50 border-y border-warm-100">
      <div className="container-base py-16 sm:py-20">
        <div className="flex items-start justify-between gap-3 mb-10">
          <div>
            <p className="text-xs font-semibold text-warm-400 uppercase tracking-widest mb-1">
              생각 변화 기록
            </p>
            <h2 className="section-title">사람들의 이야기</h2>
            <p className="section-subtitle">
              모임에서 시작된 질문이 남긴 변화들
            </p>
            <p className="text-[11px] text-warm-300 italic mt-1">
              책보다 사람이 재밌어지는 순간
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-2">
            <Link
              href="/archive"
              className="text-sm text-warm-500 hover:text-warm-900 transition-colors flex items-center gap-1 shrink-0"
            >
              모두 보기
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <span className="text-[11px] text-warm-300 italic">이상하게 마음이 편해지는 곳</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.slice(0, 6).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        <div className="mt-8 sm:hidden">
          <Link href="/archive">
            <button className="w-full py-3 rounded-xl border border-warm-200 text-sm text-warm-600 hover:bg-white transition-colors flex items-center justify-center gap-2">
              후기 아카이브 전체 보기
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>

        <p className="text-center text-[11px] text-warm-300 italic mt-8">
          읽는 사람은 결국 만나게 됩니다
        </p>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="card-base flex flex-col overflow-hidden">
      {review.photo_url && (
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={review.photo_url}
            alt="모임 사진"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="flex flex-col gap-3 p-5 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={review.author.avatar_url} alt={review.author.name} />
              <AvatarFallback>{review.author.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-medium text-warm-800">{review.author.name}</p>
              <p className="text-[10px] text-warm-400">{formatDate(review.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-warm-400">
            <Heart className="h-3.5 w-3.5" />
            <span>{review.likes}</span>
          </div>
        </div>

        {review.quote && (
          <blockquote className="font-serif text-sm font-medium text-warm-800 leading-relaxed border-l-2 border-warm-200 pl-3 italic">
            &ldquo;{review.quote}&rdquo;
          </blockquote>
        )}

        <p className="text-xs text-warm-500 leading-relaxed line-clamp-3">
          {review.content}
        </p>

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
  );
}
