"use server"

import { createClient } from "@supabase/supabase-js"
import { createServerSupabase } from "@/lib/supabase-server"
import { ofertaSchema, aprobarOfertaSchema, type OfertaFormValues, type AprobarOfertaFormValues } from "@shared/schemas"
import { revalidatePath } from "next/cache"

export async function getOfertas() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("ofertas")
    .select("*, clientes!left(nombre), codificador_comerciales!left(nombre)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  if (error) throw new Error("Error al cargar ofertas")
  return data.map((o) => ({
    ...o,
    cliente_nombre: (o.clientes as { nombre?: string } | null)?.nombre ?? null,
    clientes: undefined,
    comercial_nombre: (o.codificador_comerciales as { nombre?: string } | null)?.nombre ?? null,
    codificador_comerciales: undefined,
    fichas: undefined,
  }))
}

export async function getOferta(id: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("ofertas")
    .select("*, clientes!left(nombre), codificador_comerciales!left(nombre), fichas_oferta(*, productos!left(nombre, codigo), proveedores!left(nombre))")
    .eq("id", id)
    .single()

  if (error) throw new Error("Oferta no encontrada")
  return {
    ...data,
    cliente_nombre: (data.clientes as { nombre?: string } | null)?.nombre ?? null,
    clientes: undefined,
    comercial_nombre: (data.codificador_comerciales as { nombre?: string } | null)?.nombre ?? null,
    codificador_comerciales: undefined,
    fichas: (data.fichas_oferta ?? []).map((f: Record<string, unknown>) => ({
      ...f,
      producto_nombre: (f.productos as { nombre?: string } | null)?.nombre ?? null,
      productoCodigo: (f.productos as { codigo?: string } | null)?.codigo ?? null,
      proveedor_nombre: (f.proveedores as { nombre?: string } | null)?.nombre ?? null,
      productos: undefined,
      proveedores: undefined,
    })),
    fichas_oferta: undefined,
  }
}

export async function crearOferta(values: OfertaFormValues) {
  const supabase = await createServerSupabase()
  const parsed = ofertaSchema.parse(values)

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("No autorizado")

  const { fichas, ...ofertaData } = parsed
  const { data: oferta, error: ofError } = await supabase
    .from("ofertas")
    .insert({
      ...ofertaData,
      estado: "borrador",
    })
    .select()
    .single()

  if (ofError || !oferta) throw new Error(ofError?.message ?? "Error al crear oferta")

  if (fichas?.length) {
    const fichasConOferta = fichas.map((f) => ({
      producto_id: f.producto_id,
      proveedor_id: f.proveedor_id || null,
      cantidad: f.cantidad,
      unidad_medida: f.unidad_medida,
      precio_unitario: f.precio_unitario,
      descuento: f.descuento,
      notas: f.notas ?? null,
      oferta_id: oferta.id,
    }))
    const { error: fiError } = await supabase
      .from("fichas_oferta")
      .insert(fichasConOferta)
    if (fiError) throw new Error(fiError.message)
  }

  revalidatePath("/ofertas")
  return oferta
}

export async function actualizarEstadoOferta(id: string, estado: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("ofertas")
    .update({ estado: estado as never })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/ofertas")
}

