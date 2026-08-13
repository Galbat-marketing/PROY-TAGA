import { handleCors, corsHeaders } from "../_shared/cors.ts"
import { createSupabaseClient } from "../_shared/supabase.ts"
import { ok, badRequest, unauthorized, serverError } from "../_shared/response.ts"

interface GeneratePdfRequest {
  tipo: "oferta" | "factura" | "expediente"
  referencia_id: string
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

    const { tipo, referencia_id }: GeneratePdfRequest = await req.json()

    if (!tipo || !referencia_id) {
      return badRequest("Faltan campos requeridos: tipo, referencia_id")
    }

    let data: Record<string, unknown> | null = null
    let fileName = ""

    if (tipo === "oferta") {
      const { data: oferta, error } = await supabase
        .from("ofertas")
        .select("*, clientes(*), fichas_oferta(*, productos(*))")
        .eq("id", referencia_id)
        .single()

      if (error || !oferta) {
        return notFound("Oferta no encontrada")
      }
      data = oferta
      fileName = `oferta-${oferta.folio}.pdf`
    }

    if (tipo === "factura") {
      const { data: factura, error } = await supabase
        .from("facturas")
        .select("*, clientes(*)")
        .eq("id", referencia_id)
        .single()

      if (error || !factura) {
        return notFound("Factura no encontrada")
      }
      data = factura
      fileName = `factura-${factura.folio}.pdf`
    }

    if (!data) {
      return badRequest("Tipo de documento no soportado")
    }

    const { data: storageData, error: storageError } = await supabase.storage
      .from("documentos")
      .upload(`${user.id}/${fileName}`, new Blob([JSON.stringify(data, null, 2)]), {
        contentType: "application/pdf",
        upsert: true,
      })

    if (storageError) {
      return serverError(storageError)
    }

    const { data: { publicUrl } } = supabase.storage
      .from("documentos")
      .getPublicUrl(storageData?.path ?? "")

    return ok({
      message: "Documento generado correctamente",
      url: publicUrl,
      path: storageData?.path,
    })
  } catch (error) {
    return serverError(error)
  }
})

function notFound(message: string): Response {
  return new Response(JSON.stringify({ error: true, message }), {
    status: 404,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}
