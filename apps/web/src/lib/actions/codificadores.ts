"use server"

import { createServerSupabase } from "@/lib/supabase-server"
import {
  monedaSchema, unidadMedidaSchema, paisSchema, categoriaProductoSchema, comercialSchema,
  type MonedaFormValues, type UnidadMedidaFormValues, type PaisFormValues, type CategoriaProductoFormValues, type ComercialFormValues,
} from "@shared/schemas"
import { revalidatePath } from "next/cache"

// ============================================
// Monedas
// ============================================
export async function getMonedas() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from("monedas").select("*").is("deleted_at", null).order("codigo")
  if (error) throw new Error("Error al cargar monedas")
  return data
}

export async function crearMoneda(values: MonedaFormValues) {
  const supabase = await createServerSupabase()
  const parsed = monedaSchema.parse(values)
  const { error } = await supabase.from("monedas").insert(parsed)
  if (error) throw new Error(error.message)
  revalidatePath("/configuracion/codificadores")
}

export async function actualizarMoneda(id: string, values: MonedaFormValues) {
  const supabase = await createServerSupabase()
  const parsed = monedaSchema.parse(values)
  const { error } = await supabase.from("monedas").update(parsed).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/configuracion/codificadores")
}

export async function eliminarMoneda(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase.from("monedas").update({ deleted_at: new Date().toISOString() }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/configuracion/codificadores")
}

// ============================================
// Unidades de Medida
// ============================================
export async function getUnidadesMedida() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from("unidades_medida").select("*").is("deleted_at", null).order("codigo")
  if (error) throw new Error("Error al cargar unidades de medida")
  return data
}

export async function crearUnidadMedida(values: UnidadMedidaFormValues) {
  const supabase = await createServerSupabase()
  const parsed = unidadMedidaSchema.parse(values)
  const { error } = await supabase.from("unidades_medida").insert(parsed)
  if (error) throw new Error(error.message)
  revalidatePath("/configuracion/codificadores")
}

export async function actualizarUnidadMedida(id: string, values: UnidadMedidaFormValues) {
  const supabase = await createServerSupabase()
  const parsed = unidadMedidaSchema.parse(values)
  const { error } = await supabase.from("unidades_medida").update(parsed).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/configuracion/codificadores")
}

export async function eliminarUnidadMedida(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase.from("unidades_medida").update({ deleted_at: new Date().toISOString() }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/configuracion/codificadores")
}

// ============================================
// Países
// ============================================
export async function getPaises() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from("paises").select("*").is("deleted_at", null).order("codigo")
  if (error) throw new Error("Error al cargar países")
  return data
}

export async function crearPais(values: PaisFormValues) {
  const supabase = await createServerSupabase()
  const parsed = paisSchema.parse(values)
  const { error } = await supabase.from("paises").insert(parsed)
  if (error) throw new Error(error.message)
  revalidatePath("/configuracion/codificadores")
}

export async function actualizarPais(id: string, values: PaisFormValues) {
  const supabase = await createServerSupabase()
  const parsed = paisSchema.parse(values)
  const { error } = await supabase.from("paises").update(parsed).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/configuracion/codificadores")
}

export async function eliminarPais(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase.from("paises").update({ deleted_at: new Date().toISOString() }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/configuracion/codificadores")
}

// ============================================
// Categorías de Producto
// ============================================
export async function getCategoriasProducto() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from("categorias_productos").select("*").is("deleted_at", null).order("orden", { ascending: true })
  if (error) throw new Error("Error al cargar categorías")
  return data
}

export async function crearCategoriaProducto(values: CategoriaProductoFormValues) {
  const supabase = await createServerSupabase()
  const parsed = categoriaProductoSchema.parse(values)
  const { error } = await supabase.from("categorias_productos").insert(parsed)
  if (error) throw new Error(error.message)
  revalidatePath("/configuracion/codificadores")
}

export async function actualizarCategoriaProducto(id: string, values: CategoriaProductoFormValues) {
  const supabase = await createServerSupabase()
  const parsed = categoriaProductoSchema.parse(values)
  const { error } = await supabase.from("categorias_productos").update(parsed).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/configuracion/codificadores")
}

export async function eliminarCategoriaProducto(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase.from("categorias_productos").update({ deleted_at: new Date().toISOString() }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/configuracion/codificadores")
}

// ============================================
// Comerciales
// ============================================
export async function getComerciales() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from("codificador_comerciales").select("*").is("deleted_at", null).order("codigo")
  if (error) throw new Error("Error al cargar comerciales")
  return data
}

export async function getComercial(id: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from("codificador_comerciales").select("*").eq("id", id).single()
  if (error) throw new Error("Comercial no encontrado")
  return data
}

export async function crearComercial(values: ComercialFormValues) {
  const supabase = await createServerSupabase()
  const parsed = comercialSchema.parse(values)
  const { error } = await supabase.from("codificador_comerciales").insert(parsed)
  if (error) throw new Error(error.message)
  revalidatePath("/configuracion/codificadores")
}

export async function actualizarComercial(id: string, values: ComercialFormValues) {
  const supabase = await createServerSupabase()
  const parsed = comercialSchema.parse(values)
  const { error } = await supabase.from("codificador_comerciales").update(parsed).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/configuracion/codificadores")
}

export async function eliminarComercial(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase.from("codificador_comerciales").update({ deleted_at: new Date().toISOString() }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/configuracion/codificadores")
}
