"use client"

import { useRouter } from "next/navigation"
import { Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { useClientes } from "@/lib/queries"
import { type ColumnDef } from "@tanstack/react-table"
import type { Cliente } from "@shared/types"

const columns: ColumnDef<Cliente>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
  },
  {
    accessorKey: "nombre",
    header: "Cliente",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.nombre}</p>
        {row.original.rfc && <p className="text-xs text-muted-foreground">{row.original.rfc}</p>}
      </div>
    ),
  },
  {
    accessorKey: "pais",
    header: "País",
  },
  {
    accessorKey: "limite_credito",
    header: "Límite Crédito",
    cell: ({ row }) => (
      <span className="font-medium">${Number(row.original.limite_credito).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "vendedor_nombre",
    header: "Vendedor",
    cell: ({ row }) => row.original.vendedor_nombre ?? "—",
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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.href = `/clientes/${row.original.id}`}
      >
        Ver detalle
      </Button>
    ),
  },
]

export default function ClientesPage() {
  const router = useRouter()
  const { data: clientes, isLoading } = useClientes()

  return (
    <div>
      <PageHeader title="Clientes" description="Gestión de clientes y cuentas">
        <Button onClick={() => router.push("/clientes/nuevo")}>
          <Plus className="h-4 w-4" /> Nuevo cliente
        </Button>
      </PageHeader>
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={clientes ?? []}
          searchKey="nombre"
          searchPlaceholder="Buscar clientes..."
          emptyIcon={Users}
          emptyTitle="No hay clientes"
          emptyDescription="Registra tu primer cliente para comenzar."
        />
      )}
    </div>
  )
}
