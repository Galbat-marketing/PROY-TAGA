"use client"

import { useRouter } from "next/navigation"
import { Wallet, ArrowUpRight, Plus, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { usePagos } from "@/lib/queries"
import { type ColumnDef } from "@tanstack/react-table"
import type { Pago } from "@shared/types"

const estadoBadge: Record<string, "success" | "warning" | "destructive" | "info" | "neutral"> = {
  pendiente_aprobacion: "warning",
  aprobado: "success",
  rechazado: "destructive",
  pagado: "success",
}

const columns: ColumnDef<Pago>[] = [
  {
    id: "beneficiario",
    header: "Beneficiario",
    cell: ({ row }) => row.original.proveedor_nombre ?? row.original.beneficiario ?? "—",
  },
  {
    accessorKey: "monto",
    header: "Monto",
    cell: ({ row }) => (
      <span className="font-semibold">${Number(row.original.monto).toLocaleString()}</span>
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
  { accessorKey: "metodo_pago", header: "Método", cell: ({ row }) => row.original.metodo_pago ?? "—" },
  { accessorKey: "referencia", header: "Referencia", cell: ({ row }) => row.original.referencia ?? "—" },
  {
    accessorKey: "fecha_pago",
    header: "Fecha",
    cell: ({ row }) => new Date(row.original.fecha_pago).toLocaleDateString(),
  },
  {
    id: "acciones",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" onClick={() => window.location.href = `/pagos/${row.original.id}`}>
        <Eye className="h-4 w-4" /> Ver detalle
      </Button>
    ),
  },
]

export default function PagosPage() {
  const router = useRouter()
  const { data: pagos, isLoading } = usePagos()

  return (
    <div>
      <PageHeader title="Pagos" description="Registro de pagos a proveedores y terceros">
        <Button onClick={() => router.push("/pagos/nuevo")}>
          <Plus className="h-4 w-4" />
          Nuevo pago
        </Button>
      </PageHeader>
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={pagos ?? []}
          searchKey="proveedor_nombre"
          searchPlaceholder="Buscar pagos..."
          emptyIcon={ArrowUpRight}
          emptyTitle="No hay pagos"
          emptyDescription="Los pagos registrados aparecerán aquí."
        />
      )}
    </div>
  )
}
