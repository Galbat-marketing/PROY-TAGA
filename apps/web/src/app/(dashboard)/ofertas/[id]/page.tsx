"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, FileText, Send, CheckCircle, XCircle, Trash2, Loader2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { EntityDocuments } from "@/components/shared/entity-documents"
import { useOferta } from "@/lib/queries"
import { actualizarEstadoOferta, aprobarOferta, eliminarOferta } from "@/lib/actions/ofertas"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

const estadoColor: Record<string, "success" | "warning" | "destructive" | "info" | "neutral"> = {
  aceptada: "success",
  borrador: "warning",
  enviada: "info",
  rechazada: "destructive",
  convertida: "success",
}

export default function OfertaDetailPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const { data: oferta, isLoading } = useOferta(id)

  const [showAprobar, setShowAprobar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    condiciones_pago: "",
    incoterm: "",
    tipo_cambio: "",
    descuento_global: "0",
    fecha_vigencia: "",
    notas_internas: "",
    porcentaje_ganancia: "",
    metodo_pago: "",
    referencia: "",
  })
  const [formError, setFormError] = useState("")

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  if (!oferta) {
    return <div className="py-16 text-center text-muted-foreground">Oferta no encontrada</div>
  }

  async function handleCambiarEstado(estado: string) {
    try {
      await actualizarEstadoOferta(id, estado)
      toast.success(`Oferta ${estado === "aceptada" ? "aceptada" : estado === "enviada" ? "enviada" : "rechazada"} correctamente`)
      await queryClient.invalidateQueries({ queryKey: ["ofertas"], refetchType: "all" })
      router.push("/ofertas")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  async function handleAprobar(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")
    setLoading(true)
    try {
      await aprobarOferta(id, {
        condiciones_pago: form.condiciones_pago,
        incoterm: form.incoterm,
        tipo_cambio: Number(form.tipo_cambio),
        descuento_global: Number(form.descuento_global),
        fecha_vigencia: form.fecha_vigencia,
        notas_internas: form.notas_internas || null,
        porcentaje_ganancia: form.porcentaje_ganancia ? Number(form.porcentaje_ganancia) : undefined,
        metodo_pago: form.metodo_pago,
        referencia: form.referencia,
      })
      toast.success("Oferta aceptada correctamente")
      await queryClient.invalidateQueries({ queryKey: ["ofertas"], refetchType: "all" })
      router.push("/ofertas")
    } catch (error) {
      setFormError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleEliminar() {
    if (!confirm("¿Eliminar esta oferta? Esta acción no se puede deshacer.")) return
    try {
      await eliminarOferta(id)
      toast.success("Oferta eliminada")
      await queryClient.invalidateQueries({ queryKey: ["ofertas"], refetchType: "all" })
      router.push("/ofertas")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Oferta ${oferta.folio}`} description={`Creada el ${new Date(oferta.fecha_emision).toLocaleDateString()}`}>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        {oferta.estado === "borrador" && (
          <Button variant="warning" onClick={() => router.push(`/ofertas/${id}/edit`)}>
            <Edit className="h-4 w-4" /> Editar
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Cliente:</span> <span className="font-medium">{oferta.cliente_nombre ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Comercial:</span> <span className="font-medium">{oferta.comercial_nombre ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Estado:</span> <Badge variant={estadoColor[oferta.estado] ?? "neutral"}>{oferta.estado}</Badge></div>
              <div><span className="text-muted-foreground">Moneda:</span> <span className="font-medium">{oferta.moneda}</span></div>
              {oferta.incoterm && <div><span className="text-muted-foreground">Incoterm:</span> <span className="font-medium">{oferta.incoterm}</span></div>}
              {oferta.condiciones_pago && <div><span className="text-muted-foreground">Condiciones:</span> <span className="font-medium">{oferta.condiciones_pago}</span></div>}
              {oferta.fecha_vigencia && <div><span className="text-muted-foreground">Vigencia:</span> <span className="font-medium">{new Date(oferta.fecha_vigencia).toLocaleDateString()}</span></div>}
              {oferta.porcentaje_ganancia != null && <div><span className="text-muted-foreground">% Ganancia:</span> <span className="font-medium">{oferta.porcentaje_ganancia}%</span></div>}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader><CardTitle>Acciones</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {oferta.estado === "borrador" && (
              <Button className="w-full" onClick={() => handleCambiarEstado("enviada")}>
                <Send className="h-4 w-4" /> Enviar oferta
              </Button>
            )}
            {oferta.estado === "enviada" && (
              <>
                <Button className="w-full" onClick={() => setShowAprobar(!showAprobar)}>
                  <CheckCircle className="h-4 w-4" /> Aceptar
                </Button>
                <Button className="w-full" variant="destructive" onClick={() => handleCambiarEstado("rechazada")}>
                  <XCircle className="h-4 w-4" /> Rechazar
                </Button>
              </>
            )}
            <Button className="w-full" variant="secondary">
              <FileText className="h-4 w-4" /> Generar PDF
            </Button>
            <Button className="w-full" variant="ghost" onClick={handleEliminar}>
              <Trash2 className="h-4 w-4" /> Eliminar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Approval form */}
      {showAprobar && (
        <Card>
          <CardHeader>
            <CardTitle>Datos para aprobación</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAprobar} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Condiciones de Pago *</label>
                  <Input value={form.condiciones_pago} onChange={(e) => setForm({ ...form, condiciones_pago: e.target.value })} placeholder="Ej: 30 días" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Incoterm *</label>
                  <select value={form.incoterm} onChange={(e) => setForm({ ...form, incoterm: e.target.value })} required className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <option value="">Seleccionar...</option>
                    <option value="FOB">FOB</option>
                    <option value="CIF">CIF</option>
                    <option value="EXW">EXW</option>
                    <option value="DDP">DDP</option>
                    <option value="FCA">FCA</option>
                    <option value="CFR">CFR</option>
                    <option value="CPT">CPT</option>
                    <option value="CIP">CIP</option>
                    <option value="DAP">DAP</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Cambio *</label>
                  <Input type="number" step="0.0001" value={form.tipo_cambio} onChange={(e) => setForm({ ...form, tipo_cambio: e.target.value })} placeholder="Ej: 20.50" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descuento Global (%)</label>
                  <Input type="number" step="0.01" value={form.descuento_global} onChange={(e) => setForm({ ...form, descuento_global: e.target.value })} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha de Vigencia *</label>
                  <Input type="date" value={form.fecha_vigencia} onChange={(e) => setForm({ ...form, fecha_vigencia: e.target.value })} required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Método de Pago *</label>
                  <select value={form.metodo_pago} onChange={(e) => setForm({ ...form, metodo_pago: e.target.value })} required className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
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
                  <Input value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })} placeholder="Ej: REF-001" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">% Ganancia</label>
                <Input type="number" step="0.01" value={form.porcentaje_ganancia} onChange={(e) => setForm({ ...form, porcentaje_ganancia: e.target.value })} placeholder="Ej: 20" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notas Internas</label>
                <textarea value={form.notas_internas} onChange={(e) => setForm({ ...form, notas_internas: e.target.value })} className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Notas para el comercial o administración..." />
              </div>
              {formError && <p className="text-sm text-destructive">{formError}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowAprobar(false)}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirmar y Aceptar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Productos (Fichas) */}
      <Card>
        <CardHeader><CardTitle>Productos</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">Producto</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Proveedor</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Cantidad</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Precio Unit.</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Desc.</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {oferta.fichas?.map((ficha: { id: string; producto_nombre?: string | null; productoCodigo?: string | null; proveedor_nombre?: string | null; cantidad: number; precio_unitario: number; descuento: number; subtotal: number }) => (
                  <tr key={ficha.id}>
                    <td className="py-3">
                      <p className="font-medium">{ficha.producto_nombre ?? "—"}</p>
                      {ficha.productoCodigo && <p className="text-xs text-muted-foreground">{ficha.productoCodigo}</p>}
                    </td>
                    <td className="py-3">{ficha.proveedor_nombre ?? "—"}</td>
                    <td className="py-3 text-right">{Number(ficha.cantidad).toLocaleString()}</td>
                    <td className="py-3 text-right">${Number(ficha.precio_unitario).toLocaleString()}</td>
                    <td className="py-3 text-right">{ficha.descuento}%</td>
                    <td className="py-3 text-right font-semibold">${Number(ficha.subtotal).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
              <tfoot>
                <tr className="border-t-2 border-border">
                  <td colSpan={5} className="py-3 text-right font-medium">Subtotal</td>
                  <td className="py-3 text-right font-semibold">${Number(oferta.subtotal).toLocaleString()}</td>
                </tr>

                <tr className="text-lg">
                  <td colSpan={5} className="py-3 text-right font-bold">Total</td>
                  <td className="py-3 text-right font-bold">${Number(oferta.total).toLocaleString()}</td>
                </tr>
              </tfoot>
          </table>
        </CardContent>
      </Card>

      {/* Documentos relacionados */}
      <EntityDocuments entidad="oferta" entityId={id} />
    </div>
  )
}
