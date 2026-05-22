"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  sessionId: string;
  isFull: boolean;
  isClosed: boolean;
}

export default function SessionJoinButton({ sessionId, isFull, isClosed }: Props) {
  const [pending, setPending] = useState(false);
  const currentUser  = useAppStore((s) => s.currentUser);
  const isJoined     = useAppStore((s) => s.isJoined(sessionId));
  const joinSession  = useAppStore((s) => s.joinSession);
  const leaveSession = useAppStore((s) => s.leaveSession);

  if (!currentUser) {
    return (
      <Link href="/login">
        <Button variant="outline" className="w-full" size="sm">로그인 후 참여</Button>
      </Link>
    );
  }

  if (isClosed) return <Button className="w-full" size="sm" disabled>마감된 모임</Button>;

  const handleJoin = async () => {
    setPending(true);
    await new Promise((r) => setTimeout(r, 300));
    const result = joinSession(sessionId);
    setPending(false);
    if ("error" in result && result.error) toast.error(result.error);
    else if ("success" in result) toast.success(result.success);
  };

  const handleLeave = async () => {
    setPending(true);
    await new Promise((r) => setTimeout(r, 300));
    const result = leaveSession(sessionId);
    setPending(false);
    if ("error" in result && result.error) toast.error(result.error);
    else if ("success" in result) toast.success(result.success);
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
