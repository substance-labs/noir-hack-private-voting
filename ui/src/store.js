import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export const useAppStore = create(
  persist(
    (set) => ({
      devMode: false,
      setDevMode: (val) => set(() => ({ devMode: val })),
      sidebarOpen: false,
      closeSidebar: () => set(() => ({ sidebarOpen: false })),
      openSidebar: () => set(() => ({ sidebarOpen: true })),
    }),
    {
      name: "rivelio-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    },
  ),
)
