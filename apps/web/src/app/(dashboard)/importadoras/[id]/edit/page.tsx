"use client"

import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { importadoraSchema, type ImportadoraFormValues } from "@shared/schemas"
import { actualizarImportadora, getImportadora } from "@/lib/actions/importadoras"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import type { Importadora } from "@shared/types"
import { useQueryClient } from "@tanstack/react-query"

export default function EditarImportadoraPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const [importadora, setImportadora] = useState<Importadora | null>(null)
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ImportadoraFormValues>({
    resolver: zodResolver(importadoraSchema),
  })

  useEffect(() => {
    getImportadora(id).then((data) => {
      setImportadora(data as unknown as Importadora)
      reset(data as unknown as ImportadoraFormValues)
      setLoading(false)
    }).catch(() => {
      toast.error("Importadora no encontrada")
      queryClient.invalidateQueries({ queryKey: ["importadoras"], refetchType: "all" })
      router.push("/importadoras")
    })
  }, [id, reset, router, queryClient])

  async function onSubmit(values: ImportadoraFormValues) {
    try {
      await actualizarImportadora(id, values)
      toast.success("Importadora actualizada correctamente")
      await queryClient.invalidateQueries({ queryKey: ["importadoras"], refetchType: "all" })
      router.push("/importadoras")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  return (
    <div>
      <PageHeader title="Editar Importadora" description={importadora?.nombre ?? ""}>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </PageHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código</label>
              <Input {...register("codigo")} placeholder="Ej: IMP-001" />
              {errors.codigo && <p className="text-xs text-destructive">{errors.codigo.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">RFC</label>
              <Input {...register("rfc")} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre</label>
            <Input {...register("nombre")} placeholder="Razón social" />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Aduana Asignada</label>
              <Input {...register("aduana_asignada")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Agente Aduanal</label>
              <Input {...register("agente_aduanal")} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Dirección</label>
            <Input {...register("direccion")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono</label>
              <Input {...register("telefono")} />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" /> {isSubmitting ? "Guardando..." : "Actualizar importadora"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
