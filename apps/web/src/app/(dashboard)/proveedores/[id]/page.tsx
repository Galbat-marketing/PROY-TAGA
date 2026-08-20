"use client"

import { useRouter, useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Truck, Mail, Phone, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { EntityDocuments } from "@/components/shared/entity-documents"
import { ProveedorOfertas } from "@/components/proveedores/proveedor-ofertas"
import { useProveedor } from "@/lib/queries"
import { eliminarProveedor } from "@/lib/actions/proveedores"
import { toast } from "sonner"

export default function ProveedorDetailPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const { data: proveedor, isLoading } = useProveedor(id)

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  if (!proveedor) {
    return <div className="py-16 text-center text-muted-foreground">Proveedor no encontrado</div>
  }

  async function handleEliminar() {
    if (!confirm("¿Eliminar este proveedor? Esta acción no se puede deshacer.")) return
    try {
      await eliminarProveedor(id)
      toast.success("Proveedor eliminado")
      await queryClient.invalidateQueries({ queryKey: ["proveedores"], refetchType: "all" })
      router.push("/proveedores")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={proveedor.nombre} description={proveedor.codigo ? `Código: ${proveedor.codigo}` : undefined}>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <Button variant="outline" onClick={() => router.push(`/proveedores/${id}/edit`)}>
          <Edit className="h-4 w-4" /> Editar
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{proveedor.nombre}</CardTitle>
                <Badge variant={proveedor.activo ? "success" : "neutral"}>
                  {proveedor.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">RFC:</span> <span className="font-medium">{proveedor.rfc ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Tipo:</span> <span className="font-medium">{proveedor.tipo_proveedor ?? "—"}</span></div>
              <div><span className="text-muted-foreground">País:</span> <span className="font-medium">{proveedor.pais}</span></div>
              <div><span className="text-muted-foreground">Moneda Default:</span> <span className="font-medium">{proveedor.moneda_default}</span></div>
              <div><span className="text-muted-foreground">Condiciones Pago:</span> <span className="font-medium">{proveedor.condiciones_pago ?? "—"}</span></div>
              {proveedor.rating > 0 && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < proveedor.rating ? "bg-warning" : "bg-muted"}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contacto</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {proveedor.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{proveedor.email}</span>
              </div>
            )}
            {proveedor.telefono && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{proveedor.telefono}</span>
              </div>
            )}
            <Button className="w-full" variant="destructive" onClick={handleEliminar}>
              <Trash2 className="h-4 w-4" /> Eliminar proveedor
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Ofertas relacionadas con pagos */}
      <ProveedorOfertas proveedorId={id} />

      {/* Documentos relacionados */}
      <EntityDocuments entidad="proveedor" entityId={id} />
    </div>
  )
}
