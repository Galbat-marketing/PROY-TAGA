import { create } from "zustand"
import { persist } from "zustand/middleware"
import { actualizarPreferencias, type UserPreferences } from "@/lib/actions/preferencias"

export type ThemeMode = "light" | "dark" | "system"
export type PaletteId =
  | "verde"
  | "azul"
  | "purpura"
  | "rojo"
  | "naranja"
  | "teal"

export interface PaletteConfig {
  id: PaletteId
  name: string
  primary: string
  primaryDark: string
  accent: string
  ring: string
}

export const palettes: PaletteConfig[] = [
  {
    id: "verde",
    name: "Verde",
    primary: "#0A6E4F",
    primaryDark: "#166534",
    accent: "#E8F5E9",
    ring: "#0A6E4F",
  },
  {
    id: "azul",
    name: "Azul",
    primary: "#2563EB",
    primaryDark: "#1E40AF",
    accent: "#EFF6FF",
    ring: "#2563EB",
  },
  {
    id: "purpura",
    name: "Púrpura",
    primary: "#7C3AED",
    primaryDark: "#5B21B6",
    accent: "#F5F3FF",
    ring: "#7C3AED",
  },
  {
    id: "rojo",
    name: "Rojo",
    primary: "#DC2626",
    primaryDark: "#B91C1C",
    accent: "#FEF2F2",
    ring: "#DC2626",
  },
  {
    id: "naranja",
    name: "Naranja",
    primary: "#F97316",
    primaryDark: "#C2410C",
    accent: "#FFF7ED",
    ring: "#F97316",
  },
  {
    id: "teal",
    name: "Teal",
    primary: "#0D9488",
    primaryDark: "#0F766E",
    accent: "#F0FDFA",
    ring: "#0D9488",
  },
]

interface ThemeStore {
  mode: ThemeMode
  palette: PaletteId
  setMode: (mode: ThemeMode) => void
  setPalette: (palette: PaletteId) => void
  hydrated: boolean
  setHydrated: () => void
  syncToServer: () => Promise<void>
  loadFromServer: () => Promise<void>
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: "system",
      palette: "verde",
      hydrated: false,
      setMode: (mode) => {
        set({ mode })
        get().syncToServer()
      },
      setPalette: (palette) => {
        set({ palette })
        get().syncToServer()
      },
      setHydrated: () => set({ hydrated: true }),
      syncToServer: async () => {
        const { mode, palette } = get()
        try {
          await actualizarPreferencias({
            theme_mode: mode,
            theme_palette: palette,
          } satisfies UserPreferences)
        } catch {
          // Silently fail — localStorage is the fallback
        }
      },
      loadFromServer: async () => {
        try {
          const { obtenerPreferencias } = await import("@/lib/actions/preferencias")
          const prefs = await obtenerPreferencias()
          if (prefs) {
            if (prefs.theme_mode) set({ mode: prefs.theme_mode as ThemeMode })
            if (prefs.theme_palette) set({ palette: prefs.theme_palette as PaletteId })
          }
        } catch {
          // Silently fail — localStorage is the fallback
        }
      },
    }),
    {
      name: "taga-theme",
      partialize: (state) => ({
        mode: state.mode,
        palette: state.palette,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated()
      },
    }
  )
)
