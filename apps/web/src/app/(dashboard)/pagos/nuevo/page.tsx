"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { pagoSchema, type PagoFormValues } from "@shared/schemas"
import { crearPago } from "@/lib/actions/pagos"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"

export default function NuevoPagoPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: proveedores } = useQuery<Array<{ id: string; nombre: string }>>({
    queryKey: ["proveedores"],
    queryFn: () => fetch("/api/proveedores").then(r => r.json()).then(list => [{ id: "", nombre: "Tercero / Otro" }, ...list]),
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      moneda: "USD",
      metodo_pago: "transferencia",
      proveedor_id: "",
    },
  })

  const selectedProveedor = watch("proveedor_id")

  async function onSubmit(values: PagoFormValues) {
    try {
      await crearPago(values)
      toast.success("Pago registrado correctamente")
      await queryClient.invalidateQueries({ queryKey: ["pagos"], refetchType: "all" })
      router.push("/pagos")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div>
      <PageHeader title="Nuevo Pago" description="Registra un pago a proveedor o tercero">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Proveedor</label>
              <select {...register("proveedor_id")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {proveedores?.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Beneficiario</label>
              <Input {...register("beneficiario")} placeholder="Nombre del tercero" disabled={!!selectedProveedor} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Monto *</label>
              <Input type="number" step="0.01" {...register("monto")} placeholder="0.00" />
              {errors.monto && <p className="text-xs text-destructive">{errors.monto.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Moneda</label>
              <select {...register("moneda")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="USD">USD</option>
                <option value="MXN">MXN</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Cambio</label>
              <Input type="number" step="0.0001" {...register("tipo_cambio")} placeholder="Ej: 20.50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Método de Pago *</label>
              <select {...register("metodo_pago")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="transferencia">Transferencia</option>
                <option value="cheque">Cheque</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="carta_de_credito">Carta de Crédito</option>
              </select>
              {errors.metodo_pago && <p className="text-xs text-destructive">{errors.metodo_pago.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha *</label>
              <Input type="date" {...register("fecha_pago")} />
              {errors.fecha_pago && <p className="text-xs text-destructive">{errors.fecha_pago.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Referencia *</label>
              <Input {...register("referencia")} placeholder="Ej: REF-001" />
              {errors.referencia && <p className="text-xs text-destructive">{errors.referencia.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notas</label>
            <textarea {...register("notas")} className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Notas adicionales..." />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" />
            {isSubmitting ? "Guardando..." : "Registrar pago"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
