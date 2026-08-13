"use client"

import { useRouter } from "next/navigation"
import { Users, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { useCodificadores } from "@/lib/queries"
import { type ColumnDef } from "@tanstack/react-table"

interface Comercial {
  id: string
  codigo: string
  nombre: string
  activo: boolean
}

export default function ComercialesPage() {
  const router = useRouter()
  const { data: codificadores, isLoading } = useCodificadores()
  const comerciales = codificadores?.comerciales ?? []

  const columns: ColumnDef<Comercial>[] = [
    { accessorKey: "codigo", header: "Código" },
    { accessorKey: "nombre", header: "Nombre" },
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
        <Button variant="ghost" size="sm" onClick={() => router.push(`/comerciales/${row.original.id}`)}>
          <Eye className="h-4 w-4" /> Ver detalle
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Comerciales" description="Catálogo de comerciales" />
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={comerciales}
          searchKey="nombre"
          searchPlaceholder="Buscar comerciales..."
          emptyIcon={Users}
          emptyTitle="No hay comerciales"
          emptyDescription="Registra comerciales desde Configuración > Codificadores."
        />
      )}
    </div>
  )
}
