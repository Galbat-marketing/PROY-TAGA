"use client"

import { useState } from "react"
import { ArrowLeft, ClipboardList, Activity, User, Globe, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/shared/data-table"
import { useAuditoria } from "@/lib/queries"
import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

// ============================================
// Auditoria Log
// ============================================
interface AuditRow {
  id: string
  tabla: string
  operacion: string
  registro_id: string | null
  usuario_id: string | null
  usuario_nombre: string | null
  datos_previos: unknown
  datos_nuevos: unknown
  ip_address: string | null
  created_at: string
}

const operacionBadge: Record<string, "success" | "warning" | "destructive" | "info"> = {
  INSERT: "success",
  UPDATE: "warning",
  DELETE: "destructive",
}

const auditColumns: ColumnDef<AuditRow>[] = [
  {
    accessorKey: "created_at",
    header: "Fecha",
    cell: ({ row }) => (
      <span className="text-xs">
        {new Date(row.original.created_at).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "tabla",
    header: "Tabla",
    cell: ({ row }) => (
      <Badge variant="info" className="font-mono text-[10px]">
        {row.original.tabla}
      </Badge>
    ),
  },
  {
    accessorKey: "operacion",
    header: "Operación",
    cell: ({ row }) => (
      <Badge variant={operacionBadge[row.original.operacion] ?? "neutral"}>
        {row.original.operacion}
      </Badge>
    ),
  },
  {
    accessorKey: "usuario_nombre",
    header: "Usuario",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.usuario_nombre ?? "—"}
      </span>
    ),
  },
  { accessorKey: "ip_address", header: "IP", cell: ({ row }) => row.original.ip_address ?? "—" },
  {
    accessorKey: "registro_id",
    header: "Registro",
    cell: ({ row }) => (
      <span className="font-mono text-[10px]">
        {row.original.registro_id?.slice(0, 8) ?? "—"}
      </span>
    ),
  },
]

// ============================================
// Actividad Usuarios
// ============================================
interface ActividadRow {
  id: string
  usuario_id: string | null
  usuario_nombre: string | null
  accion: string
  modulo: string
  metadata: unknown
  ip_address: string | null
  created_at: string
}

const actividadColumns: ColumnDef<ActividadRow>[] = [
  {
    accessorKey: "created_at",
    header: "Fecha",
    cell: ({ row }) => (
      <span className="text-xs">
        {new Date(row.original.created_at).toLocaleString()}
      </span>
    ),
  },
  { accessorKey: "accion", header: "Acción" },
  {
    accessorKey: "modulo",
    header: "Módulo",
    cell: ({ row }) => (
      <Badge variant="info" className="font-mono text-[10px]">
        {row.original.modulo}
      </Badge>
    ),
  },
  {
    accessorKey: "usuario_nombre",
    header: "Usuario",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.usuario_nombre ?? "—"}
      </span>
    ),
  },
  { accessorKey: "ip_address", header: "IP", cell: ({ row }) => row.original.ip_address ?? "—" },
]

export default function AuditoriaPage() {
  const { data, isLoading } = useAuditoria()
  const [tab, setTab] = useState<"auditoria" | "actividad">("auditoria")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/configuracion">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auditoría</h1>
          <p className="text-sm text-muted-foreground">
            Registro de cambios y actividad de usuarios
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        <button
          onClick={() => setTab("auditoria")}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "auditoria"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Auditoría
        </button>
        <button
          onClick={() => setTab("actividad")}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "actividad"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="h-4 w-4" />
          Actividad
        </button>
      </div>

      {tab === "auditoria" ? (
        <DataTable
          columns={auditColumns}
          data={data?.auditoria ?? []}
          searchKey="tabla"
          searchPlaceholder="Filtrar por tabla..."
          emptyIcon={ClipboardList}
          emptyTitle="Sin registros"
          emptyDescription="No hay cambios registrados en la auditoría."
        />
      ) : (
        <DataTable
          columns={actividadColumns}
          data={data?.actividad ?? []}
          searchKey="accion"
          searchPlaceholder="Filtrar por acción..."
          emptyIcon={Activity}
          emptyTitle="Sin actividad"
          emptyDescription="No hay actividad registrada."
        />
      )}
    </div>
  )
}
