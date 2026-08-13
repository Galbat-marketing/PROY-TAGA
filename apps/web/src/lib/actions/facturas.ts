"use server"

import { createServerSupabase } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function getFacturas() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("facturas")
    .select("*, clientes!inner(nombre)")
    .is("deleted_at", null)
    .order("fecha_emision", { ascending: false })
  if (error) throw new Error("Error al cargar facturas")
  return data.map((f) => ({
    ...f,
    cliente_nombre: (f as Record<string, unknown>).clientes
      ? ((f as Record<string, unknown>).clientes as Record<string, unknown>).nombre
      : null,
    clientes: undefined,
  }))
}

export async function getFactura(id: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("facturas")
    .select("*, clientes!inner(nombre)")
    .eq("id", id)
    .single()
  if (error) throw new Error("Factura no encontrada")
  return {
    ...data,
    cliente_nombre: (data as Record<string, unknown>).clientes
      ? ((data as Record<string, unknown>).clientes as Record<string, unknown>).nombre
      : null,
    clientes: undefined,
  }
}

export async function actualizarEstadoFactura(id: string, estado: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("facturas")
    .update({ estado: estado as never })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/facturas")
}

export async function eliminarFactura(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("facturas")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/facturas")
}
