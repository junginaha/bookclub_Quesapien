"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Users, Tag, Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { QuestionCategory } from "@/types";

const CATEGORIES: QuestionCategory[] = ["관계","자아","사회","감정","철학","일과삶","사랑","성장"];

export default function QuestionForm() {
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState("");

  const currentUser    = useAppStore((s) => s.currentUser);
  const createQuestion = useAppStore((s) => s.createQuestion);
  const router         = useRouter();

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim()) && tags.length < 5)
        setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) { toast.error("로그인이 필요합니다."); router.push("/login"); return; }

    const form       = new FormData(e.currentTarget);
    const title      = (form.get("title") as string).trim();
    const description = (form.get("description") as string).trim();
    const location   = (form.get("location") as string).trim();
    const date       = form.get("date") as string;
    const start_time = form.get("start_time") as string;
    const end_time   = form.get("end_time") as string;
    const maxP       = parseInt(form.get("max_participants") as string, 10);

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const result = createQuestion({
      title, description, category, tags,
      location, date, start_time, end_time,
      max_participants: isNaN(maxP) ? 8 : maxP,
    });

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("발제가 등록되었습니다!");
      router.push(`/questions/${result.questionId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">발제 질문 *</Label>
        <Input id="title" name="title" placeholder="예) 우리는 왜 인정받고 싶어하는가?" className="h-12 text-base" required />
        <p className="text-xs text-warm-400">사유를 자극하는 열린 질문이 좋습니다.</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">발제 설명</Label>
        <Textarea id="description" name="description" placeholder="이 질문을 탐구하는 이유와 배경을 설명해주세요." className="h-28 resize-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>카테고리 *</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger><SelectValue placeholder="카테고리 선택" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>태그</Label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Enter로 추가 (최대 5개)" className="pl-9" />
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <button key={tag} type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="tag-base bg-warm-100 text-warm-600 hover:bg-warm-200 transition-colors">
                  #{tag} ×
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-warm-100 bg-warm-50 p-5">
        <h3 className="text-sm font-semibold text-warm-800 mb-4 flex items-center gap-2">
          <MapPin className="h-4 w-4" />모임 정보
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="location">모임 장소 *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
              <Input id="location" name="location" placeholder="예) 서초구 교대역 근처 카페" className="pl-9" required />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">날짜 *</Label>
            <Input id="date" name="date" type="date" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="start_time">시작 시간 *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
              <Input id="start_time" name="start_time" type="time" className="pl-9" required />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="end_time">종료 시간</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
              <Input id="end_time" name="end_time" type="time" className="pl-9" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="max_participants">최대 참여 인원 *</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
              <Input id="max_participants" name="max_participants" type="number" min={2} max={20} defaultValue={8} className="pl-9" required />
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full gap-2" disabled={loading || !category}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />등록 중...</> : "발제 등록하기"}
      </Button>
    </form>
  );
}
