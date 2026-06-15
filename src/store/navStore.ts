import { create } from "zustand";
import type { AuditActionType } from "@/types";

export type NavTargetPage = "/monitoring" | "/approval" | "/rectification";

export interface AuditFilter {
  actionType?: AuditActionType;
  targetId?: string;
  operatorName?: string;
}

interface NavState {
  pendingTarget: {
    page: NavTargetPage;
    id: string;
  } | null;

  pendingAuditFilter: AuditFilter | null;

  consumeTarget: (page: NavTargetPage) => string | null;
  setTarget: (page: NavTargetPage, id: string) => void;
  clearTarget: () => void;

  consumeAuditFilter: () => AuditFilter | null;
  setAuditFilter: (filter: AuditFilter) => void;
  clearAuditFilter: () => void;
}

export const useNavStore = create<NavState>((set, get) => ({
  pendingTarget: null,
  pendingAuditFilter: null,

  consumeTarget: (page) => {
    const t = get().pendingTarget;
    if (t && t.page === page) {
      set({ pendingTarget: null });
      return t.id;
    }
    return null;
  },

  setTarget: (page, id) => set({ pendingTarget: { page, id } }),
  clearTarget: () => set({ pendingTarget: null }),

  consumeAuditFilter: () => {
    const f = get().pendingAuditFilter;
    if (f) {
      set({ pendingAuditFilter: null });
      return f;
    }
    return null;
  },

  setAuditFilter: (filter) => set({ pendingAuditFilter: filter }),
  clearAuditFilter: () => set({ pendingAuditFilter: null }),
}));
