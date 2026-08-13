"use client"

import { useRouter, useParams } from "next/navigation"
import { useState, useMemo } from "react"
import { ArrowLeft, Users, Edit, Trash2, Eye, DollarSign, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { DateRangePicker } from "@/components/shared/date-range-picker"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { eliminarComercial } from "@/lib/actions/codificadores"
import { toast } from "sonner"
import { type ColumnDef } from "@tanstack/react-table"
import { type SemanaComision } from "@/lib/actions/comisiones"
import type { DateRange } from "react-day-picker"
import { parseISO, startOfDay, endOfDay } from "date-fns"

interface Comercial {
  id: string
  codigo: string
  nombre: string
  activo: boolean
}

interface OfertaRow {
  id: string
  folio: string
  cliente_nombre: string | null
  total: number
  moneda: string
  estado: string
  created_at: string
}

const estadoBadge: Record<string, "success" | "warning" | "destructive" | "info" | "neutral"> = {
  aceptada: "success",
  borrador: "warning",
  enviada: "info",
  rechazada: "destructive",
  convertida: "success",
}

export default function ComercialDetailPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [confirmarPago, setConfirmarPago] = useState<SemanaComision | null>(null)

  const { data: comercial, isLoading } = useQuery<Comercial>({
    queryKey: ["comerciales", id],
    queryFn: () => fetch(`/api/comerciales/${id}`).then(r => r.json()),
    enabled: !!id,
  })

  const { data: ofertas = [], isLoading: ofertasLoading } = useQuery<OfertaRow[]>({
    queryKey: ["ofertas", "por-comercial", id],
    queryFn: async () => {
      const { getOfertasByComercial } = await import("@/lib/actions/ofertas")
      return getOfertasByComercial(id)
    },
    enabled: !!id,
  })

  const { data: comisiones = [], isLoading: comisionesLoading } = useQuery<SemanaComision[]>({
    queryKey: ["comisiones", "semanales", id],
    queryFn: async () => {
      const { getComisionesSemanales } = await import("@/lib/actions/comisiones")
      return getComisionesSemanales(id)
    },
    enabled: !!id,
  })

  const comisionesFiltradas = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return comisiones
    return comisiones.filter((c) => {
      const weekStart = parseISO(c.semana_inicio)
      const weekEnd = endOfDay(new Date(weekStart))
      weekEnd.setDate(weekEnd.getDate() + 6)
      if (dateRange.from && dateRange.to) {
        return weekStart <= endOfDay(dateRange.to) && weekEnd >= startOfDay(dateRange.from)
      }
      if (dateRange.from) {
        return weekEnd >= startOfDay(dateRange.from)
      }
      if (dateRange.to) {
        return weekStart <= endOfDay(dateRange.to)
      }
      return true
    })
  }, [comisiones, dateRange])

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  if (!comercial) {
    return <div className="py-16 text-center text-muted-foreground">Comercial no encontrado</div>
  }

  async function handleEliminar() {
    if (!confirm("¿Eliminar este comercial? Esta acción no se puede deshacer.")) return
    try {
      await eliminarComercial(id)
      toast.success("Comercial eliminado")
      await queryClient.invalidateQueries({ queryKey: ["comerciales"], refetchType: "all" })
      await queryClient.invalidateQueries({ queryKey: ["codificadores"], refetchType: "all" })
      router.push("/comerciales")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  async function handleMarcarPagado(semana: SemanaComision) {
    try {
      if (semana.pago_id) {
        const { marcarComisionPagada } = await import("@/lib/actions/comisiones")
        await marcarComisionPagada(semana.pago_id)
      } else {
        const { crearPagoComision } = await import("@/lib/actions/comisiones")
        await crearPagoComision(id, semana.semana_inicio, semana.comision)
      }
      toast.success("Comisión marcada como pagada")
      setConfirmarPago(null)
      await queryClient.invalidateQueries({ queryKey: ["comisiones", "semanales", id] })
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  function semanaLabel(semana: SemanaComision): string {
    const d = new Date(semana.semana_inicio + "T00:00:00")
    const fin = new Date(d)
    fin.setDate(fin.getDate() + 6)
    return `${d.toLocaleDateString()} — ${fin.toLocaleDateString()}`
  }

  const comisionesColumns: ColumnDef<SemanaComision>[] = [
    {
      accessorKey: "semana_inicio",
      header: "Semana",
      cell: ({ row }) => {
        const d = new Date(row.original.semana_inicio + "T00:00:00")
        const fin = new Date(d)
        fin.setDate(fin.getDate() + 6)
        return (
          <span className="font-medium">
            {d.toLocaleDateString()} — {fin.toLocaleDateString()}
          </span>
        )
      },
    },
    {
      accessorKey: "ventas",
      header: "Ventas",
      cell: ({ row }) => <span className="font-semibold">{row.original.ventas}</span>,
    },
    {
      accessorKey: "total_ventas",
      header: "Total Ventas",
      cell: ({ row }) => (
        <span className="font-semibold">${Number(row.original.total_ventas).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: "comision",
      header: "Comisión (1%)",
      cell: ({ row }) => (
        <span className="font-semibold text-emerald-600">${Number(row.original.comision).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={row.original.estado === "realizado" ? "success" : "warning"}>
          {row.original.estado === "realizado" ? "Realizado" : "Pendiente"}
        </Badge>
      ),
    },
    {
      id: "acciones",
      header: "",
      cell: ({ row }) =>
        row.original.estado === "pendiente" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmarPago(row.original)}
          >
            <CheckCircle className="h-4 w-4 mr-1" /> Pagado
          </Button>
        ) : null,
    },
  ]

  const ofertasColumns: ColumnDef<OfertaRow>[] = [
    { accessorKey: "folio", header: "Folio" },
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
          ${Number(row.original.total).toLocaleString()} {row.original.moneda}
        </span>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={estadoBadge[row.original.estado] ?? "neutral"}>
          {row.original.estado}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Fecha",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      id: "acciones",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => router.push(`/ofertas/${row.original.id}`)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title={comercial.nombre} description={`Código: ${comercial.codigo}`}>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <Button variant="outline" onClick={() => router.push(`/comerciales/${id}/edit`)}>
          <Edit className="h-4 w-4" /> Editar
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{comercial.nombre}</CardTitle>
                <Badge variant={comercial.activo ? "success" : "neutral"}>
                  {comercial.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Código:</span> <span className="font-medium">{comercial.codigo}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Acciones</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="destructive" onClick={handleEliminar}>
              <Trash2 className="h-4 w-4" /> Eliminar comercial
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Comisiones semanales */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Comisiones Semanales (1%)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {comisionesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : comisiones.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <DollarSign className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>Sin comisiones</p>
              <p className="text-sm">No hay ventas con cobro registradas para este comercial.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <DateRangePicker value={dateRange} onChange={setDateRange} />
              <DataTable
                columns={comisionesColumns}
                data={comisionesFiltradas}
                emptyIcon={DollarSign}
                emptyTitle="Sin comisiones"
                emptyDescription="No hay ventas con cobro registradas para este comercial."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ofertas del comercial */}
      <Card>
        <CardHeader>
          <CardTitle>Ofertas</CardTitle>
        </CardHeader>
        <CardContent>
          {ofertasLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <DataTable
              columns={ofertasColumns}
              data={ofertas}
              searchKey="folio"
              searchPlaceholder="Buscar ofertas..."
              emptyIcon={Eye}
              emptyTitle="Sin ofertas"
              emptyDescription="Este comercial no tiene ofertas asignadas."
            />
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={!!confirmarPago}
        onOpenChange={(open) => { if (!open) setConfirmarPago(null) }}
        title="Confirmar pago de comisión"
        description={
          confirmarPago
            ? `¿Estás seguro de marcar como pagada la comisión de $${Number(confirmarPago.comision).toLocaleString()} correspondiente a la semana del ${semanaLabel(confirmarPago)}?`
            : ""
        }
        confirmLabel="Sí, pagar"
        cancelLabel="Cancelar"
        variant="primary"
        onConfirm={() => confirmarPago && handleMarcarPagado(confirmarPago)}
      />
    </div>
  )
}
