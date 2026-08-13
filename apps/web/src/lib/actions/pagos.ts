"use server"

import { createServerSupabase } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { pagoSchema, type PagoFormValues } from "@shared/schemas"

export async function getPagos() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("pagos")
    .select("*, proveedores!left(nombre)")
    .is("deleted_at", null)
    .order("fecha_pago", { ascending: false })
  if (error) throw new Error("Error al cargar pagos")
  return data.map((p) => ({
    ...p,
    proveedor_nombre: (p as Record<string, unknown>).proveedores
      ? ((p as Record<string, unknown>).proveedores as Record<string, unknown>).nombre
      : null,
    proveedores: undefined,
  }))
}

export async function getPago(id: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("pagos")
    .select("*, proveedores!left(nombre)")
    .eq("id", id)
    .single()
  if (error) throw new Error("Pago no encontrado")
  return {
    ...data,
    proveedor_nombre: (data as Record<string, unknown>).proveedores
      ? ((data as Record<string, unknown>).proveedores as Record<string, unknown>).nombre
      : null,
    proveedores: undefined,
  }
}

export async function actualizarEstadoPago(id: string, estado: string, data?: { metodo_pago?: string; referencia?: string }) {
  const supabase = await createServerSupabase()
  const updateData: Record<string, unknown> = { estado: estado as never }
  if (data?.metodo_pago) updateData.metodo_pago = data.metodo_pago
  if (data?.referencia) updateData.referencia = data.referencia
  const { error } = await supabase
    .from("pagos")
    .update(updateData)
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/pagos")
}

export async function eliminarPago(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("pagos")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/pagos")
}

export async function crearPago(values: PagoFormValues) {
  const supabase = await createServerSupabase()
  const parsed = pagoSchema.parse(values)

  const insertData: Record<string, unknown> = {
    monto: parsed.monto,
    moneda: parsed.moneda,
    fecha_pago: parsed.fecha_pago,
    metodo_pago: parsed.metodo_pago,
    referencia: parsed.referencia,
    notas: parsed.notas || null,
  }

  if (parsed.tipo_cambio) insertData.tipo_cambio = parsed.tipo_cambio

  if (parsed.proveedor_id) {
    insertData.proveedor_id = parsed.proveedor_id
  } else {
    insertData.beneficiario = parsed.beneficiario || "Tercero"
  }

  const { error } = await supabase.from("pagos").insert(insertData)
  if (error) throw new Error(error.message)
  revalidatePath("/pagos")
}
