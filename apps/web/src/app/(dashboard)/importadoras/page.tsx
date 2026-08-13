"use client"

import { useRouter } from "next/navigation"
import { FolderOpen, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { useImportadoras } from "@/lib/queries"
import { type ColumnDef } from "@tanstack/react-table"
import type { Importadora } from "@shared/types"

const columns: ColumnDef<Importadora>[] = [
  { accessorKey: "codigo", header: "Código" },
  {
    accessorKey: "nombre",
    header: "Importadora",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.nombre}</p>
        {row.original.rfc && <p className="text-xs text-muted-foreground">{row.original.rfc}</p>}
      </div>
    ),
  },
  { accessorKey: "aduana_asignada", header: "Aduana", cell: ({ row }) => row.original.aduana_asignada ?? "—" },
  { accessorKey: "agente_aduanal", header: "Agente aduanal", cell: ({ row }) => row.original.agente_aduanal ?? "—" },
  { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email ?? "—" },
  { accessorKey: "telefono", header: "Teléfono", cell: ({ row }) => row.original.telefono ?? "—" },
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
    header: "Acciones",
    cell: ({ row }) => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.location.href = `/importadoras/${row.original.id}`}
      >
        Ver detalle
      </Button>
    ),
  },
]

export default function ImportadorasPage() {
  const router = useRouter()
  const { data: importadoras, isLoading } = useImportadoras()

  return (
    <div>
      <PageHeader title="Importadoras" description="Casas de importación y agentes aduanales">
        <Button onClick={() => router.push("/importadoras/nuevo")}>
          <Plus className="h-4 w-4" /> Nueva importadora
        </Button>
      </PageHeader>
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={importadoras ?? []}
          searchKey="nombre"
          searchPlaceholder="Buscar importadoras..."
          emptyIcon={FolderOpen}
          emptyTitle="No hay importadoras"
          emptyDescription="Registra tu primera importadora."
        />
      )}
    </div>
  )
}
