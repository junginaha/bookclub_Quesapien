import { create } from "zustand";
import type { ParsedData, MenuId, CleaningLog } from "@/types/data-analysis";

interface DataStore {
  data: ParsedData | null;
  cleanedData: ParsedData | null;  // 클리닝된 데이터 (없으면 원본 사용)
  cleaningLogs: CleaningLog[];
  activeMenu: MenuId;
  setData: (data: ParsedData) => void;
  setCleanedData: (data: ParsedData, log: CleaningLog) => void;
  resetCleanedData: () => void;
  clearData: () => void;
  setActiveMenu: (menu: MenuId) => void;
}

export const useDataStore = create<DataStore>((set) => ({
  data: null,
  cleanedData: null,
  cleaningLogs: [],
  activeMenu: "upload",
  setData: (data) => set({ data, cleanedData: null, cleaningLogs: [], activeMenu: "analysis" }),
  setCleanedData: (data, log) =>
    set((s) => ({ cleanedData: data, cleaningLogs: [...s.cleaningLogs, log] })),
  resetCleanedData: () => set({ cleanedData: null, cleaningLogs: [] }),
  clearData: () => set({ data: null, cleanedData: null, cleaningLogs: [], activeMenu: "upload" }),
  setActiveMenu: (activeMenu) => set({ activeMenu }),
}));

/** 시각화·분석에서 사용할 실효 데이터 (정제본 우선) */
export const selectActiveData = (s: DataStore) => s.cleanedData ?? s.data;
