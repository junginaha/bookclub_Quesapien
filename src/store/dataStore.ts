import { create } from "zustand";
import type { ParsedData, MenuId } from "@/types/data-analysis";

interface DataStore {
  data: ParsedData | null;
  activeMenu: MenuId;
  setData: (data: ParsedData) => void;
  clearData: () => void;
  setActiveMenu: (menu: MenuId) => void;
}

export const useDataStore = create<DataStore>((set) => ({
  data: null,
  activeMenu: "upload",
  setData: (data) => set({ data, activeMenu: "analysis" }),
  clearData: () => set({ data: null, activeMenu: "upload" }),
  setActiveMenu: (activeMenu) => set({ activeMenu }),
}));
