"use server"

import { createServerSupabase } from "@/lib/supabase-server"
import { embarqueSchema, type EmbarqueFormValues } from "@shared/schemas"
import { revalidatePath } from "next/cache"

export async function getEmbarques() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("embarques")
    .select("*, contenedores!inner(numero_contenedor)")
    .is("deleted_at", null)
    .order("fecha_evento", { ascending: false })
  if (error) throw new Error("Error al cargar embarques")
  return data.map((e) => ({
    ...e,
    contenedor_numero: (e as Record<string, unknown>).contenedores
      ? ((e as Record<string, unknown>).contenedores as Record<string, unknown>).numero_contenedor
      : null,
    contenedores: undefined,
  }))
}

export async function getEmbarque(id: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("embarques")
    .select("*, contenedores!inner(numero_contenedor)")
    .eq("id", id)
    .single()
  if (error) throw new Error("Embarque no encontrado")
  return {
    ...data,
    contenedor_numero: (data as Record<string, unknown>).contenedores
      ? ((data as Record<string, unknown>).contenedores as Record<string, unknown>).numero_contenedor
      : null,
    contenedores: undefined,
  }
}

export async function crearEmbarque(values: EmbarqueFormValues) {
  const supabase = await createServerSupabase()
  const parsed = embarqueSchema.parse(values)
  const { error } = await supabase.from("embarques").insert({
    ...parsed,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  if (error) throw new Error(error.message)
  revalidatePath("/embarques")
}

export async function actualizarEmbarque(id: string, values: EmbarqueFormValues) {
  const supabase = await createServerSupabase()
  const parsed = embarqueSchema.parse(values)
  const { error } = await supabase.from("embarques").update(parsed).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/embarques")
}

export async function eliminarEmbarque(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("embarques")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/embarques")
}
