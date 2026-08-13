"use client"

import { useState } from "react"
import { FileBarChart, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { useReporte } from "@/lib/queries"

const reportes = [
  { tipo: "ofertas", label: "Ofertas", desc: "Reporte de ofertas comerciales" },
  { tipo: "clientes", label: "Clientes", desc: "Catálogo de clientes" },
  { tipo: "productos", label: "Productos", desc: "Catálogo de productos" },
  { tipo: "facturas", label: "Facturas", desc: "Facturas emitidas" },
  { tipo: "cobros", label: "Cobros", desc: "Cobros registrados" },
  { tipo: "pagos", label: "Pagos", desc: "Pagos a proveedores" },
  { tipo: "gastos", label: "Gastos", desc: "Gastos operativos" },
  { tipo: "documentos", label: "Documentos", desc: "Documentos del sistema" },
]

const formatos = ["excel", "csv", "pdf"] as const

export default function ReportesPage() {
  const { mutate: generar, isPending } = useReporte()
  const [descargando, setDescargando] = useState<string | null>(null)

  const handleGenerar = (tipo: string, formato: string) => {
    const key = `${tipo}-${formato}`
    setDescargando(key)
    generar(
      { tipo, formato },
      {
        onSuccess: (data) => {
          if (data.url) window.open(data.url, "_blank")
          setDescargando(null)
        },
        onError: () => setDescargando(null),
      }
    )
  }

  return (
    <div>
      <PageHeader title="Reportes" description="Genera reportes exportables del sistema" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {reportes.map((r) => (
          <Card key={r.tipo}>
            <CardHeader>
              <CardTitle className="text-base">{r.label}</CardTitle>
              <CardDescription>{r.desc}</CardDescription>
            </CardHeader>
            <CardFooter className="grid grid-cols-3 gap-2">
              {formatos.map((fmt) => {
                const key = `${r.tipo}-${fmt}`
                return (
                  <Button
                    key={fmt}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleGenerar(r.tipo, fmt)}
                    disabled={isPending && descargando === key}
                  >
                    {isPending && descargando === key ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Download className="h-3 w-3" />
                    )}
                    {fmt.toUpperCase()}
                  </Button>
                )
              })}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
