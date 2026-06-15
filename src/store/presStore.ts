import { create } from "zustand";
import type { PrescriptionWarning, WarningType, Severity } from "@/types";
import { useDataStore } from "./dataStore";

interface Filters {
  keyword: string;
  departmentIds: string[];
  warningTypes: WarningType[];
  severities: Severity[];
  statuses: Array<"PENDING" | "HANDLED" | "DISMISSED">;
  dateRange: [string, string] | null;
}

interface PresStore {
  filters: Filters;
  selectedId: string | null;
  setFilters: (f: Partial<Filters>) => void;
  resetFilters: () => void;
  selectWarning: (id: string | null) => void;
  handleWarning: (
    id: string,
    action: "HANDLED" | "DISMISSED",
    opinion: string
  ) => void;
  getWarnings: () => PrescriptionWarning[];
}

const DEFAULT_FILTERS: Filters = {
  keyword: "",
  departmentIds: [],
  warningTypes: [],
  severities: [],
  statuses: ["PENDING"],
  dateRange: null,
};

export const usePresStore = create<PresStore>((set, get) => ({
  filters: DEFAULT_FILTERS,
  selectedId: null,
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  selectWarning: (id) => set({ selectedId: id }),
  handleWarning: (id, action, opinion) => {
    useDataStore.getState().handleWarning(id, action, opinion);
  },
  getWarnings: () => useDataStore.getState().warnings,
}));

export function getFilteredWarnings(state: PresStore) {
  const { filters } = state;
  const warnings = useDataStore.getState().warnings;
  return warnings.filter((w) => {
    if (filters.keyword) {
      const k = filters.keyword.toLowerCase();
      if (
        !w.patientName.toLowerCase().includes(k) &&
        !w.doctorName.toLowerCase().includes(k) &&
        !w.departmentName.toLowerCase().includes(k) &&
        !w.drugs.some((d) => d.toLowerCase().includes(k))
      )
        return false;
    }
    if (filters.departmentIds.length && !filters.departmentIds.includes(w.departmentId))
      return false;
    if (filters.warningTypes.length && !filters.warningTypes.includes(w.warningType))
      return false;
    if (filters.severities.length && !filters.severities.includes(w.severity))
      return false;
    if (filters.statuses.length && !filters.statuses.includes(w.status))
      return false;
    return true;
  });
}
