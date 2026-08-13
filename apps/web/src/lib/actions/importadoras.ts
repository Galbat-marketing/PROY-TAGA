"use server"

import { createServerSupabase } from "@/lib/supabase-server"
import { importadoraSchema, type ImportadoraFormValues } from "@shared/schemas"
import { revalidatePath } from "next/cache"

export async function getImportadoras() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("importadoras")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
  if (error) throw new Error("Error al cargar importadoras")
  return data
}

export async function getImportadora(id: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("importadoras")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw new Error("Importadora no encontrada")
  return data
}

export async function crearImportadora(values: ImportadoraFormValues) {
  const supabase = await createServerSupabase()
  const parsed = importadoraSchema.parse(values)
  const { error } = await supabase.from("importadoras").insert(parsed)
  if (error) throw new Error(error.message)
  revalidatePath("/importadoras")
}

export async function actualizarImportadora(id: string, values: ImportadoraFormValues) {
  const supabase = await createServerSupabase()
  const parsed = importadoraSchema.parse(values)
  const { error } = await supabase.from("importadoras").update(parsed).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/importadoras")
}

export async function eliminarImportadora(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("importadoras")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/importadoras")
}
