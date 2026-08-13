"use client"

import { useRouter } from "next/navigation"
import { Plus, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { useProveedores } from "@/lib/queries"
import { type ColumnDef } from "@tanstack/react-table"
import type { Proveedor } from "@shared/types"

const columns: ColumnDef<Proveedor>[] = [
  { accessorKey: "codigo", header: "Código" },
  {
    accessorKey: "nombre",
    header: "Proveedor",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.nombre}</p>
        {row.original.rfc && <p className="text-xs text-muted-foreground">{row.original.rfc}</p>}
      </div>
    ),
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
    cell: ({ row }) => row.original.telefono ?? "—",
  },
  { accessorKey: "pais", header: "País" },
  {
    accessorKey: "tipo_proveedor",
    header: "Tipo",
    cell: ({ row }) => row.original.tipo_proveedor ?? "—",
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`h-2 w-2 rounded-full ${i < row.original.rating ? "bg-warning" : "bg-muted"}`} />
        ))}
      </div>
    ),
  },
]

export default function ProveedoresPage() {
  const router = useRouter()
  const { data: proveedores, isLoading } = useProveedores()

  return (
    <div>
      <PageHeader title="Proveedores" description="Catálogo de proveedores">
        <Button onClick={() => router.push("/proveedores/nuevo")}>
          <Plus className="h-4 w-4" /> Nuevo proveedor
        </Button>
      </PageHeader>
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={proveedores ?? []}
          searchKey="nombre"
          searchPlaceholder="Buscar proveedores..."
          emptyIcon={Truck}
          emptyTitle="No hay proveedores"
          emptyDescription="Registra tu primer proveedor."
        />
      )}
    </div>
  )
}
