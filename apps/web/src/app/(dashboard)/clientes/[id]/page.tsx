"use client"

import { useRouter, useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Building, Mail, Phone, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { EntityDocuments } from "@/components/shared/entity-documents"
import { useCliente } from "@/lib/queries"
import { eliminarCliente } from "@/lib/actions/clientes"
import { toast } from "sonner"

export default function ClienteDetailPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const { data: cliente, isLoading } = useCliente(id)

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  if (!cliente) {
    return <div className="py-16 text-center text-muted-foreground">Cliente no encontrado</div>
  }

  async function handleEliminar() {
    if (!confirm("¿Eliminar este cliente? Esta acción no se puede deshacer.")) return
    try {
      await eliminarCliente(id)
      toast.success("Cliente eliminado")
      await queryClient.invalidateQueries({ queryKey: ["clientes"], refetchType: "all" })
      router.push("/clientes")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={cliente.nombre} description={cliente.codigo ? `Código: ${cliente.codigo}` : undefined}>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <Button variant="outline" onClick={() => router.push(`/clientes/${id}/edit`)}>
          <Edit className="h-4 w-4" /> Editar
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{cliente.nombre}</CardTitle>
                <Badge variant={cliente.activo ? "success" : "neutral"}>
                  {cliente.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">RFC:</span> <span className="font-medium">{cliente.rfc ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Tipo:</span> <span className="font-medium">{cliente.tipo_persona === "moral" ? "Moral" : "Física"}</span></div>
              <div><span className="text-muted-foreground">País:</span> <span className="font-medium">{cliente.pais}</span></div>
              <div><span className="text-muted-foreground">Moneda Default:</span> <span className="font-medium">{cliente.moneda_default}</span></div>
              <div><span className="text-muted-foreground">Límite Crédito:</span> <span className="font-medium">${Number(cliente.limite_credito).toLocaleString()}</span></div>
              <div><span className="text-muted-foreground">Condiciones Pago:</span> <span className="font-medium">{cliente.condiciones_pago ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Vendedor:</span> <span className="font-medium">{cliente.vendedor_nombre ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Industria:</span> <span className="font-medium">{cliente.industria ?? "—"}</span></div>
              {cliente.rating > 0 && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < cliente.rating ? "bg-warning" : "bg-muted"}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {cliente.notas && (
              <div className="pt-2">
                <span className="text-sm text-muted-foreground">Notas:</span>
                <p className="text-sm mt-1">{cliente.notas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contacto</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {cliente.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{cliente.email}</span>
              </div>
            )}
            {cliente.telefono && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{cliente.telefono}</span>
              </div>
            )}
            <Button className="w-full" variant="destructive" onClick={handleEliminar}>
              <Trash2 className="h-4 w-4" /> Eliminar cliente
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Documentos relacionados */}
      <EntityDocuments entidad="cliente" entityId={id} />
    </div>
  )
}
