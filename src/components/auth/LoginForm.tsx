"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAppStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email    = form.get("email") as string;
    const password = form.get("password") as string;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const result = login(email, password);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("다시 만나서 반가워요!");
      router.push("/");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">이메일 또는 아이디</Label>
        <Input
          id="email"
          name="email"
          type="text"
          placeholder="이메일 또는 아이디를 입력해주세요"
          autoComplete="username"
          required
          className="h-12"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">비밀번호</Label>
          <Link href="#" className="text-xs text-warm-400 hover:text-warm-700 transition-colors">
            비밀번호를 잊으셨나요?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호를 입력해주세요"
            autoComplete="current-password"
            required
            className="h-12 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-700 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full gap-2 h-12" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />로그인 중...</> : "로그인"}
      </Button>

      <p className="text-center text-sm text-warm-400">
        아직 계정이 없으신가요?{" "}
        <Link href="/signup" className="text-warm-900 font-semibold hover:underline underline-offset-2">회원가입</Link>
      </p>
    </form>
  );
}
