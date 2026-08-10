import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean; // mobile overlay
  commandPaletteOpen: boolean;
  notificationsOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarOpen: false,
      commandPaletteOpen: false,
      notificationsOpen: false,

      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      setNotificationsOpen: (open) => set({ notificationsOpen: open }),
    }),
    {
      name: "ef-ui-store",
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
);
