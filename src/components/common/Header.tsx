"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Menu, X, Sparkles, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/questions/create", label: "발제 만들기" },
  { href: "/archive", label: "후기 아카이브" },
];

export default function Header() {
  const pathname = usePathname();
  const router   = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentUser = useAppStore((s) => s.currentUser);
  const logout      = useAppStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    toast.success("로그아웃 되었습니다.");
    router.push("/");
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-warm-100">
      <div className="container-base">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-warm-900 transition-transform group-hover:scale-105">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-serif text-sm font-bold text-warm-900 leading-tight">질문하는 사람들</span>
              <span className="text-[10px] text-warm-400 font-sans tracking-wide leading-tight">미래혁신형 북클럽</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                pathname === item.href ? "bg-warm-100 text-warm-900" : "text-warm-500 hover:text-warm-900 hover:bg-warm-50"
              )}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/questions/create">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />AI 발제
              </Button>
            </Link>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link href="/mypage">
                  <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-warm-300 transition-all">
                    <AvatarImage src={currentUser.avatar_url} alt={currentUser.name} />
                    <AvatarFallback className="text-xs bg-warm-200 text-warm-700">
                      {currentUser.name[0]}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <button onClick={handleLogout} className="p-1.5 rounded-lg text-warm-400 hover:text-warm-700 hover:bg-warm-100 transition-colors" title="로그아웃">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm">시작하기</Button>
              </Link>
            )}
          </div>

          <button className="md:hidden p-2 rounded-xl hover:bg-warm-100 transition-colors" onClick={() => setMobileOpen(!mobileOpen)} aria-label="메뉴">
            {mobileOpen ? <X className="h-5 w-5 text-warm-700" /> : <Menu className="h-5 w-5 text-warm-700" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-warm-100 bg-white/95 backdrop-blur-xl">
          <div className="container-base py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className={cn("px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  pathname === item.href ? "bg-warm-100 text-warm-900" : "text-warm-600 hover:bg-warm-50"
                )}>
                {item.label}
              </Link>
            ))}
            <div className="flex gap-2 mt-3 pt-3 border-t border-warm-100">
              {currentUser ? (
                <>
                  <Link href="/mypage" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full gap-2" size="sm">
                      <User className="h-3.5 w-3.5" />{currentUser.name}
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="gap-1.5 text-warm-500 border-warm-200" onClick={handleLogout}>
                    <LogOut className="h-3.5 w-3.5" />로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full" size="sm">로그인</Button>
                  </Link>
                  <Link href="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full" size="sm">회원가입</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
