import { handleCors } from "../_shared/cors.ts"
import { createSupabaseClient } from "../_shared/supabase.ts"
import { ok, badRequest, unauthorized, serverError } from "../_shared/response.ts"

interface ComisionRequest {
  comercial_id: string
  fecha_desde?: string
  fecha_hasta?: string
}

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const supabase = createSupabaseClient(req)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorized()
    }

    const body: ComisionRequest = await req.json()

    if (!body.comercial_id) {
      return badRequest("comercial_id es requerido")
    }

    // Get commercial info
    const { data: comercial, error: comError } = await supabase
      .from("comerciales")
      .select("*, usuarios!inner(*)")
      .eq("usuario_id", body.comercial_id)
      .single()

    if (comError || !comercial) {
      return badRequest("Comercial no encontrado")
    }

    // Get accepted offers in date range
    let query = supabase
      .from("ofertas")
      .select("id, folio, total, fecha_emision, cliente_id, clientes(nombre)")
      .eq("comercial_id", body.comercial_id)
      .in("estado", ["aceptada", "convertida"])
      .is("deleted_at", null)
      .order("fecha_emision", { ascending: false })

    if (body.fecha_desde) {
      query = query.gte("fecha_emision", body.fecha_desde)
    }
    if (body.fecha_hasta) {
      query = query.lte("fecha_emision", body.fecha_hasta)
    }

    const { data: ofertas, error: ofError } = await query

    if (ofError) {
      return serverError(ofError)
    }

    // Calculate commission
    const totalVentas = ofertas?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0
    let comisionTotal = 0

    if (comercial.tipo_comision === "porcentaje") {
      comisionTotal = totalVentas * (Number(comercial.comision_valor) / 100)
    } else if (comercial.tipo_comision === "fija") {
      comisionTotal = (ofertas?.length ?? 0) * Number(comercial.comision_valor)
    }

    return ok({
      comercial: {
        id: comercial.usuario_id,
        nombre: `${comercial.usuarios?.nombre ?? ""} ${comercial.usuarios?.apellido ?? ""}`.trim(),
        codigo: comercial.codigo,
        tipo_comision: comercial.tipo_comision,
        comision_valor: Number(comercial.comision_valor),
      },
      periodo: {
        desde: body.fecha_desde ?? "sin límite",
        hasta: body.fecha_hasta ?? "sin límite",
      },
      resumen: {
        ofertas_cerradas: ofertas?.length ?? 0,
        ventas_totales: totalVentas,
        comision_total: comisionTotal,
      },
      detalle: ofertas?.map((o) => ({
        folio: o.folio,
        cliente: (o.clientes as { nombre?: string } | null)?.nombre ?? "—",
        total: Number(o.total),
        fecha: o.fecha_emision,
      })) ?? [],
    })
  } catch (error) {
    return serverError(error)
  }
})
