"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  FileText,
  Container,
  Ship,
  DollarSign,
  CreditCard,
  Wallet,
  FolderOpen,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Star,
  FileArchive,
  ClipboardList,
  BadgeCheck,
  KeyRound,
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
}

const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Ofertas", href: "/ofertas", icon: FileText },
  { label: "Productos", href: "/productos", icon: Package },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Proveedores", href: "/proveedores", icon: Truck },
]

const operationsNav: NavItem[] = [
  { label: "Contenedores", href: "/contenedores", icon: Container },
  { label: "Embarques", href: "/embarques", icon: Ship },
  { label: "Importadoras", href: "/importadoras", icon: FolderOpen },
]

const docsNav: NavItem[] = [
  { label: "Documentos", href: "/documentos", icon: FileArchive },
]

const financeNav: NavItem[] = [
  { label: "Facturas", href: "/facturas", icon: DollarSign },
  { label: "Cobros", href: "/cobros", icon: CreditCard },
  { label: "Pagos", href: "/pagos", icon: Wallet },
]

const bottomNav: NavItem[] = [
  { label: "Reportes", href: "/reportes", icon: FileBarChart },
  { label: "Comerciales", href: "/comerciales", icon: Users },
  { label: "Roles", href: "/configuracion/roles", icon: BadgeCheck },
  { label: "Permisos", href: "/configuracion/permisos", icon: KeyRound },
  { label: "Auditoría", href: "/configuracion/auditoria", icon: ClipboardList },
  { label: "Configuración", href: "/configuracion", icon: Settings },
]

const favorites: NavItem[] = [
  { label: "Ofertas", href: "/ofertas", icon: Star },
  { label: "Dashboard", href: "/dashboard", icon: Star },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href)
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          active
            ? "bg-sidebar-accent text-white"
            : "text-sidebar-foreground/70 hover:bg-sidebar-muted hover:text-sidebar-foreground",
          collapsed && "justify-center px-2"
        )}
        title={collapsed ? item.label : undefined}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!collapsed && (
          <>
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    )
  }

  const renderSection = (title: string, items: NavItem[]) => (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/40">
          {title}
        </p>
      )}
      {items.map(renderNavItem)}
    </div>
  )

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-muted px-4",
          collapsed && "justify-center px-0"
        )}
      >
        {collapsed ? (
          <span className="text-xl font-bold text-sidebar-foreground">T</span>
        ) : (
          <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
            TAGA
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-3 scrollbar-thin">
        {/* Favorites */}
        {!collapsed && renderSection("Favoritos", favorites)}

        {renderSection("Principal", mainNav)}
        {renderSection("Operaciones", operationsNav)}
        {renderSection("Documentos", docsNav)}
        {renderSection("Finanzas", financeNav)}
        {renderSection("Sistema", bottomNav)}
      </nav>

      {/* Collapse button */}
      <div className="border-t border-sidebar-muted p-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-muted hover:text-sidebar-foreground"
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
