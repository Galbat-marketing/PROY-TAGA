"use client"

import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { proveedorSchema, type ProveedorFormValues } from "@shared/schemas"
import { crearProveedor } from "@/lib/actions/proveedores"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { useCodificadores } from "@/lib/queries"

export default function NuevoProveedorPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProveedorFormValues>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: { moneda_default: "USD", rating: 0 },
  })

  const { data: codificadores } = useCodificadores()

  async function onSubmit(values: ProveedorFormValues) {
    try {
      await crearProveedor(values)
      toast.success("Proveedor creado correctamente")
      await queryClient.invalidateQueries({ queryKey: ["proveedores"], refetchType: "all" })
      router.push("/proveedores")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div>
      <PageHeader title="Nuevo Proveedor" description="Registra un nuevo proveedor">
        <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /> Volver</Button>
      </PageHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-1x2 space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código</label>
              <Input {...register("codigo")} placeholder="Ej: PROV-001" />
              {errors.codigo && <p className="text-xs text-destructive">{errors.codigo.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <select {...register("tipo_proveedor")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                <option value="fabricante">Fabricante</option>
                <option value="distribuidor">Distribuidor</option>
                <option value="agente">Agente</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre</label>
            <Input {...register("nombre")} placeholder="Razón social" />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">RFC</label>
              <Input {...register("rfc")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" {...register("email")} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono</label>
              <Input {...register("telefono")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">País</label>
              <select {...register("pais")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {codificadores?.paises?.map((p: { codigo: string; nombre: string }) => (
                  <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
                ))}
              </select>
              {errors.pais && <p className="text-xs text-destructive">{errors.pais.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <select {...register("rating")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="0">Sin calificar</option>
                <option value="1">1 - Muy malo</option>
                <option value="2">2 - Malo</option>
                <option value="3">3 - Regular</option>
                <option value="4">4 - Bueno</option>
                <option value="5">5 - Excelente</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Condiciones de Pago</label>
              <Input {...register("condiciones_pago")} placeholder="Ej: 30 días" />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" /> {isSubmitting ? "Guardando..." : "Guardar proveedor"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
