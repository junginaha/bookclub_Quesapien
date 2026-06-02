"use client";

import { useDataStore } from "@/store/dataStore";
import { FileUploader } from "@/components/data-analysis/upload/FileUploader";
import { AnalysisDashboard } from "@/components/data-analysis/analysis/AnalysisDashboard";
import { CleaningPanel } from "@/components/data-analysis/cleaning/CleaningPanel";
import { VisualizationPanel } from "@/components/data-analysis/visualization/VisualizationPanel";
import { CorrelationPanel } from "@/components/data-analysis/correlation/CorrelationPanel";

const PANELS: Record<string, React.ComponentType> = {
  upload:        FileUploader,
  analysis:      AnalysisDashboard,
  cleaning:      CleaningPanel,
  visualization: VisualizationPanel,
  correlation:   CorrelationPanel,
};

export default function DataAnalysisPage() {
  const activeMenu = useDataStore((s) => s.activeMenu);
  const Panel = PANELS[activeMenu] ?? FileUploader;
  return <Panel />;
}
