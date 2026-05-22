"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  sessionId: string;
}

export default function ReviewForm({ sessionId }: Props) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef               = useRef<HTMLFormElement>(null);
  const currentUser           = useAppStore((s) => s.currentUser);
  const createReview          = useAppStore((s) => s.createReview);
  const router                = useRouter();

  if (!currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const content = (form.querySelector("#r-content") as HTMLTextAreaElement)?.value.trim();
    if (!content) { toast.error("내용을 입력해주세요."); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const result = createReview({
      session_id:     sessionId,
      content,
      quote:          (form.querySelector("#r-quote") as HTMLInputElement)?.value.trim() || undefined,
      transformation: (form.querySelector("#r-transformation") as HTMLInputElement)?.value.trim() || undefined,
      type:           "text",
    });

    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
    } else {
      toast.success("후기가 등록되었습니다!");
      form.reset();
      setOpen(false);
      router.refresh();
    }
  };

  return (
    <div className="rounded-2xl border border-warm-100 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-warm-50 transition-colors"
      >
        <span className="font-serif font-semibold text-warm-900">후기 남기기</span>
        {open ? <ChevronUp className="h-4 w-4 text-warm-400" /> : <ChevronDown className="h-4 w-4 text-warm-400" />}
      </button>

      {open && (
        <form ref={formRef} onSubmit={handleSubmit} className="p-5 pt-0 flex flex-col gap-4 border-t border-warm-50">
          <div className="flex flex-col gap-2">
            <Label htmlFor="r-content">후기 내용 *</Label>
            <Textarea id="r-content" placeholder="모임에서 나눈 이야기, 느낀 점을 자유롭게 적어주세요." className="h-24" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="r-quote">인상 깊은 한 마디 (선택)</Label>
            <Input id="r-quote" placeholder='예) "질문 하나가 오래 남았다."' />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="r-transformation">생각 변화 (선택)</Label>
            <Input id="r-transformation" placeholder="이 모임 이후 어떤 생각이 달라졌나요?" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "후기 등록"}
          </Button>
        </form>
      )}
    </div>
  );
}
