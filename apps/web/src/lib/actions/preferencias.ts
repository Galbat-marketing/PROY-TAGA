"use server"

import { createServerSupabase } from "@/lib/supabase-server"

export interface UserPreferences {
  theme_mode?: "light" | "dark" | "system"
  theme_palette?: string
}

export async function obtenerPreferencias(): Promise<UserPreferences | null> {
  const supabase = await createServerSupabase()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData?.user) return null

  const { data, error } = await supabase
    .from("usuarios")
    .select("preferencias")
    .eq("id", authData.user.id)
    .single()

  if (error || !data) return null

  const prefs = data.preferencias as UserPreferences | null
  return prefs
}

export async function actualizarPreferencias(prefs: UserPreferences) {
  const supabase = await createServerSupabase()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData?.user) throw new Error("No autenticado")

  // Merge with existing preferencias to avoid overwriting other keys
  const { data: current } = await supabase
    .from("usuarios")
    .select("preferencias")
    .eq("id", authData.user.id)
    .single()

  const merged = {
    ...(current?.preferencias as object ?? {}),
    ...prefs,
  }

  const { error } = await supabase
    .from("usuarios")
    .update({ preferencias: merged })
    .eq("id", authData.user.id)

  if (error) throw new Error("Error al guardar preferencias")
}
