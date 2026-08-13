"use server"

import { createServerSupabase } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function logout() {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}

export async function getCurrentUser() {
  const supabase = await createServerSupabase()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData?.user) return null

  const { data: userData } = await supabase
    .from("usuarios")
    .select("id, email, nombre, apellido")
    .eq("id", authData.user.id)
    .single()

  return userData ?? null
}
