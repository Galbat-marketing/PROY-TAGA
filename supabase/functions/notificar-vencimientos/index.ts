import { createSupabaseClient } from "../_shared/supabase.ts"
import { ok, serverError } from "../_shared/response.ts"

/*
 * Scheduled function (via pg_cron or Supabase cron)
 * Runs daily to check for expiring items and creates notifications
 */

Deno.serve(async (_req: Request) => {
  try {
    const supabase = createSupabaseClient(_req)
    const hoy = new Date()
    const results = {
      facturas_vencidas: 0,
      contenedores_proximos: 0,
      ofertas_por_vencer: 0,
      notificaciones_creadas: 0,
    }

    // 1. Facturas vencidas o por vencer (7 días)
    const { data: facturas } = await supabase
      .from("facturas")
      .select("id, folio, total, fecha_vencimiento, cliente_id")
      .in("estado", ["pendiente", "parcial"])
      .is("deleted_at", null)
      .lte("fecha_vencimiento", new Date(hoy.getTime() + 7 * 86400000).toISOString().split("T")[0])

    for (const factura of facturas ?? []) {
      const vencida = new Date(factura.fecha_vencimiento) < hoy
      const titulo = vencida ? "Factura vencida" : "Factura por vencer"
      const tipo = vencida ? "alerta" as const : "vencimiento" as const

      const { data: usuarios } = await supabase
        .from("usuarios")
        .select("id")
        .limit(5)

      for (const usuario of usuarios ?? []) {
        const { error } = await supabase.from("notificaciones").insert({
          usuario_id: usuario.id,
          tipo,
          titulo,
          mensaje: `La factura ${factura.folio} por $${Number(factura.total).toLocaleString()} ${
            vencida ? "está vencida" : "vence el " + factura.fecha_vencimiento
          }`,
          referencia_modulo: "facturas",
          referencia_id: factura.id,
        })
        if (!error) results.notificaciones_creadas++
      }
    }
    results.facturas_vencidas = facturas?.length ?? 0

    // 2. Contenedores con ETA próxima (3 días)
    const { data: contenedores } = await supabase
      .from("contenedores")
      .select("id, numero_contenedor, eta, puerto_destino")
      .in("estado", ["programado", "en_transito"])
      .is("deleted_at", null)
      .lte("eta", new Date(hoy.getTime() + 3 * 86400000).toISOString().split("T")[0])
      .gte("eta", hoy.toISOString().split("T")[0])

    for (const cont of contenedores ?? []) {
      const { data: usuarios } = await supabase
        .from("usuarios")
        .select("id")
        .limit(5)

      for (const usuario of usuarios ?? []) {
        const { error } = await supabase.from("notificaciones").insert({
          usuario_id: usuario.id,
          tipo: "alerta",
          titulo: "Contenedor próximo a llegar",
          mensaje: `El contenedor ${cont.numero_contenedor} tiene ETA el ${cont.eta} en ${cont.puerto_destino}`,
          referencia_modulo: "contenedores",
          referencia_id: cont.id,
        })
        if (!error) results.notificaciones_creadas++
      }
    }
    results.contenedores_proximos = contenedores?.length ?? 0

    // 3. Ofertas próximas a vencer
    const { data: ofertas } = await supabase
      .from("ofertas")
      .select("id, folio, cliente_id, fecha_vigencia")
      .eq("estado", "enviada")
      .is("deleted_at", null)
      .lte("fecha_vigencia", new Date(hoy.getTime() + 5 * 86400000).toISOString().split("T")[0])
      .gte("fecha_vigencia", hoy.toISOString().split("T")[0])

    for (const oferta of ofertas ?? []) {
      const { data: comercial } = await supabase
        .from("ofertas")
        .select("comercial_id")
        .eq("id", oferta.id)
        .single()

      if (comercial) {
        const { error } = await supabase.from("notificaciones").insert({
          usuario_id: comercial.comercial_id,
          tipo: "vencimiento",
          titulo: "Oferta por vencer",
          mensaje: `La oferta ${oferta.folio} vence el ${oferta.fecha_vigencia}`,
          referencia_modulo: "ofertas",
          referencia_id: oferta.id,
        })
        if (!error) results.notificaciones_creadas++
      }
    }
    results.ofertas_por_vencer = ofertas?.length ?? 0

    return ok({
      message: "Revisión de vencimientos completada",
      resultados: results,
    })
  } catch (error) {
    return serverError(error)
  }
})
