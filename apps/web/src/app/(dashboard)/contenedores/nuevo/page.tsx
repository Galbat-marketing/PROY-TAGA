"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contenedorSchema, type ContenedorFormValues } from "@shared/schemas"
import { crearContenedor } from "@/lib/actions/contenedores"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export default function NuevoContenedorPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: importadoras } = useQuery({ queryKey: ["importadoras"], queryFn: () => fetch("/api/importadoras").then(r => r.json()) })

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContenedorFormValues>({
    resolver: zodResolver(contenedorSchema),
    defaultValues: { tipo: "dry", estado: "programado" },
  })

  async function onSubmit(values: ContenedorFormValues) {
    try {
      await crearContenedor(values)
      toast.success("Contenedor creado correctamente")
      await queryClient.invalidateQueries({ queryKey: ["contenedores"], refetchType: "all" })
      router.push("/contenedores")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div>
      <PageHeader title="Nuevo Contenedor" description="Registra un nuevo contenedor">
        <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /> Volver</Button>
      </PageHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <h2 className="text-lg font-semibold">Información del Contenedor</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Número de Contenedor *</label>
              <Input {...register("numero_contenedor")} placeholder="Ej: MSCU1234567" />
              {errors.numero_contenedor && <p className="text-xs text-destructive">{errors.numero_contenedor.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <select {...register("tipo")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="dry">Dry</option>
                <option value="reefer">Reefer</option>
                <option value="open_top">Open Top</option>
                <option value="flat_rack">Flat Rack</option>
                <option value="tank">Tank</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tamaño</label>
              <select {...register("tamano")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                <option value="20">20&apos;</option>
                <option value="40">40&apos;</option>
                <option value="40hc">40&apos; HC</option>
                <option value="45">45&apos;</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Booking</label>
              <Input {...register("booking")} placeholder="Booking number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Naviera</label>
              <Input {...register("naviera")} placeholder="Ej: MSC, Maersk" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Importadora</label>
              <select {...register("importadora_id")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {importadoras?.map((imp: { id: string; nombre: string }) => (
                  <option key={imp.id} value={imp.id}>{imp.nombre}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <select {...register("estado")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="programado">Programado</option>
                <option value="en_transito">En Tránsito</option>
                <option value="en_aduana">En Aduana</option>
                <option value="liberado">Liberado</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <h2 className="text-lg font-semibold">Ruta y Fechas</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Puerto Origen</label>
              <Input {...register("puerto_origen")} placeholder="Ej: Shanghai" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Puerto Destino</label>
              <Input {...register("puerto_destino")} placeholder="Ej: Manzanillo" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">ETD (Salida)</label>
              <Input type="date" {...register("etd")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ETA (Llegada)</label>
              <Input type="date" {...register("eta")} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <h2 className="text-lg font-semibold">Carga y Sello</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sello</label>
              <Input {...register("sello")} placeholder="Número de sello" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Peso (kg)</label>
              <Input type="number" step="0.01" {...register("peso_kg", { setValueAs: (v) => v === "" ? null : Number(v) })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Volumen (m³)</label>
              <Input type="number" step="0.01" {...register("volumen_m3", { setValueAs: (v) => v === "" ? null : Number(v) })} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notas</label>
            <textarea {...register("notas")} className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Notas adicionales..." />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} size="lg">
            <Save className="h-4 w-4" /> {isSubmitting ? "Creando..." : "Crear contenedor"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
