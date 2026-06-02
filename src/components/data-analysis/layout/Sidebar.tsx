"use client";

import { UploadCloud, BarChart2, ChevronLeft, ChevronRight, Sparkles, LineChart, GitFork } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataStore } from "@/store/dataStore";
import type { MenuItem, MenuId } from "@/types/data-analysis";

const MENU_ITEMS: MenuItem[] = [
  { id: "upload",        label: "파일 업로드",    icon: "upload",      requiresData: false },
  { id: "analysis",      label: "기본 데이터 분석", icon: "chart",     requiresData: true  },
  { id: "cleaning",      label: "데이터 클리닝",  icon: "sparkles",    requiresData: true  },
  { id: "visualization", label: "시각화",         icon: "line",        requiresData: true  },
  { id: "correlation",   label: "상관관계 분석",  icon: "git",         requiresData: true  },
];

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  upload:   UploadCloud,
  chart:    BarChart2,
  sparkles: Sparkles,
  line:     LineChart,
  git:      GitFork,
};

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const { activeMenu, setActiveMenu, data } = useDataStore();

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-gray-900 text-gray-100 transition-all duration-300 shrink-0",
        open ? "w-56" : "w-14"
      )}
    >
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-700">
        <BarChart2 className="shrink-0 w-5 h-5 text-blue-400" />
        {open && <span className="font-semibold text-sm whitespace-nowrap">데이터 분석기</span>}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {MENU_ITEMS.map((item) => {
          const Icon = IconMap[item.icon];
          const disabled = item.requiresData && !data;
          const active = activeMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => !disabled && setActiveMenu(item.id as MenuId)}
              disabled={disabled}
              title={!open ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm transition-colors",
                active && "bg-blue-600 text-white",
                !active && !disabled && "hover:bg-gray-700 text-gray-300",
                disabled && "opacity-40 cursor-not-allowed text-gray-500"
              )}
            >
              <Icon className="shrink-0 w-4 h-4" />
              {open && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600 transition-colors"
      >
        {open ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
    </aside>
  );
}
