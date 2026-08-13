"use client"

import { useRouter } from "next/navigation"
import { Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { useOfertas } from "@/lib/queries"
import { type ColumnDef } from "@tanstack/react-table"
import type { Oferta } from "@shared/types"

const estadoBadge: Record<string, "success" | "warning" | "destructive" | "info" | "neutral"> = {
  aceptada: "success",
  borrador: "warning",
  enviada: "info",
  rechazada: "destructive",
  convertida: "success",
}

const columns: ColumnDef<Oferta>[] = [
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
    accessorKey: "comercial_nombre",
    header: "Comercial",
    cell: ({ row }) => row.original.comercial_nombre ?? "—",
  },
  {
    id: "acciones",
    header: "",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.href = `/ofertas/${row.original.id}`}
      >
        Ver detalle
      </Button>
    ),
  },
]

export default function OfertasPage() {
  const router = useRouter()
  const { data: ofertas, isLoading } = useOfertas()

  return (
    <div>
      <PageHeader title="Ofertas" description="Gestión de cotizaciones y ofertas comerciales">
        <Button onClick={() => router.push("/ofertas/nueva")}>
          <Plus className="h-4 w-4" /> Nueva oferta
        </Button>
      </PageHeader>
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={ofertas ?? []}
          searchKey="folio"
          searchPlaceholder="Buscar ofertas..."
          emptyIcon={FileText}
          emptyTitle="No hay ofertas"
          emptyDescription="Crea tu primera oferta comercial."
        />
      )}
    </div>
  )
}
