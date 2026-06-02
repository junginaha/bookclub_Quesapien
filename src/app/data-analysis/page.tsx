"use client";

import { useDataStore } from "@/store/dataStore";
import { FileUploader } from "@/components/data-analysis/upload/FileUploader";
import { AnalysisDashboard } from "@/components/data-analysis/analysis/AnalysisDashboard";

export default function DataAnalysisPage() {
  const activeMenu = useDataStore((s) => s.activeMenu);

  if (activeMenu === "analysis") return <AnalysisDashboard />;
  return <FileUploader />;
}
