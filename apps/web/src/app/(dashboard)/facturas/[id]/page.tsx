"use client"

import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, FileText, CheckCircle, XCircle, Ban, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { useFactura } from "@/lib/queries"
import { actualizarEstadoFactura, eliminarFactura } from "@/lib/actions/facturas"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

const estadoBadge: Record<string, "success" | "warning" | "destructive" | "info" | "neutral"> = {
  pendiente: "warning",
  pagada: "success",
  parcial: "info",
  cancelada: "destructive",
  vencida: "destructive",
}

export default function FacturaDetailPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const { data: factura, isLoading, refetch } = useFactura(id)

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  if (!factura) {
    return <div className="py-16 text-center text-muted-foreground">Factura no encontrada</div>
  }

  async function handleCambiarEstado(estado: string) {
    try {
      await actualizarEstadoFactura(id, estado)
      toast.success(`Factura ${estado === "pagada" ? "marcada como pagada" : estado === "cancelada" ? "cancelada" : "actualizada"} correctamente`)
      refetch()
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  async function handleEliminar() {
    if (!confirm("¿Eliminar esta factura? Esta acción no se puede deshacer.")) return
    try {
      await eliminarFactura(id)
      toast.success("Factura eliminada")
      await queryClient.invalidateQueries({ queryKey: ["facturas"], refetchType: "all" })
      router.push("/facturas")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Factura ${factura.folio}`}
        description={factura.cliente_nombre ?? undefined}
      >
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-mono">{factura.folio}</CardTitle>
                <Badge variant={estadoBadge[factura.estado] ?? "neutral"}>
                  {factura.estado.charAt(0).toUpperCase() + factura.estado.slice(1)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Cliente:</span> <span className="font-medium">{factura.cliente_nombre ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Tipo:</span> <span className="font-medium">{factura.tipo}</span></div>
              <div><span className="text-muted-foreground">Moneda:</span> <span className="font-medium">{factura.moneda}</span></div>
              {factura.tipo_cambio && <div><span className="text-muted-foreground">Tipo Cambio:</span> <span className="font-medium">{factura.tipo_cambio}</span></div>}
              <div><span className="text-muted-foreground">Emisión:</span> <span className="font-medium">{new Date(factura.fecha_emision).toLocaleDateString()}</span></div>
              <div><span className="text-muted-foreground">Vencimiento:</span> <span className="font-medium">{factura.fecha_vencimiento ? new Date(factura.fecha_vencimiento).toLocaleDateString() : "—"}</span></div>
              {factura.uuid_cfdi && <div className="col-span-2"><span className="text-muted-foreground">UUID CFDI:</span> <span className="font-mono text-xs">{factura.uuid_cfdi}</span></div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Acciones</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {factura.estado === "pendiente" && (
              <>
                <Button className="w-full" onClick={() => handleCambiarEstado("pagada")}>
                  <CheckCircle className="h-4 w-4" /> Marcar como pagada
                </Button>
                <Button className="w-full" variant="destructive" onClick={() => handleCambiarEstado("cancelada")}>
                  <XCircle className="h-4 w-4" /> Cancelar factura
                </Button>
              </>
            )}
            {factura.estado === "parcial" && (
              <Button className="w-full" onClick={() => handleCambiarEstado("pagada")}>
                <CheckCircle className="h-4 w-4" /> Marcar como pagada
              </Button>
            )}
            {factura.estado === "vencida" && (
              <Button className="w-full" variant="destructive" onClick={() => handleCambiarEstado("cancelada")}>
                <Ban className="h-4 w-4" /> Cancelar factura
              </Button>
            )}
            <Button className="w-full" variant="ghost" onClick={handleEliminar}>
              <Trash2 className="h-4 w-4" /> Eliminar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Totales</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${Number(factura.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IVA</span>
              <span>${Number(factura.iva).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
              <span>Total</span>
              <span>${Number(factura.total).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
