"use client"

import { FileText, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { useFacturas } from "@/lib/queries"
import { useRouter } from "next/navigation"
import { type ColumnDef } from "@tanstack/react-table"
import type { Factura } from "@shared/types"

const estadoBadge: Record<string, "success" | "warning" | "destructive" | "info" | "neutral"> = {
  pendiente: "warning",
  pagada: "success",
  parcial: "info",
  cancelada: "destructive",
  vencida: "destructive",
}

const columns: ColumnDef<Factura>[] = [
  {
    accessorKey: "folio",
    header: "Folio",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium">{row.original.folio}</span>
    ),
  },
  {
    accessorKey: "cliente_nombre",
    header: "Cliente",
    cell: ({ row }) => row.original.cliente_nombre ?? "—",
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-semibold">
        ${Number(row.original.total).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={estadoBadge[row.original.estado] ?? "neutral"}>
        {row.original.estado.charAt(0).toUpperCase() + row.original.estado.slice(1)}
      </Badge>
    ),
  },
  {
    accessorKey: "fecha_emision",
    header: "Emisión",
    cell: ({ row }) => new Date(row.original.fecha_emision).toLocaleDateString(),
  },
  {
    accessorKey: "fecha_vencimiento",
    header: "Vencimiento",
    cell: ({ row }) =>
      row.original.fecha_vencimiento
        ? new Date(row.original.fecha_vencimiento).toLocaleDateString()
        : "—",
  },
  {
    id: "acciones",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" onClick={() => window.location.href = `/facturas/${row.original.id}`}>
        <Eye className="h-4 w-4" /> Ver detalle
      </Button>
    ),
  },
]

export default function FacturasPage() {
  const router = useRouter()
  const { data: facturas, isLoading } = useFacturas()

  return (
    <div>
      <PageHeader title="Facturas" description="Gestión de facturación y CFDI" />
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={facturas ?? []}
          searchKey="folio"
          searchPlaceholder="Buscar facturas..."
          emptyIcon={FileText}
          emptyTitle="No hay facturas"
          emptyDescription="Las facturas aparecerán aquí."
        />
      )}
    </div>
  )
}
