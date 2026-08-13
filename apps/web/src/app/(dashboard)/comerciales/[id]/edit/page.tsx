"use client"

import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { comercialSchema, type ComercialFormValues } from "@shared/schemas"
import { actualizarComercial } from "@/lib/actions/codificadores"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { useEffect, useState } from "react"

export default function EditarComercialPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ComercialFormValues>({
    resolver: zodResolver(comercialSchema),
  })

  useEffect(() => {
    fetch(`/api/comerciales/${id}`)
      .then(r => r.json())
      .then((data) => {
        reset(data)
        setLoading(false)
      })
      .catch(() => {
        toast.error("Comercial no encontrado")
        router.push("/comerciales")
      })
  }, [id, reset, router])

  async function onSubmit(values: ComercialFormValues) {
    try {
      await actualizarComercial(id, values)
      toast.success("Comercial actualizado correctamente")
      router.push(`/comerciales/${id}`)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  return (
    <div>
      <PageHeader title="Editar Comercial">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </PageHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código</label>
              <Input {...register("codigo")} placeholder="Ej: COM-001" />
              {errors.codigo && <p className="text-xs text-destructive">{errors.codigo.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Activo</label>
              <select {...register("activo")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre</label>
            <Input {...register("nombre")} />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" /> {isSubmitting ? "Guardando..." : "Actualizar comercial"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
