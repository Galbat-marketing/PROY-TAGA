"use client"

import { cn } from "@/lib/utils"
import { palettes, useThemeStore, type PaletteId } from "@/lib/stores/theme-store"
import { Check } from "lucide-react"

export function PaletteSelector() {
  const currentPalette = useThemeStore((s) => s.palette)
  const setPalette = useThemeStore((s) => s.setPalette)

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {palettes.map((p) => {
        const isSelected = currentPalette === p.id

        return (
          <button
            key={p.id}
            onClick={() => setPalette(p.id)}
            className={cn(
              "group relative flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all cursor-pointer",
              isSelected
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
            )}
          >
            {/* Selected checkmark */}
            {isSelected && (
              <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                <Check className="h-3 w-3" />
              </div>
            )}

            {/* Color swatches */}
            <div className="flex gap-1.5">
              <div
                className="h-8 w-8 rounded-full ring-2 ring-black/5"
                style={{ backgroundColor: p.primary }}
              />
              <div
                className="h-8 w-8 rounded-full ring-2 ring-black/5"
                style={{ backgroundColor: p.primaryDark }}
              />
              <div
                className="h-8 w-8 rounded-full ring-2 ring-black/5"
                style={{ backgroundColor: p.accent }}
              />
            </div>

            {/* Palette name */}
            <span
              className={cn(
                "text-sm font-medium",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {p.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
