import { handleCors } from "../_shared/cors.ts"
import { createSupabaseClient } from "../_shared/supabase.ts"
import { ok, badRequest, unauthorized, serverError } from "../_shared/response.ts"

interface EmailRequest {
  to: string[]
  subject: string
  html: string
  tipo: "notificacion" | "documento" | "alerta"
  referencia_modulo?: string
  referencia_id?: string
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

    const body: EmailRequest = await req.json()

    if (!body.to?.length || !body.subject || !body.html) {
      return badRequest("Faltan campos requeridos: to, subject, html")
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY")
    if (!resendApiKey) {
      return serverError("RESEND_API_KEY no configurada")
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TAGA ERP <notificaciones@taga.app>",
        to: body.to,
        subject: body.subject,
        html: body.html,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error("Resend error:", errorText)
      return serverError("Error al enviar el email")
    }

    const result = await res.json()

    // Registrar notificación en la base de datos
    for (const recipient of body.to) {
      const { data: usuarios } = await supabase
        .from("usuarios")
        .select("id")
        .eq("email", recipient)
        .single()

      if (usuarios) {
        await supabase.from("notificaciones").insert({
          usuario_id: usuarios.id,
          tipo: body.tipo === "alerta" ? "alerta" : body.tipo === "documento" ? "informacion" : "informacion",
          titulo: body.subject,
          mensaje: body.html.replace(/<[^>]*>/g, "").substring(0, 255),
          referencia_modulo: body.referencia_modulo,
          referencia_id: body.referencia_id,
        })
      }
    }

    return ok({
      message: "Email enviado correctamente",
      id: result.id,
    })
  } catch (error) {
    return serverError(error)
  }
})
