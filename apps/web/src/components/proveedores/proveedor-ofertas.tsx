"use client"

import { Receipt, CircleCheck, CircleAlert, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/data-table"
import { useOfertasPorProveedor } from "@/lib/queries"
import { type ColumnDef } from "@tanstack/react-table"
import type { Oferta } from "@shared/types"

const estadoBadge: Record<string, "success" | "warning" | "destructive" | "info" | "neutral"> = {
  aceptada: "success",
  borrador: "warning",
  enviada: "info",
  rechazada: "destructive",
  convertida: "success",
}

function fmt(n: number) {
  return `$${n.toLocaleString()}`
}

function resumenPagos(oferta: Oferta) {
  const pagos = oferta.pagos ?? []
  let pagado = 0
  let pendiente = 0
  for (const p of pagos) {
    if (p.estado === "pagado") pagado += Number(p.monto) || 0
    else if (p.estado === "pendiente_aprobacion" || p.estado === "aprobado") pendiente += Number(p.monto) || 0
  }
  return { pagado, pendiente, total: pagado + pendiente }
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
    accessorKey: "estado",
    header: "Estado oferta",
    cell: ({ row }) => (
      <Badge variant={estadoBadge[row.original.estado] ?? "neutral"}>
        {row.original.estado.charAt(0).toUpperCase() + row.original.estado.slice(1)}
      </Badge>
    ),
  },
  {
    id: "monto_pagar",
    header: "Total por pagar",
    cell: ({ row }) => {
      const { total } = resumenPagos(row.original)
      return <span className="font-semibold">{total > 0 ? fmt(total) : "—"}</span>
    },
  },
  {
    id: "pagado",
    header: "Pagado",
    cell: ({ row }) => {
      const { pagado } = resumenPagos(row.original)
      return <span className="font-medium text-success">{pagado > 0 ? fmt(pagado) : "—"}</span>
    },
  },
  {
    id: "pendiente",
    header: "Pendiente",
    cell: ({ row }) => {
      const { pendiente } = resumenPagos(row.original)
      return <span className="font-medium text-warning">{pendiente > 0 ? fmt(pendiente) : "—"}</span>
    },
  },
  {
    id: "estado_pago",
    header: "Pago",
    cell: ({ row }) => {
      const { pagado, pendiente } = resumenPagos(row.original)
      if (pendiente > 0) {
        return (
          <Badge variant="warning">
            <CircleAlert className="h-3 w-3" /> Pendiente
          </Badge>
        )
      }
      if (pagado > 0) {
        return (
          <Badge variant="success">
            <CircleCheck className="h-3 w-3" /> Pagado
          </Badge>
        )
      }
      return <Badge variant="neutral">Sin pagos</Badge>
    },
  },
  {
    id: "acciones",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" onClick={() => window.location.href = `/ofertas/${row.original.id}`}>
        <Eye className="h-4 w-4" /> Ver detalle
      </Button>
    ),
  },
]

interface ProveedorOfertasProps {
  proveedorId: string
}

export function ProveedorOfertas({ proveedorId }: ProveedorOfertasProps) {
  const { data: ofertas, isLoading } = useOfertasPorProveedor(proveedorId)

  const totales = (ofertas ?? []).reduce(
    (acc, o) => {
      const { pagado, pendiente } = resumenPagos(o)
      acc.pagado += pagado
      acc.pendiente += pendiente
      return acc
    },
    { pagado: 0, pendiente: 0 }
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Receipt className="h-5 w-5" />
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Ofertas relacionadas</CardTitle>
              <p className="text-sm text-muted-foreground">
                {ofertas?.length ? `${ofertas.length} oferta(s) con este proveedor` : "Sin ofertas con este proveedor"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm">
                <CircleCheck className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">Pagado:</span>
                <span className="font-semibold text-success">{fmt(totales.pagado)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm">
                <CircleAlert className="h-4 w-4 text-warning" />
                <span className="text-muted-foreground">Por pagar:</span>
                <span className="font-semibold text-warning">{fmt(totales.pendiente)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={ofertas ?? []}
            searchKey="folio"
            searchPlaceholder="Buscar ofertas..."
            emptyIcon={Receipt}
            emptyTitle="No hay ofertas"
            emptyDescription="Las ofertas que incluyan a este proveedor aparecerán aquí."
          />
        )}
      </CardContent>
    </Card>
  )
}