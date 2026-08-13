"use client"

import { useRouter } from "next/navigation"
import { Plus, Container, Ship, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { useContenedores } from "@/lib/queries"

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

export default function ContenedoresPage() {
  const router = useRouter()
  const { data: contenedores, isLoading } = useContenedores()

  return (
    <div>
      <PageHeader title="Contenedores" description="Seguimiento de contenedores y embarques">
        <Button onClick={() => router.push("/contenedores/nuevo")}>
          <Plus className="h-4 w-4" /> Nuevo contenedor
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : !contenedores?.length ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/50 px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5">
            <Container className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">No hay contenedores</h3>
          <p className="mb-6 text-sm text-muted-foreground">Registra tu primer contenedor para dar seguimiento.</p>
          <Button onClick={() => router.push("/contenedores/nuevo")}>Nuevo contenedor</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contenedores.map((cont) => {
            const Icon = estadoIcon[cont.estado] ?? Container
            return (
              <Card key={cont.id} className="cursor-pointer transition-all hover:shadow-md" onClick={() => router.push(`/contenedores/${cont.id}`)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-sm font-bold">{cont.numero_contenedor}</p>
                      {cont.naviera && <p className="text-xs text-muted-foreground">{cont.naviera}</p>}
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <Badge variant={estadoColor[cont.estado] ?? "neutral"}>
                      {cont.estado.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {cont.puerto_origen && cont.puerto_destino && (
                      <p>{cont.puerto_origen} → {cont.puerto_destino}</p>
                    )}
                    {cont.eta && <p>ETA: {new Date(cont.eta).toLocaleDateString()}</p>}
                    {cont.etd && <p>ETD: {new Date(cont.etd).toLocaleDateString()}</p>}
                    {cont.importadora_nombre && <p>{cont.importadora_nombre}</p>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
