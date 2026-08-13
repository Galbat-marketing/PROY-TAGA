"use client"

import { useRouter } from "next/navigation"
import { Plus, Pencil, Package, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { useProductos } from "@/lib/queries"
import { type ColumnDef } from "@tanstack/react-table"
import type { Producto } from "@shared/types"

const columns: ColumnDef<Producto>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.nombre}</p>
        {row.original.descripcion && (
          <p className="text-xs text-muted-foreground truncate max-w-xs">{row.original.descripcion}</p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "categoria_nombre",
    header: "Categoría",
    cell: ({ row }) => row.original.categoria_nombre ?? "—",
  },
  {
    accessorKey: "precio_base",
    header: "Precio Base",
    cell: ({ row }) => (
      <span className="font-medium">
        ${Number(row.original.precio_base).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "moneda",
    header: "Moneda",
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.activo ? "success" : "neutral"}>
        {row.original.activo ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    id: "acciones",
    header: "",
    cell: ({ row }) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => window.location.href = `/productos/${row.original.id}`}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => window.location.href = `/productos/${row.original.id}/edit`}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
]

export default function ProductosPage() {
  const router = useRouter()
  const { data: productos, isLoading } = useProductos()

  return (
    <div>
      <PageHeader
        title="Productos"
        description="Catálogo de productos y servicios"
      >
        <Button onClick={() => router.push("/productos/nuevo")}>
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={productos ?? []}
          searchKey="nombre"
          searchPlaceholder="Buscar productos..."
          emptyIcon={Package}
          emptyTitle="No hay productos"
          emptyDescription="Crea tu primer producto para comenzar a vender."
        />
      )}
    </div>
  )
}
