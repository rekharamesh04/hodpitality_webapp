import { create } from "zustand";
import type { Guest } from "@/types";

interface GuestStore {
  selectedGuest: Guest | null;
  selectedIds: string[];
  drawerOpen: boolean;
  setSelectedGuest: (guest: Guest | null) => void;
  openDrawer: (guest: Guest) => void;
  closeDrawer: () => void;
  toggleSelection: (id: string) => void;
  setSelectedIds: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useGuestStore = create<GuestStore>()((set) => ({
  selectedGuest: null,
  selectedIds: [],
  drawerOpen: false,

  setSelectedGuest: (guest) => set({ selectedGuest: guest }),

  openDrawer: (guest) => set({ selectedGuest: guest, drawerOpen: true }),

  closeDrawer: () => set({ drawerOpen: false }),

  toggleSelection: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((i) => i !== id)
        : [...s.selectedIds, id],
    })),

  setSelectedIds: (ids) => set({ selectedIds: ids }),

  clearSelection: () => set({ selectedIds: [] }),
}));
