"use client"

import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { embarqueSchema, type EmbarqueFormValues } from "@shared/schemas"
import { actualizarEmbarque, getEmbarque } from "@/lib/actions/embarques"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import type { Embarque } from "@shared/types"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export default function EditarEmbarquePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const [embarque, setEmbarque] = useState<Embarque | null>(null)
  const [loading, setLoading] = useState(true)
  const { data: contenedores } = useQuery({ queryKey: ["contenedores"], queryFn: () => fetch("/api/contenedores").then(r => r.json()) })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EmbarqueFormValues>({
    resolver: zodResolver(embarqueSchema),
  })

  useEffect(() => {
    getEmbarque(id).then((data) => {
      setEmbarque(data as unknown as Embarque)
      reset(data as unknown as EmbarqueFormValues)
      setLoading(false)
    }).catch(() => {
      toast.error("Embarque no encontrado")
      queryClient.invalidateQueries({ queryKey: ["embarques"], refetchType: "all" })
      router.push("/embarques")
    })
  }, [id, reset, router, queryClient])

  async function onSubmit(values: EmbarqueFormValues) {
    try {
      await actualizarEmbarque(id, values)
      toast.success("Embarque actualizado correctamente")
      await queryClient.invalidateQueries({ queryKey: ["embarques"], refetchType: "all" })
      router.push("/embarques")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  return (
    <div>
      <PageHeader title="Editar Embarque" description={embarque?.contenedor_numero ? `Contenedor: ${embarque.contenedor_numero}` : undefined}>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </PageHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <h2 className="text-lg font-semibold">Información del Embarque</h2>
          <div className="space-y-2">
            <label className="text-sm font-medium">Contenedor *</label>
            <select {...register("contenedor_id")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option value="">Seleccionar contenedor...</option>
              {contenedores?.map((c: { id: string; numero_contenedor: string }) => (
                <option key={c.id} value={c.id}>{c.numero_contenedor}</option>
              ))}
            </select>
            {errors.contenedor_id && <p className="text-xs text-destructive">{errors.contenedor_id.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha del Evento *</label>
              <Input type="date" {...register("fecha_evento")} />
              {errors.fecha_evento && <p className="text-xs text-destructive">{errors.fecha_evento.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ubicación Actual</label>
            <Input {...register("ubicacion_actual")} placeholder="Ej: Puerto Manzanillo" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <textarea {...register("descripcion")} className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Descripción del evento..." />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" /> {isSubmitting ? "Guardando..." : "Actualizar embarque"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
