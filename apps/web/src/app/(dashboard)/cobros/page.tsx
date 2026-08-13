"use client"

import { CreditCard, Wallet, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { useCobros } from "@/lib/queries"
import { type ColumnDef } from "@tanstack/react-table"
import type { Cobro } from "@shared/types"

const columns: ColumnDef<Cobro>[] = [
  {
    accessorKey: "factura_folio",
    header: "Factura",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium">{row.original.factura_folio ?? "—"}</span>
    ),
  },
  { accessorKey: "cliente_nombre", header: "Cliente", cell: ({ row }) => row.original.cliente_nombre ?? "—" },
  {
    accessorKey: "monto",
    header: "Monto",
    cell: ({ row }) => (
      <span className="font-semibold">${Number(row.original.monto).toLocaleString()}</span>
    ),
  },
  { accessorKey: "metodo_pago", header: "Método", cell: ({ row }) => row.original.metodo_pago ?? "—" },
  { accessorKey: "referencia", header: "Referencia", cell: ({ row }) => row.original.referencia ?? "—" },
  {
    accessorKey: "fecha_cobro",
    header: "Fecha",
    cell: ({ row }) => new Date(row.original.fecha_cobro).toLocaleDateString(),
  },
  {
    id: "acciones",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" onClick={() => window.location.href = `/cobros/${row.original.id}`}>
        <Eye className="h-4 w-4" /> Ver detalle
      </Button>
    ),
  },
]

export default function CobrosPage() {
  const { data: cobros, isLoading } = useCobros()

  return (
    <div>
      <PageHeader title="Cobros" description="Registro de cobros y pagos recibidos" />
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={cobros ?? []}
          searchKey="factura_folio"
          searchPlaceholder="Buscar cobros..."
          emptyIcon={Wallet}
          emptyTitle="No hay cobros"
          emptyDescription="Los cobros registrados aparecerán aquí."
        />
      )}
    </div>
  )
}
