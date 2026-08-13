"use client"

import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { clienteSchema, type ClienteFormValues } from "@shared/schemas"
import { crearCliente } from "@/lib/actions/clientes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { useCodificadores } from "@/lib/queries"

export default function NuevoClientePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { tipo_persona: "moral", moneda_default: "USD" },
  })

  const { data: codificadores } = useCodificadores()

  async function onSubmit(values: ClienteFormValues) {
    try {
      console.log("Submitting values:", values)
      await crearCliente(values)
      toast.success("Cliente creado correctamente")
      await queryClient.invalidateQueries({ queryKey: ["clientes"], refetchType: "all" })
      router.push("/clientes")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div>
      <PageHeader title="Nuevo Cliente" description="Registra un nuevo cliente">
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
            <Input {...register("nombre")} placeholder="Nombre completo o razón social" />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">RFC</label>
              <Input {...register("rfc")} placeholder="RFC (opcional)" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" {...register("email")} placeholder="correo@ejemplo.com" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono</label>
              <Input {...register("telefono")} placeholder="+52 555 123 4567" />
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
              <Input type="number" step="0.01" {...register("limite_credito")} placeholder="Ej: 50000" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Condiciones de Pago</label>
            <Input {...register("condiciones_pago")} placeholder="Ej: 30 días" />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" /> {isSubmitting ? "Guardando..." : "Guardar cliente"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
