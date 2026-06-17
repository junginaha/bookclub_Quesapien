"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, LayoutDashboard, Upload, Settings, FileText,
  Sparkles, Download, Image as ImageIcon, ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "", label: "개요", icon: LayoutDashboard },
  { href: "/manuscript", label: "원고 업로드", icon: Upload },
  { href: "/info", label: "출판 정보", icon: FileText },
  { href: "/layout-settings", label: "조판 설정", icon: Settings },
  { href: "/cover", label: "표지 관리", icon: ImageIcon },
  { href: "/ai-tools", label: "AI 편집 도구", icon: Sparkles },
  { href: "/export", label: "내보내기", icon: Download },
];

interface Props {
  bookId: string;
  bookTitle?: string;
}

export function PublishingNav({ bookId, bookTitle }: Props) {
  const pathname = usePathname();
  const base = `/publishing/${bookId}`;

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <Link
          href="/publishing"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          대시보드
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
            {bookTitle || "새 책"}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const fullHref = `${base}${href}`;
          const isActive = href === ""
            ? pathname === base
            : pathname.startsWith(fullHref);
          return (
            <Link
              key={href}
              href={fullHref}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">19호실 출판OS v1.0</p>
      </div>
    </aside>
  );
}
