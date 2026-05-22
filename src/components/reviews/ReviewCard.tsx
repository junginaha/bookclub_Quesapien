import Image from "next/image";
import { Heart, Play } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Review } from "@/types";
import { formatDate } from "@/lib/utils";

interface ReviewCardProps {
  review: Review;
  size?: "default" | "large";
}

export default function ReviewCard({ review, size = "default" }: ReviewCardProps) {
  return (
    <div className="card-base flex flex-col overflow-hidden h-full">
      {review.photo_url && (
        <div className={`relative w-full overflow-hidden ${size === "large" ? "h-64" : "h-48"}`}>
          <Image
            src={review.photo_url}
            alt="모임 후기 사진"
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="inline-flex items-center rounded-lg bg-black/40 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium text-white">
              {review.session.question.category}
            </span>
          </div>
        </div>
      )}

      {review.video_url && (
        <div className="relative h-48 bg-warm-900 flex items-center justify-center">
          <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg">
            <Play className="h-6 w-6 text-warm-900 ml-0.5" />
          </button>
          <span className="absolute bottom-3 left-3 text-[10px] text-white/80 font-medium">
            영상 후기
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3.5 p-5 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={review.author.avatar_url} alt={review.author.name} />
              <AvatarFallback className="text-xs">{review.author.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-semibold text-warm-800">{review.author.name}</p>
              <p className="text-[10px] text-warm-400">{formatDate(review.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-warm-400">
            <Heart className="h-3.5 w-3.5" />
            <span>{review.likes}</span>
          </div>
        </div>

        {review.quote && (
          <blockquote className="font-serif text-sm sm:text-base font-medium text-warm-800 leading-relaxed border-l-[3px] border-warm-300 pl-3 italic">
            &ldquo;{review.quote}&rdquo;
          </blockquote>
        )}

        <p className="text-sm text-warm-500 leading-relaxed line-clamp-3 flex-1">
          {review.content}
        </p>

        <div className="pt-3 border-t border-warm-50 flex flex-col gap-2">
          <p className="text-[11px] text-warm-300 font-medium uppercase tracking-wide">
            발제문
          </p>
          <p className="text-xs font-serif text-warm-600 line-clamp-1">
            &ldquo;{review.session.question.title}&rdquo;
          </p>
        </div>

        {review.transformation && (
          <div className="rounded-xl bg-warm-50 border border-warm-100 p-3">
            <p className="text-[11px] text-warm-400 uppercase tracking-wide font-semibold mb-1">
              생각 변화
            </p>
            <p className="text-xs text-warm-600 leading-relaxed">
              {review.transformation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
