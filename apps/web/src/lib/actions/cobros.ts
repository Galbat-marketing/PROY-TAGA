"use server"

import { createServerSupabase } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function getCobros() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("cobros")
    .select("*, facturas!inner(folio, clientes!inner(nombre))")
    .is("deleted_at", null)
    .order("fecha_cobro", { ascending: false })
  if (error) throw new Error("Error al cargar cobros")
  return data.map((c) => {
    const factura = (c as Record<string, unknown>).facturas as Record<string, unknown> | undefined
    return {
      ...c,
      factura_folio: factura?.folio ?? null,
      cliente_nombre: (factura?.clientes as Record<string, unknown> | undefined)?.nombre ?? null,
      facturas: undefined,
    }
  })
}

export async function getCobro(id: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("cobros")
    .select("*, facturas!inner(folio, clientes!inner(nombre))")
    .eq("id", id)
    .single()
  if (error) throw new Error("Cobro no encontrado")
  const factura = (data as Record<string, unknown>).facturas as Record<string, unknown> | undefined
  return {
    ...data,
    factura_folio: factura?.folio ?? null,
    cliente_nombre: (factura?.clientes as Record<string, unknown> | undefined)?.nombre ?? null,
    facturas: undefined,
  }
}

export async function eliminarCobro(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("cobros")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/cobros")
}
