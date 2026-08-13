"use server"

import { createServerSupabase } from "@/lib/supabase-server"
import { productoSchema, type ProductoFormValues } from "@shared/schemas"
import { revalidatePath } from "next/cache"

export async function getProductos() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("productos")
    .select("*, categorias_productos!left(nombre)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  if (error) throw new Error("Error al cargar productos")
  return data.map((p) => ({
    ...p,
    categoria_nombre: (p.categorias_productos as { nombre?: string } | null)?.nombre ?? null,
    categorias_productos: undefined,
  }))
}

export async function getProducto(id: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("productos")
    .select("*, categorias_productos!left(nombre)")
    .eq("id", id)
    .single()

  if (error) throw new Error("Producto no encontrado")
  return {
    ...data,
    categoria_nombre: (data.categorias_productos as { nombre?: string } | null)?.nombre ?? null,
    categorias_productos: undefined,
  }
}

export async function subirImagenProducto(
  productId: string,
  file: File
): Promise<string> {
  const supabase = await createServerSupabase()
  const fileExt = file.name.split(".").pop()
  const filePath = `productos/${productId}/${crypto.randomUUID()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from("productos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (uploadError) throw new Error(uploadError.message)

  const { data: urlData } = await supabase.storage
    .from("productos")
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

export async function crearProducto(values: ProductoFormValues) {
  const supabase = await createServerSupabase()
  const parsed = productoSchema.parse(values)
  const { error } = await supabase.from("productos").insert(parsed)
  if (error) throw new Error(error.message)
  revalidatePath("/productos")
}

export async function actualizarProducto(id: string, values: ProductoFormValues) {
  const supabase = await createServerSupabase()
  const parsed = productoSchema.parse(values)
  const { error } = await supabase.from("productos").update(parsed).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/productos")
}

export async function eliminarProducto(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("productos")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/productos")
}

export async function getCategorias() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("categorias_productos")
    .select("*")
    .is("deleted_at", null)
    .eq("activo", true)
    .order("orden", { ascending: true })

  if (error) throw new Error("Error al cargar categorías")
  return data
}
