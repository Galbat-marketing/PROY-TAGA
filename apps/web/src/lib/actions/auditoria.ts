"use server"

import { createServerSupabase } from "@/lib/supabase-server"

export async function getAuditoriaLog() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("auditoria_log")
    .select("id, tabla, operacion, registro_id, usuario_id, datos_previos, datos_nuevos, ip_address, created_at, usuarios!left(nombre, apellido, email)")
    .order("created_at", { ascending: false })
    .limit(200)
  if (error) throw new Error("Error al cargar auditoría")
  return data.map((r) => ({
    ...r,
    usuario_nombre: r.usuarios
       ? ((`${(r.usuarios as { nombre?: string; apellido?: string }).nombre ?? ""} ${(r.usuarios as { nombre?: string; apellido?: string }).apellido ?? ""}`.trim() || (r.usuarios as { email?: string }).email) ?? null)
      : null,
    usuarios: undefined,
  }))
}

export async function getActividadUsuarios() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("actividad_usuarios")
    .select("id, usuario_id, accion, modulo, metadata, ip_address, created_at, usuarios!left(nombre, apellido, email)")
    .order("created_at", { ascending: false })
    .limit(200)
  if (error) throw new Error("Error al cargar actividad")
  return data.map((r) => ({
    ...r,
    usuario_nombre: r.usuarios
       ? ((`${(r.usuarios as { nombre?: string; apellido?: string }).nombre ?? ""} ${(r.usuarios as { nombre?: string; apellido?: string }).apellido ?? ""}`.trim() || (r.usuarios as { email?: string }).email) ?? null)
      : null,
    usuarios: undefined,
  }))
}
