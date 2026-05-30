"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { useAppStore } from "@/lib/store";

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: "8자 이상" },
  { test: (p: string) => /[A-Z]/.test(p), label: "대문자 포함" },
  { test: (p: string) => /[0-9]/.test(p), label: "숫자 포함" },
];

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const signup = useAppStore((s) => s.signup);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name     = form.get("name") as string;
    const email    = form.get("email") as string;
    const password = form.get("password") as string;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const result = signup(name, email, password);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("환영합니다! 당신에 대해 알려주세요.");
      router.push("/onboarding");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">이름</Label>
        <Input id="name" name="name" type="text" placeholder="홍길동" autoComplete="name" required className="h-12" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" name="email" type="email" placeholder="hello@example.com" autoComplete="email" required className="h-12" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">비밀번호</Label>
        <div className="relative">
          <Input
            id="password" name="password"
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            className="h-12 pr-10"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-700 transition-colors">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {password && (
          <div className="flex gap-4 mt-1">
            {PASSWORD_RULES.map((rule) => (
              <div key={rule.label} className={`flex items-center gap-1 text-xs transition-colors ${rule.test(password) ? "text-emerald-600" : "text-warm-300"}`}>
                <Check className="h-3 w-3" />{rule.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full h-12 gap-2 mt-1" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />가입 중...</> : "회원가입"}
      </Button>

      <p className="text-center text-sm text-warm-400">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-warm-900 font-semibold hover:underline underline-offset-2">로그인</Link>
      </p>
    </form>
  );
}
