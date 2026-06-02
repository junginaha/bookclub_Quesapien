"use client";

import { useState } from "react";
import { Sidebar } from "@/components/data-analysis/layout/Sidebar";
import { Header } from "@/components/data-analysis/layout/Header";

export default function DataAnalysisLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 font-[var(--font-noto-sans-kr)]">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((p) => !p)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
