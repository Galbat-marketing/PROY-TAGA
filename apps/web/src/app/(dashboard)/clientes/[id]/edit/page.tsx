"use client"

import { useRouter, useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { clienteSchema, type ClienteFormValues } from "@shared/schemas"
import { actualizarCliente, getCliente } from "@/lib/actions/clientes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import type { Cliente } from "@shared/types"
import { useCodificadores } from "@/lib/queries"

export default function EditarClientePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
  })

  const { data: codificadores } = useCodificadores()

  useEffect(() => {
    getCliente(id).then((data) => {
      setCliente(data as unknown as Cliente)
      reset(data as unknown as ClienteFormValues)
      setLoading(false)
    }).catch(() => {
      toast.error("Cliente no encontrado")
      router.push("/clientes")
    })
  }, [id, reset, router])

  async function onSubmit(values: ClienteFormValues) {
    try {
      await actualizarCliente(id, values)
      toast.success("Cliente actualizado correctamente")
      await queryClient.invalidateQueries({ queryKey: ["clientes"], refetchType: "all" })
      router.push("/clientes")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  return (
    <div>
      <PageHeader title="Editar Cliente" description={cliente?.nombre ?? ""}>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </PageHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-1x2 space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código</label>
              <Input {...register("codigo")} placeholder="Ej: CLI-001" />
              {errors.codigo && <p className="text-xs text-destructive">{errors.codigo.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Persona</label>
              <select {...register("tipo_persona")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="moral">Moral</option>
                <option value="fisica">Física</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre / Razón Social</label>
            <Input {...register("nombre")} />
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
              <label className="text-sm font-medium">Moneda Default</label>
              <select {...register("moneda_default")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {codificadores?.monedas?.map((m: { codigo: string; nombre: string }) => (
                  <option key={m.codigo} value={m.codigo}>{m.codigo} - {m.nombre}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Límite de Crédito</label>
              <Input type="number" step="0.01" {...register("limite_credito")} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Condiciones de Pago</label>
            <Input {...register("condiciones_pago")} />
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" /> {isSubmitting ? "Guardando..." : "Actualizar cliente"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
