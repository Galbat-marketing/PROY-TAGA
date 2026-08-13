"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productoSchema, type ProductoFormValues } from "@shared/schemas"
import { crearProducto, subirImagenProducto } from "@/lib/actions/productos"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { ArrowLeft, Save, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { useCategorias, useCodificadores } from "@/lib/queries"
import { useState } from "react"
import Image from "next/image"

export default function NuevoProductoPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: categorias } = useCategorias()
  const { data: codificadores } = useCodificadores()
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      moneda: "USD",
      activo: true,
    },
  })

  function handleImagenChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagenFile(file)
    setImagenPreview(URL.createObjectURL(file))
  }

  function handleRemoveImagen() {
    setImagenFile(null)
    setImagenPreview(null)
    setValue("imagen_url", null)
  }

  async function onSubmit(values: ProductoFormValues) {
    try {
      let imagenUrl: string | null = null
      if (imagenFile) {
        const productId = crypto.randomUUID()
        imagenUrl = await subirImagenProducto(productId, imagenFile)
        values.imagen_url = imagenUrl
      }
      await crearProducto(values)
      toast.success("Producto creado correctamente")
      await queryClient.invalidateQueries({ queryKey: ["productos"], refetchType: "all" })
      router.push("/productos")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div>
      <PageHeader title="Nuevo Producto" description="Registra un nuevo producto en el catálogo">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código</label>
              <Input {...register("codigo")} placeholder="Ej: PROD-001" />
              {errors.codigo && <p className="text-xs text-destructive">{errors.codigo.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unidad de Medida</label>
              <select {...register("unidad_medida")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {codificadores?.unidadesMedida?.map((u: { codigo: string; nombre: string }) => (
                  <option key={u.codigo} value={u.codigo}>{u.codigo} - {u.nombre}</option>
                ))}
              </select>
              {errors.unidad_medida && <p className="text-xs text-destructive">{errors.unidad_medida.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre</label>
            <Input {...register("nombre")} placeholder="Nombre del producto" />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              {...register("descripcion")}
              placeholder="Descripción opcional del producto"
              rows={3}
              className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Imagen del Producto</label>
            <div className="flex items-start gap-4">
              {imagenPreview ? (
                <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-border">
                  <Image src={imagenPreview} alt="Preview" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={handleRemoveImagen}
                    className="absolute right-1 top-1 rounded-full bg-background/80 p-1 hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50">
                  <Upload className="mb-1 h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Subir imagen</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleImagenChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <select
                {...register("categoria_id")}
                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Sin categoría</option>
                {categorias?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Precio Base</label>
              <Input type="number" step="0.01" {...register("precio_base", { valueAsNumber: true })} />
              {errors.precio_base && <p className="text-xs text-destructive">{errors.precio_base.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Moneda</label>
              <select {...register("moneda")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {codificadores?.monedas?.map((m: { codigo: string; nombre: string }) => (
                  <option key={m.codigo} value={m.codigo}>{m.codigo} - {m.nombre}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">País de Origen</label>
              <select {...register("pais_origen")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {codificadores?.paises?.map((p: { codigo: string; nombre: string }) => (
                  <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fracción Arancelaria</label>
              <Input {...register("fraccion_arancelaria")} placeholder="Ej: 8471.30" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Peso (kg)</label>
              <Input type="number" step="0.001" {...register("peso_kg", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Volumen (m³)</label>
              <Input type="number" step="0.001" {...register("volumen_m3", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas</label>
              <Input {...register("notas")} placeholder="Notas opcionales" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" />
            {isSubmitting ? "Guardando..." : "Guardar producto"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
