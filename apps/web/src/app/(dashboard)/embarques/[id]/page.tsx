"use client"

import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Anchor, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { useEmbarque } from "@/lib/queries"
import { eliminarEmbarque } from "@/lib/actions/embarques"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

const estadoBadge: Record<string, "success" | "warning" | "destructive" | "info" | "neutral"> = {
  programado: "info",
  en_transito: "warning",
  en_aduana: "destructive",
  liberado: "success",
  entregado: "success",
  cancelado: "neutral",
}

export default function EmbarqueDetailPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const { data: embarque, isLoading } = useEmbarque(id)

  async function handleEliminar() {
    if (!confirm("¿Estás seguro de eliminar este embarque?")) return
    try {
      await eliminarEmbarque(id)
      toast.success("Embarque eliminado correctamente")
      await queryClient.invalidateQueries({ queryKey: ["embarques"], refetchType: "all" })
      router.push("/embarques")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  if (!embarque) {
    return <div className="py-16 text-center text-muted-foreground">Embarque no encontrado</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detalle de Embarque"
        description={embarque.contenedor_numero ? `Contenedor: ${embarque.contenedor_numero}` : undefined}
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/embarques/${id}/edit`)}>
            <Edit className="h-4 w-4" /> Editar
          </Button>
          <Button variant="destructive" onClick={handleEliminar}>
            <Trash2 className="h-4 w-4" /> Eliminar
          </Button>
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Anchor className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Evento de embarque</CardTitle>
              <Badge variant={estadoBadge[embarque.estado] ?? "neutral"}>
                {embarque.estado.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Contenedor:</span> <span className="font-medium font-mono">{embarque.contenedor_numero ?? "—"}</span></div>
            <div><span className="text-muted-foreground">Fecha:</span> <span className="font-medium">{new Date(embarque.fecha_evento).toLocaleString()}</span></div>
            <div><span className="text-muted-foreground">Ubicación:</span> <span className="font-medium">{embarque.ubicacion_actual ?? "—"}</span></div>
            <div><span className="text-muted-foreground">Registrado por:</span> <span className="font-medium">{embarque.usuario_registra ?? "—"}</span></div>
          </div>
          {embarque.descripcion && (
            <div className="pt-2">
              <span className="text-sm text-muted-foreground">Descripción:</span>
              <p className="text-sm mt-1">{embarque.descripcion}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
