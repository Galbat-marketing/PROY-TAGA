"use server"

import { createServerSupabase } from "@/lib/supabase-server"
import { clienteSchema, type ClienteFormValues } from "@shared/schemas"
import { revalidatePath } from "next/cache"

export async function getClientes() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("clientes")
    .select("*, usuarios!left(nombre, apellido)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  if (error) throw new Error("Error al cargar clientes")
  return data.map((c) => ({
    ...c,
    vendedor_nombre: c.usuarios
      ? `${(c.usuarios as { nombre?: string; apellido?: string }).nombre ?? ""} ${(c.usuarios as { nombre?: string; apellido?: string }).apellido ?? ""}`.trim()
      : null,
    usuarios: undefined,
  }))
}

export async function getCliente(id: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("clientes")
    .select("*, usuarios!left(nombre, apellido)")
    .eq("id", id)
    .single()

  if (error) throw new Error("Cliente no encontrado")
  return {
    ...data,
    vendedor_nombre: data.usuarios
      ? `${(data.usuarios as { nombre?: string; apellido?: string }).nombre ?? ""} ${(data.usuarios as { nombre?: string; apellido?: string }).apellido ?? ""}`.trim()
      : null,
    usuarios: undefined,
  }
}

export async function crearCliente(values: ClienteFormValues) {
  const supabase = await createServerSupabase()
  const parsed = clienteSchema.parse(values)
  const { error } = await supabase.from("clientes").insert(parsed)
  if (error) throw new Error(error.message)
  revalidatePath("/clientes")
}

export async function actualizarCliente(id: string, values: ClienteFormValues) {
  const supabase = await createServerSupabase()
  const parsed = clienteSchema.parse(values)
  const { error } = await supabase.from("clientes").update(parsed).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/clientes")
}

export async function eliminarCliente(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("clientes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/clientes")
}
