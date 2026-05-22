"use client";

import { useState } from "react";
import type { Review } from "@/types";
import ReviewCard from "./ReviewCard";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

const FILTER_TYPES = [
  { value: "all", label: "전체" },
  { value: "text", label: "텍스트" },
  { value: "photo", label: "사진" },
  { value: "video", label: "영상" },
] as const;

type FilterType = (typeof FILTER_TYPES)[number]["value"];

interface ReviewGridProps {
  reviews: Review[];
}

export default function ReviewGrid({ reviews }: ReviewGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filtered =
    activeFilter === "all"
      ? reviews
      : reviews.filter((r) => r.type === activeFilter);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <Filter className="h-4 w-4 text-warm-400 shrink-0" />
        {FILTER_TYPES.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`shrink-0 px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeFilter === f.value
                ? "bg-warm-900 text-white"
                : "bg-warm-100 text-warm-600 hover:bg-warm-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-warm-400 text-sm">
          해당 유형의 후기가 없습니다.
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((review) => (
            <div key={review.id} className="break-inside-avoid">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      )}

      {filtered.length >= 6 && (
        <div className="text-center pt-4">
          <Button variant="outline" size="lg">
            더 보기
          </Button>
        </div>
      )}
    </div>
  );
}
