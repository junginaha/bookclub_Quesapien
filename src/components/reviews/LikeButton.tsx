"use client";

import { useAppStore } from "@/lib/store";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  reviewId: string;
  likes: number;
}

export default function LikeButton({ reviewId, likes: initialLikes }: Props) {
  const currentUser = useAppStore((s) => s.currentUser);
  const isLiked     = useAppStore((s) => s.isLiked(reviewId));
  const toggleLike  = useAppStore((s) => s.toggleLike);
  // 실시간 likes는 스토어에서 읽음
  const storeReview = useAppStore((s) => s.reviews.find((r) => r.id === reviewId));
  const likes       = storeReview?.likes ?? initialLikes;

  const handleClick = () => {
    if (!currentUser) { toast.error("로그인 후 공감할 수 있습니다."); return; }
    toggleLike(reviewId);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center gap-1 text-xs transition-colors px-2 py-1 rounded-lg",
        isLiked
          ? "text-red-500 bg-red-50"
          : "text-warm-400 hover:text-red-400 hover:bg-red-50"
      )}
    >
      <Heart className={cn("h-3.5 w-3.5 transition-all", isLiked && "fill-red-500")} />
      <span>{likes}</span>
    </button>
  );
}
