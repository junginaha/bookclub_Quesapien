"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 text-warm-500 border-warm-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50"
      disabled={isPending}
      onClick={() => startTransition(() => logoutAction())}
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
      로그아웃
    </Button>
  );
}
