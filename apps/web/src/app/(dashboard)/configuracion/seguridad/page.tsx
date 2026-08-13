"use client"

import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function SeguridadPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/configuracion">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Seguridad</h1>
          <p className="text-sm text-muted-foreground">Políticas de seguridad y acceso</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" /> Políticas de acceso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">Autenticación de dos factores</p>
              <p className="text-xs text-muted-foreground">Requerir 2FA para todos los usuarios</p>
            </div>
            <Badge variant="neutral">Próximamente</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">Notificar nuevos inicios de sesión</p>
              <p className="text-xs text-muted-foreground">Enviar alerta cuando se acceda desde un dispositivo nuevo</p>
            </div>
            <Badge variant="neutral">Próximamente</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">Bloqueo por inactividad</p>
              <p className="text-xs text-muted-foreground">Cerrar sesión tras 30 minutos de inactividad</p>
            </div>
            <Badge variant="neutral">Próximamente</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
