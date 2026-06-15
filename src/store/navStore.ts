import { create } from "zustand";

export type NavTargetPage = "/monitoring" | "/approval" | "/rectification";

interface NavState {
  pendingTarget: {
    page: NavTargetPage;
    id: string;
  } | null;

  consumeTarget: (page: NavTargetPage) => string | null;
  setTarget: (page: NavTargetPage, id: string) => void;
  clearTarget: () => void;
}

export const useNavStore = create<NavState>((set, get) => ({
  pendingTarget: null,

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
}));
