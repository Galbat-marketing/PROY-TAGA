"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ofertaSchema, type OfertaFormValues } from "@shared/schemas"
import { actualizarOferta } from "@/lib/actions/ofertas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import { useCodificadores } from "@/lib/queries"

export default function EditarOfertaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: oferta, isLoading: ofertaLoading } = useQuery({
    queryKey: ["ofertas", id],
    queryFn: () => fetch(`/api/ofertas/${id}`).then(r => r.json()),
    enabled: !!id,
  })

  const { data: clientes } = useQuery({ queryKey: ["clientes"], queryFn: () => fetch("/api/clientes").then(r => r.json()) })
  const { data: productos } = useQuery({ queryKey: ["productos"], queryFn: () => fetch("/api/productos").then(r => r.json()) })
  const { data: proveedores } = useQuery({ queryKey: ["proveedores"], queryFn: () => fetch("/api/proveedores").then(r => r.json()) })
  const { data: codificadores } = useCodificadores()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OfertaFormValues>({
    resolver: zodResolver(ofertaSchema),
    defaultValues: {
      moneda: "USD",
      fecha_emision: new Date().toISOString().split("T")[0],
      fichas: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "fichas" })

  useEffect(() => {
    if (oferta) {
      reset({
        cliente_id: oferta.cliente_id,
        comercial_id: oferta.comercial_id ?? "",
        moneda: oferta.moneda,
        fecha_emision: oferta.fecha_emision?.split("T")[0] ?? "",
        fecha_vigencia: oferta.fecha_vigencia?.split("T")[0] ?? "",
        incoterm: oferta.incoterm ?? "",
        tipo_operacion: oferta.tipo_operacion ?? "",
        condiciones_pago: oferta.condiciones_pago ?? "",
        fichas: oferta.fichas?.map((f: { producto_id: string; proveedor_id?: string | null; cantidad: number; unidad_medida: string; precio_unitario: number; descuento: number; notas?: string | null }) => ({
          producto_id: f.producto_id,
          proveedor_id: f.proveedor_id ?? "",
          cantidad: f.cantidad,
          unidad_medida: f.unidad_medida,
          precio_unitario: f.precio_unitario,
          descuento: f.descuento,
          notas: f.notas ?? null,
        })) ?? [],
      })
    }
  }, [oferta, reset])

  if (ofertaLoading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  async function onSubmit(values: OfertaFormValues) {
    try {
      await actualizarOferta(id, values)
      toast.success("Oferta actualizada correctamente")
      router.push(`/ofertas/${id}`)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div>
      <PageHeader title="Editar Oferta" description="Modifica los datos de la oferta">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <h2 className="text-lg font-semibold">Datos Generales</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente *</label>
              <select {...register("cliente_id")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar cliente...</option>
                {clientes?.map((c: { id: string; nombre: string }) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              {errors.cliente_id && <p className="text-xs text-destructive">{errors.cliente_id.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Comercial *</label>
              <select {...register("comercial_id")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar comercial...</option>
                {codificadores?.comerciales?.map((c: { id: string; nombre: string }) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              {errors.comercial_id && <p className="text-xs text-destructive">{errors.comercial_id.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Moneda</label>
              <select {...register("moneda")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {codificadores?.monedas?.map((m: { codigo: string; nombre: string }) => (
                  <option key={m.codigo} value={m.codigo}>{m.codigo} - {m.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Emisión</label>
              <Input type="date" {...register("fecha_emision")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Vigencia</label>
              <Input type="date" {...register("fecha_vigencia")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Incoterm</label>
              <select {...register("incoterm")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                <option value="FOB">FOB</option>
                <option value="CIF">CIF</option>
                <option value="EXW">EXW</option>
                <option value="DDP">DDP</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo Operación</label>
              <select {...register("tipo_operacion")} className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                <option value="venta_nacional">Venta Nacional</option>
                <option value="importacion">Importación</option>
                <option value="exportacion">Exportación</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Condiciones de Pago</label>
              <Input {...register("condiciones_pago")} placeholder="Ej: 30 días" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Productos</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => append({
              producto_id: "",
              proveedor_id: "",
              cantidad: 1,
              unidad_medida: "pieza",
              precio_unitario: 0,
              descuento: 0,
              notas: null,
            })}>
              <Plus className="h-4 w-4" /> Agregar producto
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Agrega al menos un producto a la oferta.
            </p>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Producto *</label>
                    <select {...register(`fichas.${index}.producto_id`)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                      <option value="">Seleccionar...</option>
                      {productos?.map((p: { id: string; nombre: string; codigo: string }) => (
                        <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Proveedor</label>
                    <select {...register(`fichas.${index}.proveedor_id`)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                      <option value="">Seleccionar...</option>
                      {proveedores?.map((p: { id: string; nombre: string }) => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Unidad</label>
                    <select {...register(`fichas.${index}.unidad_medida`)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                      <option value="">Seleccionar...</option>
                      {codificadores?.unidadesMedida?.map((u: { codigo: string; nombre: string }) => (
                        <option key={u.codigo} value={u.codigo}>{u.codigo} - {u.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" className="mt-6 shrink-0" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Cantidad</label>
                  <Input type="number" step="0.001" {...register(`fichas.${index}.cantidad`)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Precio Unitario</label>
                  <Input type="number" step="0.01" {...register(`fichas.${index}.precio_unitario`)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Descuento (%)</label>
                  <Input type="number" step="0.01" {...register(`fichas.${index}.descuento`)} />
                </div>
              </div>
            </div>
          ))}

          {errors.fichas && <p className="text-xs text-destructive">{errors.fichas.message ?? errors.fichas.root?.message}</p>}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
