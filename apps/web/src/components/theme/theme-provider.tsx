"use client"

import { useEffect, useRef } from "react"
import { useThemeStore } from "@/lib/stores/theme-store"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode)
  const palette = useThemeStore((s) => s.palette)
  const hydrated = useThemeStore((s) => s.hydrated)
  const loadFromServer = useThemeStore((s) => s.loadFromServer)
  const loaded = useRef(false)

  useEffect(() => {
    if (!hydrated || loaded.current) return
    loaded.current = true
    loadFromServer()
  }, [hydrated, loadFromServer])

  useEffect(() => {
    if (!hydrated) return

    const root = document.documentElement
    root.setAttribute("data-palette", palette)

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const applyTheme = () => {
      const isDark =
        mode === "system" ? mediaQuery.matches : mode === "dark"
      root.setAttribute("data-theme", mode)
      root.classList.toggle("dark", isDark)
    }

    applyTheme()

    if (mode === "system") {
      const handler = () => applyTheme()
      mediaQuery.addEventListener("change", handler)
      return () => mediaQuery.removeEventListener("change", handler)
    }
  }, [mode, palette, hydrated])

  if (!hydrated) return null

  return <>{children}</>
}
