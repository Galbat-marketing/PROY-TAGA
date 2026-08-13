"use server"

import { createServerSupabase } from "@/lib/supabase-server"
import { proveedorSchema, type ProveedorFormValues } from "@shared/schemas"
import { revalidatePath } from "next/cache"

export async function getProveedores() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("proveedores")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
  if (error) throw new Error("Error al cargar proveedores")
  return data
}

export async function getProveedor(id: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("proveedores")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw new Error("Proveedor no encontrado")
  return data
}

export async function crearProveedor(values: ProveedorFormValues) {
  const supabase = await createServerSupabase()
  const parsed = proveedorSchema.parse(values)
  const { error } = await supabase.from("proveedores").insert(parsed)
  if (error) throw new Error(error.message)
  revalidatePath("/proveedores")
}

export async function actualizarProveedor(id: string, values: ProveedorFormValues) {
  const supabase = await createServerSupabase()
  const parsed = proveedorSchema.parse(values)
  const { error } = await supabase.from("proveedores").update(parsed).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/proveedores")
}

export async function eliminarProveedor(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("proveedores")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/proveedores")
}
