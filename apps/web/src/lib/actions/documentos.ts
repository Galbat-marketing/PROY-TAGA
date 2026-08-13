"use server"

import { createServerSupabase } from "@/lib/supabase-server"
import { documentoSchema, type DocumentoFormValues } from "@shared/schemas"
import { revalidatePath } from "next/cache"

export interface DocumentoFiltros {
  cliente_id?: string
  proveedor_id?: string
  producto_id?: string
  oferta_id?: string
  tipo_documento?: string
}

function mapearDocumento(d: Record<string, unknown>) {
  return {
    ...d,
    cliente_nombre: (d.clientes as { nombre?: string } | null)?.nombre ?? null,
    proveedor_nombre: (d.proveedores as { nombre?: string } | null)?.nombre ?? null,
    producto_nombre: (d.productos as { nombre?: string } | null)?.nombre ?? null,
    oferta_folio: (d.ofertas as { folio?: string } | null)?.folio ?? null,
    clientes: undefined,
    proveedores: undefined,
    productos: undefined,
    ofertas: undefined,
  }
}

export async function getDocumentos(filtros: DocumentoFiltros = {}) {
  const supabase = await createServerSupabase()
  let query = supabase
    .from("documentos")
    .select("*, clientes!left(nombre), proveedores!left(nombre), productos!left(nombre), ofertas!left(folio)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  if (filtros.cliente_id) query = query.eq("cliente_id", filtros.cliente_id)
  if (filtros.proveedor_id) query = query.eq("proveedor_id", filtros.proveedor_id)
  if (filtros.producto_id) query = query.eq("producto_id", filtros.producto_id)
  if (filtros.oferta_id) query = query.eq("oferta_id", filtros.oferta_id)
  if (filtros.tipo_documento) query = query.eq("tipo_documento", filtros.tipo_documento)

  const { data, error } = await query

  if (error) throw new Error("Error al cargar documentos")
  return (data ?? []).map(mapearDocumento)
}

export async function getDocumento(id: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("documentos")
    .select("*, clientes!left(nombre), proveedores!left(nombre), productos!left(nombre), ofertas!left(folio)")
    .eq("id", id)
    .single()

  if (error) throw new Error("Documento no encontrado")
  return mapearDocumento(data as Record<string, unknown>)
}

export async function getVersiones(documentoId: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("versiones_documento")
    .select("*, usuarios!left(nombre, apellido)")
    .eq("documento_id", documentoId)
    .order("version", { ascending: false })

  if (error) throw new Error("Error al cargar versiones")
  return data.map((v) => ({
    ...v,
    subido_por_nombre: v.usuarios
      ? `${(v.usuarios as { nombre?: string; apellido?: string }).nombre ?? ""} ${(v.usuarios as { nombre?: string; apellido?: string }).apellido ?? ""}`.trim()
      : null,
    usuarios: undefined,
  }))
}

export async function getHistorial(documentoId: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("historial_documento")
    .select("*, usuarios!left(nombre, apellido)")
    .eq("documento_id", documentoId)
    .order("created_at", { ascending: false })

  if (error) throw new Error("Error al cargar historial")
  return data.map((h) => ({
    ...h,
    usuario_nombre: h.usuarios
      ? `${(h.usuarios as { nombre?: string; apellido?: string }).nombre ?? ""} ${(h.usuarios as { nombre?: string; apellido?: string }).apellido ?? ""}`.trim()
      : null,
    usuarios: undefined,
  }))
}

export async function crearDocumento(values: DocumentoFormValues) {
  const supabase = await createServerSupabase()
  const parsed = documentoSchema.parse(values)

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("No autorizado")

  const { data: documento, error } = await supabase
    .from("documentos")
    .insert({
      ...parsed,
      storage_path: "",
      tags: parsed.tags ?? [],
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/documentos")
  return documento
}

export async function subirArchivo(
  documentoId: string,
  file: File,
  notasCambio?: string
) {
  const supabase = await createServerSupabase()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("No autorizado")

  const fileExt = file.name.split(".").pop()
  const filePath = `${documentoId}/${crypto.randomUUID()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from("documentos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (uploadError) throw new Error(uploadError.message)

  const { error: verError } = await supabase
    .from("versiones_documento")
    .insert({
      documento_id: documentoId,
      storage_path: filePath,
      file_size: file.size,
      subido_por: user.user.id,
      notas_cambio: notasCambio ?? null,
    })

  if (verError) throw new Error(verError.message)

  await supabase
    .from("documentos")
    .update({
      storage_path: filePath,
      file_type: file.type,
      file_size: file.size,
    })
    .eq("id", documentoId)

  revalidatePath("/documentos")
  return filePath
}

export async function obtenerUrlDescarga(storagePath: string) {
  const supabase = await createServerSupabase()
  const { data } = await supabase.storage
    .from("documentos")
    .createSignedUrl(storagePath, 3600)

  if (!data?.signedUrl) throw new Error("No se pudo generar URL de descarga")
  return data.signedUrl
}

export async function firmarDocumento(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("documentos")
    .update({ firmado: true })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/documentos")
}

export async function actualizarDocumento(id: string, values: Partial<DocumentoFormValues>) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("documentos")
    .update(values)
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/documentos")
}

export async function eliminarDocumento(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("documentos")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/documentos")
}
