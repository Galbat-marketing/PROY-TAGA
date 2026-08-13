"use client"

import { useEffect, useState, useCallback } from "react"
import { Command } from "cmdk"
import { Search, FileText, Package, Users, Truck, LayoutDashboard, Container, Ship, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const commands = [
  {
    group: "Navegación",
    items: [
      { label: "Ir a Dashboard", icon: LayoutDashboard, action: "/" },
      { label: "Ir a Ofertas", icon: FileText, action: "/ofertas" },
      { label: "Ir a Productos", icon: Package, action: "/productos" },
      { label: "Ir a Clientes", icon: Users, action: "/clientes" },
      { label: "Ir a Proveedores", icon: Truck, action: "/proveedores" },
      { label: "Ir a Contenedores", icon: Container, action: "/contenedores" },
      { label: "Ir a Embarques", icon: Ship, action: "/embarques" },
      { label: "Ir a Facturas", icon: DollarSign, action: "/facturas" },
    ],
  },
  {
    group: "Acciones",
    items: [
      { label: "Nueva Oferta", icon: FileText, action: "/ofertas/nueva" },
      { label: "Nuevo Cliente", icon: Users, action: "/clientes/nuevo" },
      { label: "Nuevo Producto", icon: Package, action: "/productos/nuevo" },
    ],
  },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", down)

    const handleCustom = () => setOpen(true)
    window.addEventListener("open-command-palette", handleCustom)

    return () => {
      document.removeEventListener("keydown", down)
      window.removeEventListener("open-command-palette", handleCustom)
    }
  }, [])

  const handleSelect = useCallback(
    (action: string) => {
      setOpen(false)
      setSearch("")
      router.push(action)
    },
    [router]
  )

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Command palette */}
      <div
        className={cn(
          "fixed left-1/2 top-1/4 z-50 w-full max-w-lg -translate-x-1/2 transition-all duration-200",
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        )}
      >
        <Command
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          label="Paleta de comandos"
        >
          <div className="flex items-center border-b border-border px-4">
            <Search className="mr-3 h-5 w-5 text-muted-foreground" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Busca páginas, acciones..."
              className="flex h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
            />
            <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-block">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            {commands.map((group) => (
              <Command.Group
                key={group.group}
                heading={group.group}
                className="mb-2"
              >
                {group.items.map((item) => (
                  <Command.Item
                    key={item.label}
                    value={item.label}
                    onSelect={() => handleSelect(item.action)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-muted"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}

            {search && (
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No se encontraron resultados para &quot;{search}&quot;
              </Command.Empty>
            )}
          </Command.List>

          <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 font-medium">↑↓</kbd> Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 font-medium">↵</kbd> Abrir
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 font-medium">⌘K</kbd> Cerrar
            </span>
          </div>
        </Command>
      </div>
    </>
  )
}