export async function aprobarOferta(id: string, values: AprobarOfertaFormValues) {
  const supabase = await createServerSupabase()
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const parsed = aprobarOfertaSchema.parse(values)
  console.log("[DEBUG] Cobro insert - parsed.tipo_cambio:", parsed.tipo_cambio, "| parsed.porcentaje_ganancia:", parsed.porcentaje_ganancia)

  const { data: oferta, error: ofertaError } = await supabase
    .from("ofertas")
    .select("*, fichas_oferta(*, proveedores!left(nombre))")
    .eq("id", id)
    .single()
  if (ofertaError || !oferta) throw new Error("Oferta no encontrada")

  const updateData: Record<string, unknown> = {
    condiciones_pago: parsed.condiciones_pago,
    incoterm: parsed.incoterm,
    tipo_cambio: parsed.tipo_cambio,
    descuento_global: parsed.descuento_global,
    fecha_vigencia: parsed.fecha_vigencia,
    notas_internas: parsed.notas_internas,
    estado: "aceptada",
  }
  if (parsed.porcentaje_ganancia !== undefined) {
    updateData.porcentaje_ganancia = parsed.porcentaje_ganancia
  }
  const { error: updateError } = await supabase
    .from("ofertas")
    .update(updateData)
    .eq("id", id)
  if (updateError) throw new Error(updateError.message)

  const { data: ultima } = await supabase
    .from("facturas")
    .select("folio")
    .like("folio", "FAC-%")
    .order("folio", { ascending: false })
    .limit(1)
  const ultimoNum = ultima?.length
    ? parseInt((ultima[0] as { folio: string }).folio.replace("FAC-", ""), 10) || 0
    : 0
  const folioFactura = `FAC-${String(ultimoNum + 1).padStart(5, "0")}`
  const hoy = new Date().toISOString().split("T")[0]

  const { data: facturaCreada, error: facturaError } = await supabase.from("facturas").insert({
    folio: folioFactura,
    oferta_id: id,
    cliente_id: oferta.cliente_id,
    tipo: "venta",
    subtotal: oferta.subtotal ?? 0,
    iva: oferta.iva ?? 0,
    total: oferta.total ?? 0,
    moneda: oferta.moneda ?? "USD",
    tipo_cambio: parsed.tipo_cambio,
    fecha_emision: hoy,
    fecha_vencimiento: parsed.fecha_vigencia,
    estado: "pendiente",
  }).select("id").single()
  if (facturaError) throw new Error("Error al generar factura: " + facturaError.message)

  const facturaId = facturaCreada.id

  const { error: cobroError } = await supabase.from("cobros").insert({
    factura_id: facturaId,
    monto: oferta.total ?? 0,
    moneda: oferta.moneda ?? "USD",
    tipo_cambio: parsed.tipo_cambio,
    fecha_cobro: hoy,
    metodo_pago: parsed.metodo_pago,
    referencia: parsed.referencia,
    notas: `Cobro generado de oferta ${oferta.folio ?? ""}`,
  })
  if (cobroError) throw new Error("Error al generar cobro: " + cobroError.message)

  // Group fichas by proveedor and create one payment per supplier
  const factorGanancia = parsed.porcentaje_ganancia != null
    ? (1 - parsed.porcentaje_ganancia / 100)
    : 1

  const fichas = (oferta.fichas_oferta ?? []) as Array<{
    proveedor_id: string | null
    proveedores: { nombre: string } | null
    cantidad: number
    precio_unitario: number
    subtotal: number
  }>
  const pagosPorProveedor = new Map<string, { proveedor_id: string | null; proveedor_nombre: string; monto: number }>()

  for (const f of fichas) {
    const pid = f.proveedor_id ?? "sin_proveedor"
    const pnombre = (f.proveedores as { nombre: string } | null)?.nombre ?? "Sin proveedor"
    if (!pagosPorProveedor.has(pid)) {
      pagosPorProveedor.set(pid, { proveedor_id: f.proveedor_id, proveedor_nombre: pnombre, monto: 0 })
    }
    pagosPorProveedor.get(pid)!.monto += Number(f.subtotal) * factorGanancia
  }

  for (const pago of pagosPorProveedor.values()) {
    const { error: pagoError } = await supabaseAdmin.from("pagos").insert({
      oferta_id: id,
      proveedor_id: pago.proveedor_id,
      monto: Math.round(pago.monto * 100) / 100,
      moneda: oferta.moneda ?? "USD",
      tipo_cambio: parsed.tipo_cambio,
      fecha_pago: hoy,
      estado: "pendiente_aprobacion",
      notas: `Generado de oferta ${oferta.folio ?? ""} — ${pago.proveedor_nombre}`,
    })
    if (pagoError) throw new Error("Error al generar pago: " + pagoError.message)
  }

  revalidatePath("/ofertas")
  revalidatePath("/facturas")
  revalidatePath("/pagos")
  revalidatePath("/cobros")
}

export async function actualizarOferta(id: string, values: OfertaFormValues) {
  const supabase = await createServerSupabase()
  const parsed = ofertaSchema.parse(values)

  const { fichas, ...ofertaData } = parsed

  const { error: ofError } = await supabase
    .from("ofertas")
    .update(ofertaData)
    .eq("id", id)
  if (ofError) throw new Error(ofError.message)

  if (fichas !== undefined) {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error: delError } = await supabaseAdmin
      .from("fichas_oferta")
      .update({ deleted_at: new Date().toISOString() })
      .eq("oferta_id", id)
    if (delError) throw new Error("Error al actualizar productos: " + delError.message)

    const fichasConOferta = fichas.map((f) => ({
      producto_id: f.producto_id,
      proveedor_id: f.proveedor_id || null,
      cantidad: f.cantidad,
      unidad_medida: f.unidad_medida,
      precio_unitario: f.precio_unitario,
      descuento: f.descuento,
      notas: f.notas ?? null,
      oferta_id: id,
    }))
    const { error: fiError } = await supabaseAdmin
      .from("fichas_oferta")
      .insert(fichasConOferta)
    if (fiError) throw new Error("Error al guardar productos: " + fiError.message)
  }

  revalidatePath("/ofertas")
}

export async function getOfertasByComercial(comercialId: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("ofertas")
    .select("*, clientes!left(nombre)")
    .is("deleted_at", null)
    .eq("comercial_id", comercialId)
    .order("created_at", { ascending: false })

  if (error) throw new Error("Error al cargar ofertas del comercial")
  return data.map((o) => ({
    ...o,
    cliente_nombre: (o.clientes as { nombre?: string } | null)?.nombre ?? null,
    clientes: undefined,
    fichas: undefined,
  }))
}

export async function eliminarOferta(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("ofertas")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/ofertas")
}
