"use client"

import { ArrowLeft, Palette, Monitor, Sun, Moon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useThemeStore, type ThemeMode } from "@/lib/stores/theme-store"
import { PaletteSelector } from "@/components/theme/palette-selector"

const themeOptions: { mode: ThemeMode; icon: typeof Sun; label: string; desc: string }[] = [
  { mode: "light", icon: Sun, label: "Claro", desc: "Tema claro para uso diurno" },
  { mode: "dark", icon: Moon, label: "Oscuro", desc: "Tema oscuro para reducir fatiga visual" },
  { mode: "system", icon: Monitor, label: "Sistema", desc: "Sigue la configuración de tu dispositivo" },
]

export default function AparienciaPage() {
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/configuracion">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Apariencia</h1>
          <p className="text-sm text-muted-foreground">Personalización visual del sistema</p>
        </div>
      </div>

      {/* Theme mode selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Monitor className="h-4 w-4" /> Modo de tema
          </CardTitle>
          <CardDescription>
            Selecciona entre tema claro, oscuro o sigue la configuración de tu sistema operativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isSelected = mode === option.mode

              return (
                <button
                  key={option.mode}
                  onClick={() => setMode(option.mode)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                  )}
                >
                  {isSelected && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <Icon
                    className={cn(
                      "h-6 w-6",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {option.label}
                  </span>
                  <span className="text-xs text-muted-foreground text-center leading-tight">
                    {option.desc}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Color palette selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" /> Paleta de colores
          </CardTitle>
          <CardDescription>
            Elige la paleta de colores que se usará en toda la aplicación. Los cambios se aplican
            automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaletteSelector />
        </CardContent>
      </Card>
    </div>
  )
}
