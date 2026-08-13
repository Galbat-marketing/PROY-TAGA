import { handleCors, corsHeaders } from "../_shared/cors.ts"
import { createSupabaseClient } from "../_shared/supabase.ts"
import { ok, badRequest, serverError } from "../_shared/response.ts"

/*
 * Webhook handler for external integrations:
 * - Payment gateway confirmations
 * - Shipping/tracking updates
 * - Document validation services
 */

interface WebhookPayload {
  event: string
  provider: string
  data: Record<string, unknown>
}

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET")
    const signature = req.headers.get("x-webhook-signature")

    if (webhookSecret && signature !== webhookSecret) {
      return new Response(JSON.stringify({ error: true, message: "Firma inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabase = createSupabaseClient(req)
    const body: WebhookPayload = await req.json()

    if (!body.event || !body.provider) {
      return badRequest("event y provider son requeridos")
    }

    switch (body.event) {
      case "payment.confirmed": {
        // Actualizar estado de factura a pagada
        const facturaId = body.data.factura_id as string
        const monto = body.data.monto as number
        const referencia = body.data.referencia as string

        if (facturaId && monto) {
          await supabase.from("cobros").insert({
            factura_id: facturaId,
            monto,
            moneda: (body.data.moneda as string) ?? "USD",
            fecha_cobro: new Date().toISOString().split("T")[0],
            metodo_pago: "transferencia",
            referencia,
          })

          // Actualizar estado de factura
          const { data: factura } = await supabase
            .from("facturas")
            .select("total, estado")
            .eq("id", facturaId)
            .single()

          if (factura) {
            const { data: cobrosData } = await supabase
              .from("cobros")
              .select("monto")
              .eq("factura_id", facturaId)
              .is("deleted_at", null)

            const totalCobrado = cobrosData?.reduce((sum, c) => sum + Number(c.monto), 0) ?? 0
            const nuevoEstado = totalCobrado >= Number(factura.total)
              ? "pagada"
              : "parcial"

            await supabase
              .from("facturas")
              .update({ estado: nuevoEstado })
              .eq("id", facturaId)
          }
        }
        break
      }

      case "tracking.updated": {
        // Actualizar estado de embarque
        const contenedorId = body.data.contenedor_id as string
        const estado = body.data.estado as string
        const ubicacion = body.data.ubicacion as string
        const descripcion = body.data.descripcion as string

        if (contenedorId && estado) {
          const { data: embarque } = await supabase
            .from("embarques")
            .insert({
              contenedor_id: contenedorId,
              estado,
              ubicacion_actual: ubicacion,
              descripcion,
              fecha_evento: new Date().toISOString(),
            })
            .select()
            .single()

          if (embarque) {
            await supabase
              .from("contenedores")
              .update({ estado: estado as never })
              .eq("id", contenedorId)
          }
        }
        break
      }

      case "document.signed": {
        const documentoId = body.data.documento_id as string
        if (documentoId) {
          await supabase
            .from("documentos")
            .update({ firmado: true })
            .eq("id", documentoId)

          await supabase
            .from("historial_documento")
            .insert({
              documento_id: documentoId,
              accion: "firmado",
              metadata: body.data,
            })
        }
        break
      }

      default:
        return badRequest(`Evento no soportado: ${body.event}`)
    }

    return ok({ message: "Webhook procesado correctamente", event: body.event })
  } catch (error) {
    return serverError(error)
  }
})
