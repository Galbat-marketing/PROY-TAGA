"use server"

import { createServerSupabase } from "@/lib/supabase-server"
import { contenedorSchema, type ContenedorFormValues } from "@shared/schemas"
import { revalidatePath } from "next/cache"

export async function getContenedores() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("contenedores")
    .select("*, importadoras!left(nombre)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
  if (error) throw new Error("Error al cargar contenedores")
  return data.map((c) => ({
    ...c,
    importadora_nombre: (c.importadoras as { nombre?: string } | null)?.nombre ?? null,
    importadoras: undefined,
  }))
}

export async function getContenedor(id: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("contenedores")
    .select("*, importadoras!left(nombre), embarques(*, usuarios!left(nombre, apellido))")
    .eq("id", id)
    .single()
  if (error) throw new Error("Contenedor no encontrado")
  return {
    ...data,
    importadora_nombre: (data.importadoras as { nombre?: string } | null)?.nombre ?? null,
    importadoras: undefined,
  }
}

export async function crearContenedor(values: ContenedorFormValues) {
  const supabase = await createServerSupabase()
  const parsed = contenedorSchema.parse(values)
  const { error } = await supabase.from("contenedores").insert(parsed)
  if (error) throw new Error(error.message)
  revalidatePath("/contenedores")
}

export async function actualizarContenedor(id: string, values: ContenedorFormValues) {
  const supabase = await createServerSupabase()
  const parsed = contenedorSchema.parse(values)
  const { error } = await supabase.from("contenedores").update(parsed).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/contenedores")
}
