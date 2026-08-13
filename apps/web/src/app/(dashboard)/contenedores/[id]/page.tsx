"use client"

import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Container, Ship, Clock, AlertTriangle, CheckCircle, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { useContenedor } from "@/lib/queries"

const estadoIcon: Record<string, React.ElementType> = {
  programado: Clock,
  en_transito: Ship,
  en_aduana: AlertTriangle,
  liberado: CheckCircle,
  entregado: CheckCircle,
}

const estadoColor: Record<string, "success" | "warning" | "destructive" | "info" | "neutral"> = {
  programado: "info",
  en_transito: "warning",
  en_aduana: "destructive",
  liberado: "success",
  entregado: "success",
}

export default function ContenedorDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { data: contenedor, isLoading } = useContenedor(id)

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  if (!contenedor) {
    return <div className="py-16 text-center text-muted-foreground">Contenedor no encontrado</div>
  }

  const Icon = estadoIcon[contenedor.estado] ?? Container
  const embarques = (contenedor as unknown as { embarques?: Array<{ id: string; estado: string; ubicacion_actual?: string | null; fecha_evento: string; descripcion?: string | null }> }).embarques

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Contenedor ${contenedor.numero_contenedor}`}
        description={contenedor.naviera ? `Naviera: ${contenedor.naviera}` : undefined}
      >
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <Button variant="outline" onClick={() => router.push(`/contenedores/${id}/edit`)}>
          <Edit className="h-4 w-4" /> Editar
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{contenedor.numero_contenedor}</CardTitle>
                <Badge variant={estadoColor[contenedor.estado] ?? "neutral"}>
                  {contenedor.estado.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Tipo:</span> <span className="font-medium">{contenedor.tipo}</span></div>
              <div><span className="text-muted-foreground">Tamaño:</span> <span className="font-medium">{contenedor.tamano ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Booking:</span> <span className="font-medium">{contenedor.booking ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Naviera:</span> <span className="font-medium">{contenedor.naviera ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Importadora:</span> <span className="font-medium">{contenedor.importadora_nombre ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Sello:</span> <span className="font-medium">{contenedor.sello ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Peso:</span> <span className="font-medium">{contenedor.peso_kg ? `${contenedor.peso_kg} kg` : "—"}</span></div>
              <div><span className="text-muted-foreground">Volumen:</span> <span className="font-medium">{contenedor.volumen_m3 ? `${contenedor.volumen_m3} m³` : "—"}</span></div>
            </div>
            {contenedor.notas && (
              <div className="pt-2">
                <span className="text-sm text-muted-foreground">Notas:</span>
                <p className="text-sm mt-1">{contenedor.notas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Ruta</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              {contenedor.puerto_origen && contenedor.puerto_destino && (
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="font-medium">{contenedor.puerto_origen} → {contenedor.puerto_destino}</p>
                </div>
              )}
              <div><span className="text-muted-foreground">ETD:</span> <span className="font-medium">{contenedor.etd ? new Date(contenedor.etd).toLocaleDateString() : "—"}</span></div>
              <div><span className="text-muted-foreground">ETA:</span> <span className="font-medium">{contenedor.eta ? new Date(contenedor.eta).toLocaleDateString() : "—"}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {embarques && embarques.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Embarques</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {embarques.map((emb) => (
                <div key={emb.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                    <Ship className="h-3 w-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={estadoColor[emb.estado] ?? "neutral"} className="text-xs">
                        {emb.estado.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{new Date(emb.fecha_evento).toLocaleString()}</span>
                    </div>
                    {emb.ubicacion_actual && <p className="mt-1 text-sm">{emb.ubicacion_actual}</p>}
                    {emb.descripcion && <p className="mt-0.5 text-xs text-muted-foreground">{emb.descripcion}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
