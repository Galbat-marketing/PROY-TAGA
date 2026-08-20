"use client"

import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Wallet, CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import type { Pago } from "@shared/types"
import { actualizarEstadoPago, eliminarPago } from "@/lib/actions/pagos"
import { toast } from "sonner"

const estadoBadge: Record<string, "success" | "warning" | "destructive" | "info" | "neutral"> = {
  pendiente_aprobacion: "warning",
  aprobado: "success",
  rechazado: "destructive",
  pagado: "success",
}

export default function PagoDetailPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string

  const [showAprobarForm, setShowAprobarForm] = useState(false)
  const [metodoPago, setMetodoPago] = useState("")
  const [referencia, setReferencia] = useState("")
  const [loading, setLoading] = useState(false)

  const { data: pago, isLoading, refetch } = useQuery<Pago>({
    queryKey: ["pagos", id],
    queryFn: () => fetch(`/api/pagos/${id}`).then(r => r.json()),
    enabled: !!id,
  })

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  if (!pago) {
    return <div className="py-16 text-center text-muted-foreground">Pago no encontrado</div>
  }

  async function handleCambiarEstado(estado: string) {
    try {
      await actualizarEstadoPago(id, estado)
      toast.success(`Pago ${estado === "aprobado" ? "aprobado" : estado === "pagado" ? "marcado como pagado" : estado === "rechazado" ? "rechazado" : "actualizado"} correctamente`)
      refetch()
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  async function handleAprobar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await actualizarEstadoPago(id, "pagado", { metodo_pago: metodoPago, referencia })
      toast.success("Pago marcado como pagado correctamente")
      setShowAprobarForm(false)
      refetch()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleEliminar() {
    if (!confirm("¿Eliminar este pago? Esta acción no se puede deshacer.")) return
    try {
      await eliminarPago(id)
      toast.success("Pago eliminado")
      await queryClient.invalidateQueries({ queryKey: ["pagos"], refetchType: "all" })
      router.push("/pagos")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Detalle de Pago" description={pago.proveedor_nombre ?? undefined}>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Pago a {pago.proveedor_nombre ?? pago.beneficiario ?? "proveedor"}</CardTitle>
                <Badge variant={estadoBadge[pago.estado] ?? "neutral"}>
                  {pago.estado.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Monto:</span> <span className="font-semibold">${Number(pago.monto).toLocaleString()}</span></div>
              <div><span className="text-muted-foreground">Moneda:</span> <span className="font-medium">{pago.moneda}</span></div>
              {pago.tipo_cambio && <div><span className="text-muted-foreground">Tipo Cambio:</span> <span className="font-medium">{pago.tipo_cambio}</span></div>}
              <div><span className="text-muted-foreground">Fecha:</span> <span className="font-medium">{new Date(pago.fecha_pago).toLocaleDateString()}</span></div>
              <div><span className="text-muted-foreground">Método:</span> <span className="font-medium">{pago.metodo_pago ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Referencia:</span> <span className="font-medium">{pago.referencia ?? "—"}</span></div>
              {pago.pagador_nombre && <div><span className="text-muted-foreground">Pagador:</span> <span className="font-medium">{pago.pagador_nombre}</span></div>}
            </div>
            {pago.notas && (
              <div className="pt-2">
                <span className="text-sm text-muted-foreground">Notas:</span>
                <p className="text-sm mt-1">{pago.notas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Acciones</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {pago.estado === "pendiente_aprobacion" && !showAprobarForm && (
              <>
                <Button className="w-full" onClick={() => setShowAprobarForm(true)}>
                  <CheckCircle className="h-4 w-4" /> Pagar
                </Button>
                <Button className="w-full" variant="destructive" onClick={() => handleCambiarEstado("rechazado")}>
                  <XCircle className="h-4 w-4" /> Rechazar pago
                </Button>
              </>
            )}
            {pago.estado === "aprobado" && (
              <Button className="w-full" onClick={() => handleCambiarEstado("pagado")}>
                <CheckCircle className="h-4 w-4" /> Marcar como pagado
              </Button>
            )}
            {showAprobarForm && (
              <form onSubmit={handleAprobar} className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Método de Pago *</label>
                  <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} required className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <option value="">Seleccionar...</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="cheque">Cheque</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="carta_de_credito">Carta de Crédito</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Referencia *</label>
                  <Input value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ej: REF-001" required />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1 gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Confirmar
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAprobarForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
            <Button className="w-full" variant="ghost" onClick={handleEliminar}>
              <Trash2 className="h-4 w-4" /> Eliminar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
