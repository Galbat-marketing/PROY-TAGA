"use client"

import { Anchor, Plus, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { useEmbarques } from "@/lib/queries"
import { type ColumnDef } from "@tanstack/react-table"
import type { Embarque } from "@shared/types"

const estadoBadge: Record<string, "success" | "warning" | "destructive" | "info" | "neutral"> = {
  programado: "info",
  en_transito: "warning",
  en_aduana: "destructive",
  liberado: "success",
  entregado: "success",
  cancelado: "neutral",
}

const columns: ColumnDef<Embarque>[] = [
  {
    accessorKey: "contenedor_numero",
    header: "Contenedor",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium">{row.original.contenedor_numero ?? "—"}</span>
    ),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={estadoBadge[row.original.estado] ?? "neutral"}>
        {row.original.estado.replace(/_/g, " ")}
      </Badge>
    ),
  },
  { accessorKey: "ubicacion_actual", header: "Ubicación", cell: ({ row }) => row.original.ubicacion_actual ?? "—" },
  { accessorKey: "descripcion", header: "Descripción", cell: ({ row }) => row.original.descripcion ?? "—" },
  {
    accessorKey: "fecha_evento",
    header: "Fecha",
    cell: ({ row }) => new Date(row.original.fecha_evento).toLocaleString(),
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" onClick={() => window.location.href = `/embarques/${row.original.id}`}>
        <Eye className="h-4 w-4" /> Ver detalle
      </Button>
    ),
  },
]

export default function EmbarquesPage() {
  const { data: embarques, isLoading } = useEmbarques()

  return (
    <div>
      <PageHeader title="Embarques" description="Eventos y seguimiento de embarques">
        <Button onClick={() => window.location.href = "/embarques/nuevo"}>
          <Plus className="h-4 w-4" /> Nuevo embarque
        </Button>
      </PageHeader>
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={embarques ?? []}
          searchKey="contenedor_numero"
          searchPlaceholder="Buscar embarques..."
          emptyIcon={Anchor}
          emptyTitle="No hay embarques"
          emptyDescription="Los eventos de embarque aparecerán aquí."
        />
      )}
    </div>
  )
}
