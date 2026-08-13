"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { importadoraSchema, type ImportadoraFormValues } from "@shared/schemas"
import { crearImportadora } from "@/lib/actions/importadoras"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

export default function NuevaImportadoraPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ImportadoraFormValues>({
    resolver: zodResolver(importadoraSchema),
    defaultValues: { activo: true },
  })

  async function onSubmit(values: ImportadoraFormValues) {
    try {
      await crearImportadora(values)
      toast.success("Importadora creada correctamente")
      await queryClient.invalidateQueries({ queryKey: ["importadoras"], refetchType: "all" })
      router.push("/importadoras")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div>
      <PageHeader title="Nueva Importadora" description="Registra una nueva casa de importación">
        <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /> Volver</Button>
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
              <Input {...register("rfc")} placeholder="RFC de la empresa" />
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
              <Input {...register("aduana_asignada")} placeholder="Ej: Aduana Manzanillo" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Agente Aduanal</label>
              <Input {...register("agente_aduanal")} placeholder="Nombre del agente" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Dirección</label>
            <Input {...register("direccion")} placeholder="Dirección fiscal" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" {...register("email")} placeholder="correo@ejemplo.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono</label>
              <Input {...register("telefono")} placeholder="Teléfono" />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" /> {isSubmitting ? "Guardando..." : "Guardar importadora"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
