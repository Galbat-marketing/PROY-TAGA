"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Package,
  Container,
  AlertTriangle,
  ArrowRight,
  Ship,
  Clock,
  Wallet,
} from "lucide-react"
import { useDashboardKPIs } from "@/lib/queries"

const estadoBadge: Record<string, "success" | "warning" | "destructive" | "info"> = {
  aceptada: "success",
  borrador: "warning",
  rechazada: "destructive",
  enviada: "info",
  convertida: "success",
}

const estadoLabel: Record<string, string> = {
  aceptada: "Aceptada",
  borrador: "Borrador",
  rechazada: "Rechazada",
  enviada: "Enviada",
  convertida: "Convertida",
}

export function DashboardHome() {
  const { data: kpis, isLoading } = useDashboardKPIs()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const stats = [
    {
      label: "Ventas del Mes",
      value: kpis ? `$${kpis.ventas_mes.toLocaleString()}` : "$0",
      change: kpis ? `${kpis.variacion_ventas >= 0 ? "+" : ""}${kpis.variacion_ventas.toFixed(1)}%` : "0%",
      trend: (kpis?.variacion_ventas ?? 0) >= 0 ? "up" : "down" as const,
      icon: DollarSign,
    },
    {
      label: "Cobrado",
      value: kpis ? `$${kpis.cobrado_mes.toLocaleString()}` : "$0",
      change: kpis ? `${kpis.variacion_cobrado >= 0 ? "+" : ""}${kpis.variacion_cobrado.toFixed(1)}%` : "0%",
      trend: (kpis?.variacion_cobrado ?? 0) >= 0 ? "up" : "down" as const,
      icon: TrendingUp,
    },
    {
      label: "Pendiente",
      value: kpis ? `$${kpis.pendiente_total.toLocaleString()}` : "$0",
      change: "",
      trend: "up" as const,
      icon: FileText,
    },
    {
      label: "Ofertas Activas",
      value: kpis ? `${kpis.ofertas_activas}` : "0",
      change: "",
      trend: "up" as const,
      icon: Package,
      badge: kpis?.ofertas_nuevas ? `${kpis.ofertas_nuevas} nuevas` : undefined,
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Resumen ejecutivo de operaciones"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-2">
                    {stat.change && (
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                          stat.trend === "up"
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {stat.trend === "up" ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {stat.change}
                      </span>
                    )}
                    {stat.badge && (
                      <Badge variant="success" className="text-[10px]">
                        {stat.badge}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two column section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ofertas Recientes */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Ofertas Recientes</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => window.location.href = "/ofertas"}>
              Ver todas <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {(kpis?.ofertas_recientes?.length ?? 0) > 0 ? (
                kpis!.ofertas_recientes.map((oferta) => (
                  <div
                    key={oferta.id}
                    className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-muted/50 cursor-pointer"
                    onClick={() => window.location.href = `/ofertas/${oferta.id}`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {oferta.folio}
                        </span>
                        <Badge variant={estadoBadge[oferta.estado] ?? "neutral"}>
                          {estadoLabel[oferta.estado] ?? oferta.estado}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {oferta.cliente_nombre ?? "—"} · {oferta.comercial_nombre ?? "—"} · {new Date(oferta.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-sm font-semibold">${Number(oferta.total).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No hay ofertas recientes
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Operaciones Activas */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Container className="h-4 w-4 text-primary" />
                Contenedores Activos
              </CardTitle>
              <Badge variant={kpis && kpis.contenedores_atrasados > 0 ? "destructive" : "info"}>
                {kpis ? `${kpis.contenedores_activos} activos` : "0 activos"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {(kpis?.contenedores_lista?.length ?? 0) > 0 ? (
                kpis!.contenedores_lista.map((cont) => {
                  const isAtrasado = cont.eta && new Date(cont.eta) < new Date()
                  const isProximo = cont.eta && new Date(cont.eta) >= new Date() && new Date(cont.eta) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  return (
                    <div
                      key={cont.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          isAtrasado ? "bg-destructive/10" : isProximo ? "bg-warning/10" : "bg-success/10"
                        }`}>
                          {isAtrasado ? (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          ) : isProximo ? (
                            <Clock className="h-4 w-4 text-warning" />
                          ) : (
                            <Ship className="h-4 w-4 text-success" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{cont.numero_contenedor}</p>
                          <p className="text-xs text-muted-foreground">
                            {cont.estado.replace(/_/g, " ")}
                            {cont.eta ? ` · ETA: ${new Date(cont.eta).toLocaleDateString()}` : ""}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        isAtrasado ? "destructive" : isProximo ? "warning" : "success"
                      }>
                        {isAtrasado ? "Atrasado" : isProximo ? "Próximo" : "A tiempo"}
                      </Badge>
                    </div>
                  )
                })
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No hay contenedores activos
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comisiones Pendientes */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                Comisiones Pendientes
              </CardTitle>
              <Badge variant={(kpis?.comisiones_pendientes?.length ?? 0) > 0 ? "warning" : "success"}>
                {kpis ? `${kpis.comisiones_pendientes.length} pendientes` : "0 pendientes"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {(kpis?.comisiones_pendientes?.length ?? 0) > 0 ? (
                kpis!.comisiones_pendientes.map((pago) => (
                  <div
                    key={pago.id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3 cursor-pointer transition-colors hover:bg-muted"
                    onClick={() => window.location.href = `/comerciales/${pago.comercial_id}`}
                  >
                    <div>
                      <p className="text-sm font-medium">{pago.comercial_nombre}</p>
                      <p className="text-xs text-muted-foreground">{pago.comercial_codigo}</p>
                    </div>
                    <span className="text-sm font-semibold text-warning">
                      ${Number(pago.monto).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No hay comisiones pendientes
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
