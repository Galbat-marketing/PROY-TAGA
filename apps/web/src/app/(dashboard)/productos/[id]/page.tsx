"use client"

import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Package, Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { EntityDocuments } from "@/components/shared/entity-documents"
import { useProducto } from "@/lib/queries"
import { eliminarProducto } from "@/lib/actions/productos"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export default function ProductoDetailPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const { data: producto, isLoading } = useProducto(id)

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  if (!producto) {
    return <div className="py-16 text-center text-muted-foreground">Producto no encontrado</div>
  }

  async function handleEliminar() {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return
    try {
      await eliminarProducto(id)
      toast.success("Producto eliminado")
      await queryClient.invalidateQueries({ queryKey: ["productos"], refetchType: "all" })
      router.push("/productos")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={producto.nombre} description={producto.codigo ? `Código: ${producto.codigo}` : undefined}>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <Button variant="outline" onClick={() => router.push(`/productos/${id}/edit`)}>
          <Edit className="h-4 w-4" /> Editar
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {producto.imagen_url && (
          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image src={producto.imagen_url} alt={producto.nombre} fill className="object-cover" unoptimized />
              </div>
            </CardContent>
          </Card>
        )}
        <Card className={producto.imagen_url ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{producto.nombre}</CardTitle>
                <Badge variant={producto.activo ? "success" : "neutral"}>
                  {producto.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Código:</span> <span className="font-medium font-mono">{producto.codigo}</span></div>
              <div><span className="text-muted-foreground">Categoría:</span> <span className="font-medium">{producto.categoria_nombre ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Unidad Medida:</span> <span className="font-medium">{producto.unidad_medida}</span></div>
              <div><span className="text-muted-foreground">Precio Base:</span> <span className="font-semibold">${Number(producto.precio_base).toLocaleString()}</span></div>
              <div><span className="text-muted-foreground">Moneda:</span> <span className="font-medium">{producto.moneda}</span></div>
              {producto.fraccion_arancelaria && <div><span className="text-muted-foreground">Fracción Arancelaria:</span> <span className="font-medium">{producto.fraccion_arancelaria}</span></div>}
              {producto.pais_origen && <div><span className="text-muted-foreground">País Origen:</span> <span className="font-medium">{producto.pais_origen}</span></div>}
              {producto.peso_kg && <div><span className="text-muted-foreground">Peso (kg):</span> <span className="font-medium">{producto.peso_kg}</span></div>}
              {producto.volumen_m3 && <div><span className="text-muted-foreground">Volumen (m³):</span> <span className="font-medium">{producto.volumen_m3}</span></div>}
            </div>
            {producto.descripcion && (
              <div className="pt-2">
                <span className="text-sm text-muted-foreground">Descripción:</span>
                <p className="text-sm mt-1">{producto.descripcion}</p>
              </div>
            )}
            {producto.notas && (
              <div className="pt-2">
                <span className="text-sm text-muted-foreground">Notas:</span>
                <p className="text-sm mt-1">{producto.notas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Acciones</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="destructive" onClick={handleEliminar}>
              <Trash2 className="h-4 w-4" /> Eliminar producto
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Documentos relacionados */}
      <EntityDocuments entidad="producto" entityId={id} />
    </div>
  )
}
