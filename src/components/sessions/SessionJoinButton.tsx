"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { joinSessionAction, leaveSessionAction } from "@/lib/actions/sessions";

interface Props {
  sessionId: string;
  isFull: boolean;
  isClosed: boolean;
}

export default function SessionJoinButton({ sessionId, isFull, isClosed }: Props) {
  const [pending, setPending] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [checking, setChecking] = useState(true);
  const currentUser = useAppStore((s) => s.currentUser);
  const pathname = usePathname();

  // Supabase session_participants에서 실제 참여 여부 확인
  useEffect(() => {
    if (!currentUser) { setChecking(false); return; }
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("session_participants")
      .select("id")
      .eq("session_id", sessionId)
      .eq("user_id", currentUser.id)
      .maybeSingle()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: { data: any }) => {
        setIsJoined(!!data);
        setChecking(false);
      });
  }, [sessionId, currentUser]);

  if (!currentUser) {
    return (
      <Link href={`/login?next=${encodeURIComponent(pathname)}`}>
        <Button variant="outline" className="w-full" size="sm">
          로그인 후 참여
        </Button>
      </Link>
    );
  }

  if (isClosed) {
    return <Button className="w-full" size="sm" disabled>마감된 모임</Button>;
  }

  if (checking) {
    return (
      <Button className="w-full" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  const handleJoin = async () => {
    setPending(true);
    const result = await joinSessionAction(sessionId);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      setIsJoined(true);
      toast.success(result.success ?? "모임에 참여했어요!");
    }
  };

  const handleLeave = async () => {
    setPending(true);
    const result = await leaveSessionAction(sessionId);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      setIsJoined(false);
      toast.success(result.success ?? "참여가 취소됐어요.");
    }
  };

  if (isJoined) {
    return (
      <Button
        variant="outline"
        className="w-full border-red-200 text-red-500 hover:bg-red-50"
        size="sm"
        disabled={pending}
        onClick={handleLeave}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "참여 취소"}
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      size="sm"
      disabled={isFull || pending}
      onClick={handleJoin}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : isFull ? "정원 마감" : "지금 참여하기"}
    </Button>
  );
}
