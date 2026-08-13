"use server"

import { createServerSupabase } from "@/lib/supabase-server"

export interface PagoPendiente {
  id: string
  comercial_id: string
  comercial_nombre: string
  comercial_codigo: string
  monto: number
}

export interface DashboardKPIs {
  ventas_mes: number
  cobrado_mes: number
  pendiente_total: number
  ofertas_activas: number
  variacion_ventas: number
  variacion_cobrado: number
  ofertas_nuevas: number
  ofertas_recientes: Array<{
    id: string
    folio: string
    cliente_nombre: string | null
    total: number
    estado: string
    comercial_nombre: string | null
    created_at: string
  }>
  contenedores_activos: number
  contenedores_proximos: number
  contenedores_atrasados: number
  contenedores_lista: Array<{
    id: string
    numero_contenedor: string
    estado: string
    naviera: string | null
    eta: string | null
    puerto_origen: string | null
    puerto_destino: string | null
  }>
  comisiones_pendientes: PagoPendiente[]
}

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const supabase = await createServerSupabase()
  const now = new Date()
  const mesInicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const mesAnteriorInicio = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const mesAnteriorFin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Ventas del mes actual
  const { data: ventasMes } = await supabase
    .from("ofertas")
    .select("total")
    .in("estado", ["aceptada", "convertida"])
    .is("deleted_at", null)
    .gte("created_at", mesInicio)

  // Ventas del mes anterior (para variación)
  const { data: ventasMesAnterior } = await supabase
    .from("ofertas")
    .select("total")
    .in("estado", ["aceptada", "convertida"])
    .is("deleted_at", null)
    .gte("created_at", mesAnteriorInicio)
    .lt("created_at", mesAnteriorFin)

  // Cobros del mes
  const { data: cobrosMes } = await supabase
    .from("cobros")
    .select("monto")
    .is("deleted_at", null)
    .gte("fecha_cobro", mesInicio)

  // Cobros del mes anterior
  const { data: cobrosAnterior } = await supabase
    .from("cobros")
    .select("monto")
    .is("deleted_at", null)
    .gte("fecha_cobro", mesAnteriorInicio)
    .lt("fecha_cobro", mesAnteriorFin)

  // Saldo pendiente total
  const { data: facturasPendientes } = await supabase
    .from("facturas")
    .select("total, id")
    .in("estado", ["pendiente", "parcial"])
    .is("deleted_at", null)

  let pendienteTotal = 0
  if (facturasPendientes) {
    for (const f of facturasPendientes) {
      const { data: cobrosFactura } = await supabase
        .from("cobros")
        .select("monto")
        .eq("factura_id", f.id)
        .is("deleted_at", null)
      const totalCobrado = cobrosFactura?.reduce((s, c) => s + Number(c.monto), 0) ?? 0
      pendienteTotal += Number(f.total) - totalCobrado
    }
  }

  // Ofertas activas (borrador, enviada)
  const { count: ofertasActivas } = await supabase
    .from("ofertas")
    .select("*", { count: "exact", head: true })
    .in("estado", ["enviada"]) //"borrador",
    .is("deleted_at", null)

  // Ofertas nuevas este mes
  const { count: ofertasNuevas } = await supabase
    .from("ofertas")
    .select("*", { count: "exact", head: true })
    .in("estado", ["borrador", "enviada"])
    .is("deleted_at", null)
    .gte("created_at", mesInicio)

  // Ofertas recientes
  const { data: ofertasRecientes } = await supabase
    .from("ofertas")
    .select("id, folio, cliente_id, total, estado, comercial_id, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5)

  // Enrich ofertas with names
  const ofertasRecientesEnriched = await Promise.all(
    (ofertasRecientes ?? []).map(async (o) => {
      let clienteNombre: string | null = null
      let comercialNombre: string | null = null
      if (o.cliente_id) {
        const { data: c } = await supabase.from("clientes").select("nombre").eq("id", o.cliente_id).single()
        clienteNombre = c?.nombre ?? null
      }
      if (o.comercial_id) {
        const { data: u } = await supabase.from("usuarios").select("nombre, apellido").eq("id", o.comercial_id).single()
        comercialNombre = u ? `${u.nombre} ${u.apellido}` : null
      }
      return {
        id: o.id,
        folio: o.folio,
        cliente_nombre: clienteNombre,
        total: Number(o.total),
        estado: o.estado,
        comercial_nombre: comercialNombre,
        created_at: o.created_at,
      }
    })
  )

  // Contenedores activos (no entregados ni cancelados)
  const { data: contenedores } = await supabase
    .from("contenedores")
    .select("id, numero_contenedor, estado, naviera, eta, puerto_origen, puerto_destino")
    .not("estado", "in", '("entregado","cancelado")')
    .is("deleted_at", null)
    .order("eta", { ascending: true })
    .limit(10)

  const contenedoresActivos = contenedores?.length ?? 0
  const contenedoresAtrasados = contenedores?.filter((c) => c.eta && new Date(c.eta) < now) ?? []
  const contenedoresProximos = contenedores?.filter((c) => c.eta && new Date(c.eta) >= now && new Date(c.eta) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) ?? []

  // Comisiones pendientes (desde la vista calculada)
  const { data: comisionesVista } = await supabase
    .from("v_comisiones_comerciales")
    .select("*")
    .gt("comision_total", 0)
    .order("comision_total", { ascending: false })
    .limit(10)

  const comisionesPendientes: PagoPendiente[] = (comisionesVista ?? []).map((c) => {
    const r = c as Record<string, unknown>
    return {
      id: (r.comercial_id ?? r.usuario_id ?? "") as string,
      comercial_id: (r.comercial_id ?? r.usuario_id ?? "") as string,
      comercial_nombre: (r.nombre_comercial ?? "") as string,
      comercial_codigo: (r.codigo_comercial ?? "") as string,
      monto: Number(r.comision_total ?? 0),
    }
  })

  const totalVentasMes = ventasMes?.reduce((s, o) => s + Number(o.total), 0) ?? 0
  const totalVentasAnterior = ventasMesAnterior?.reduce((s, o) => s + Number(o.total), 0) ?? 0
  const totalCobradoMes = cobrosMes?.reduce((s, c) => s + Number(c.monto), 0) ?? 0
  const totalCobradoAnterior = cobrosAnterior?.reduce((s, c) => s + Number(c.monto), 0) ?? 0

  return {
    ventas_mes: totalVentasMes,
    cobrado_mes: totalCobradoMes,
    pendiente_total: pendienteTotal,
    ofertas_activas: ofertasActivas ?? 0,
    variacion_ventas: totalVentasAnterior > 0 ? ((totalVentasMes - totalVentasAnterior) / totalVentasAnterior) * 100 : 0,
    variacion_cobrado: totalCobradoAnterior > 0 ? ((totalCobradoMes - totalCobradoAnterior) / totalCobradoAnterior) * 100 : 0,
    ofertas_nuevas: ofertasNuevas ?? 0,
    ofertas_recientes: ofertasRecientesEnriched,
    contenedores_activos: contenedoresActivos,
    contenedores_proximos: contenedoresProximos.length,
    contenedores_atrasados: contenedoresAtrasados.length,
    contenedores_lista: (contenedores ?? []).map((c) => ({
      id: c.id,
      numero_contenedor: c.numero_contenedor,
      estado: c.estado,
      naviera: c.naviera,
      eta: c.eta,
      puerto_origen: c.puerto_origen,
      puerto_destino: c.puerto_destino,
    })),
    comisiones_pendientes: comisionesPendientes,
  }
}
