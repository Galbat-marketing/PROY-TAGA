"use server"

import { createServerSupabase } from "@/lib/supabase-server"
import { createClient } from "@supabase/supabase-js"

export async function getUsuarios() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, email, nombre, apellido, telefono, activo, ultimo_acceso, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
  if (error) throw new Error("Error al cargar usuarios")
  return data
}

export async function getRoles() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("roles")
    .select("id, nombre, descripcion, jerarquia")
    .is("deleted_at", null)
    .order("jerarquia", { ascending: false })
  if (error) throw new Error("Error al cargar roles")
  return data
}

export async function crearUsuario(values: {
  email: string
  password: string
  nombre: string
  apellido: string
  rol_id?: string
}) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: values.email,
    password: values.password,
    email_confirm: true,
    user_metadata: {
      nombre: values.nombre,
      apellido: values.apellido,
    },
  })

  if (authError) throw new Error(authError.message)

  if (values.rol_id && authUser.user) {
    const { error: rolError } = await supabaseAdmin
      .from("roles_usuarios")
      .insert({ usuario_id: authUser.user.id, rol_id: values.rol_id })

    if (rolError) throw new Error(rolError.message)
  }

  return authUser
}

// ─── Roles ──────────────────────────────────────────────

export async function getPermisos() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("permisos")
    .select("*")
    .order("modulo", { ascending: true })
    .order("nombre", { ascending: true })
  if (error) throw new Error("Error al cargar permisos")
  return data
}

export async function getRolesPermisos(rolId: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("roles_permisos")
    .select("permiso_id")
    .eq("rol_id", rolId)
  if (error) throw new Error("Error al cargar permisos del rol")
  return data.map((rp) => rp.permiso_id)
}

export async function crearRol(values: {
  nombre: string
  descripcion: string
  jerarquia: number
  permisos: string[]
}) {
  const supabase = await createServerSupabase()
  const { data: rol, error: rolError } = await supabase
    .from("roles")
    .insert({ nombre: values.nombre, descripcion: values.descripcion, jerarquia: values.jerarquia })
    .select()
    .single()
  if (rolError) throw new Error(rolError.message)

  if (values.permisos.length > 0) {
    const { error: permError } = await supabase
      .from("roles_permisos")
      .insert(values.permisos.map((pid) => ({ rol_id: rol.id, permiso_id: pid })))
    if (permError) throw new Error(permError.message)
  }
}

export async function actualizarRol(id: string, values: {
  nombre: string
  descripcion: string
  jerarquia: number
  permisos: string[]
}) {
  const supabase = await createServerSupabase()
  const { error: rolError } = await supabase
    .from("roles")
    .update({ nombre: values.nombre, descripcion: values.descripcion, jerarquia: values.jerarquia })
    .eq("id", id)
  if (rolError) throw new Error(rolError.message)

  await supabase.from("roles_permisos").delete().eq("rol_id", id)
  if (values.permisos.length > 0) {
    const { error: permError } = await supabase
      .from("roles_permisos")
      .insert(values.permisos.map((pid) => ({ rol_id: id, permiso_id: pid })))
    if (permError) throw new Error(permError.message)
  }
}

export async function eliminarRol(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("roles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
}

// ─── Permisos ───────────────────────────────────────────

export async function getPermiso(id: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("permisos")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw new Error("Permiso no encontrado")
  return data
}

export async function crearPermiso(values: {
  codigo: string
  nombre: string
  modulo: string
  accion: string
}) {
  const supabase = await createServerSupabase()
  const { error } = await supabase.from("permisos").insert(values)
  if (error) throw new Error(error.message)
}

export async function actualizarPermiso(id: string, values: {
  codigo: string
  nombre: string
  modulo: string
  accion: string
}) {
  const supabase = await createServerSupabase()
  const { error } = await supabase.from("permisos").update(values).eq("id", id)
  if (error) throw new Error(error.message)
}

export async function eliminarPermiso(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase.from("permisos").delete().eq("id", id)
  if (error) throw new Error(error.message)
}
