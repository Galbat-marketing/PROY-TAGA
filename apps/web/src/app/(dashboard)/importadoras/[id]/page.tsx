"use client"

import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, FolderOpen, Mail, Phone, MapPin, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { useImportadora } from "@/lib/queries"
import { eliminarImportadora } from "@/lib/actions/importadoras"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

export default function ImportadoraDetailPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const { data: importadora, isLoading } = useImportadora(id)

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  if (!importadora) {
    return <div className="py-16 text-center text-muted-foreground">Importadora no encontrada</div>
  }

  async function handleEliminar() {
    if (!confirm("¿Eliminar esta importadora? Esta acción no se puede deshacer.")) return
    try {
      await eliminarImportadora(id)
      toast.success("Importadora eliminada")
      await queryClient.invalidateQueries({ queryKey: ["importadoras"], refetchType: "all" })
      router.push("/importadoras")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={importadora.nombre} description={importadora.codigo ? `Código: ${importadora.codigo}` : undefined}>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <Button variant="outline" onClick={() => router.push(`/importadoras/${id}/edit`)}>
          <Edit className="h-4 w-4" /> Editar
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <FolderOpen className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{importadora.nombre}</CardTitle>
                <Badge variant={importadora.activo ? "success" : "neutral"}>
                  {importadora.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">RFC:</span> <span className="font-medium">{importadora.rfc ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Aduana:</span> <span className="font-medium">{importadora.aduana_asignada ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Agente Aduanal:</span> <span className="font-medium">{importadora.agente_aduanal ?? "—"}</span></div>
            </div>
            {importadora.direccion && (
              <div className="pt-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span>{importadora.direccion}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contacto</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {importadora.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{importadora.email}</span>
              </div>
            )}
            {importadora.telefono && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{importadora.telefono}</span>
              </div>
            )}
            <Button className="w-full" variant="destructive" onClick={handleEliminar}>
              <Trash2 className="h-4 w-4" /> Eliminar importadora
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
