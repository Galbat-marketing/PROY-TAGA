"use client"

import { ArrowLeft, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function NotificacionesPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/configuracion">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-sm text-muted-foreground">Configuración de alertas y avisos</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" /> Alertas del sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">Vencimiento de facturas</p>
              <p className="text-xs text-muted-foreground">Notificar 7 días antes del vencimiento</p>
            </div>
            <Badge variant="neutral">Próximamente</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">Llegada de contenedores</p>
              <p className="text-xs text-muted-foreground">Alertar cuando un contenedor esté próximo a llegar</p>
            </div>
            <Badge variant="neutral">Próximamente</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">Ofertas por vencer</p>
              <p className="text-xs text-muted-foreground">Recordar ofertas enviadas próximas a expirar</p>
            </div>
            <Badge variant="neutral">Próximamente</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
