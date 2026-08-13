"use client"

import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, CreditCard, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { Cobro } from "@shared/types"
import { eliminarCobro } from "@/lib/actions/cobros"
import { toast } from "sonner"

export default function CobroDetailPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string

  const { data: cobro, isLoading } = useQuery<Cobro>({
    queryKey: ["cobros", id],
    queryFn: () => fetch(`/api/cobros/${id}`).then(r => r.json()),
    enabled: !!id,
  })

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  if (!cobro) {
    return <div className="py-16 text-center text-muted-foreground">Cobro no encontrado</div>
  }

  async function handleEliminar() {
    if (!confirm("¿Eliminar este cobro? Esta acción no se puede deshacer.")) return
    try {
      await eliminarCobro(id)
      toast.success("Cobro eliminado")
      await queryClient.invalidateQueries({ queryKey: ["cobros"], refetchType: "all" })
      router.push("/cobros")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Detalle de Cobro" description={cobro.factura_folio ? `Factura: ${cobro.factura_folio}` : undefined}>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Cobro {cobro.factura_folio ? `- ${cobro.factura_folio}` : ""}</CardTitle>
                {cobro.cliente_nombre && <p className="text-sm text-muted-foreground">{cobro.cliente_nombre}</p>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Factura:</span> <span className="font-medium font-mono">{cobro.factura_folio ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Cliente:</span> <span className="font-medium">{cobro.cliente_nombre ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Monto:</span> <span className="font-semibold">${Number(cobro.monto).toLocaleString()}</span></div>
              <div><span className="text-muted-foreground">Moneda:</span> <span className="font-medium">{cobro.moneda}</span></div>
              {cobro.tipo_cambio && <div><span className="text-muted-foreground">Tipo Cambio:</span> <span className="font-medium">{cobro.tipo_cambio}</span></div>}
              <div><span className="text-muted-foreground">Fecha:</span> <span className="font-medium">{new Date(cobro.fecha_cobro).toLocaleDateString()}</span></div>
              <div><span className="text-muted-foreground">Método:</span> <span className="font-medium">{cobro.metodo_pago ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Referencia:</span> <span className="font-medium">{cobro.referencia ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Ganancia:</span> <span className="font-medium">${(Number(cobro.monto) * 0.4).toLocaleString()}</span></div>
            </div>
            {cobro.notas && (
              <div className="pt-2">
                <span className="text-sm text-muted-foreground">Notas:</span>
                <p className="text-sm mt-1">{cobro.notas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Acciones</CardTitle></CardHeader>
          <CardContent>
            <Button className="w-full" variant="destructive" onClick={handleEliminar}>
              <Trash2 className="h-4 w-4" /> Eliminar cobro
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
