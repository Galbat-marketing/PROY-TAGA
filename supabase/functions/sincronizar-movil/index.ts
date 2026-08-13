import { handleCors } from "../_shared/cors.ts"
import { createSupabaseClient } from "../_shared/supabase.ts"
import { ok, badRequest, unauthorized, serverError } from "../_shared/response.ts"

interface SyncRequest {
  ultima_sincronizacion: string
  datos?: {
    ofertas?: unknown[]
    clientes?: unknown[]
    productos?: unknown[]
  }
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

    const body: SyncRequest = await req.json()

    if (!body.ultima_sincronizacion) {
      return badRequest("ultima_sincronizacion es requerido")
    }

    const lastSync = body.ultima_sincronizacion

    // Process incoming data (upsert from mobile)
    if (body.datos?.ofertas?.length) {
      for (const oferta of body.datos.ofertas) {
        const { error } = await supabase
          .from("ofertas")
          .upsert(oferta, { onConflict: "id" })

        if (error) {
          console.error("Error upserting offerta from mobile:", error)
        }
      }
    }

    if (body.datos?.clientes?.length) {
      for (const cliente of body.datos.clientes) {
        const { error } = await supabase
          .from("clientes")
          .upsert(cliente, { onConflict: "id" })

        if (error) {
          console.error("Error upserting cliente from mobile:", error)
        }
      }
    }

    // Get updated data since last sync
    const [ofertas, clientes, productos, contenedores, embarques, notificaciones] =
      await Promise.all([
        supabase
          .from("ofertas")
          .select("*, clientes(nombre), fichas_oferta(*, productos(*))")
          .gte("updated_at", lastSync)
          .is("deleted_at", null)
          .order("updated_at", { ascending: false }),

        supabase
          .from("clientes")
          .select("*")
          .gte("updated_at", lastSync)
          .is("deleted_at", null),

        supabase
          .from("productos")
          .select("*, categorias_productos(nombre)")
          .gte("updated_at", lastSync)
          .is("deleted_at", null)
          .eq("activo", true),

        supabase
          .from("contenedores")
          .select("*, embarques(*), importadoras(nombre)")
          .gte("updated_at", lastSync)
          .is("deleted_at", null),

        supabase
          .from("embarques")
          .select("*, contenedores!inner(numero_contenedor)")
          .gte("updated_at", lastSync)
          .is("deleted_at", null),

        supabase
          .from("notificaciones")
          .select("*")
          .eq("usuario_id", user.id)
          .gte("created_at", lastSync)
          .eq("leida", false),
      ])

    return ok({
      sincronizacion: new Date().toISOString(),
      datos: {
        ofertas: ofertas.data ?? [],
        clientes: clientes.data ?? [],
        productos: productos.data ?? [],
        contenedores: contenedores.data ?? [],
        embarques: embarques.data ?? [],
        notificaciones: notificaciones.data ?? [],
      },
      metadatos: {
        total_registros:
          (ofertas.data?.length ?? 0) +
          (clientes.data?.length ?? 0) +
          (productos.data?.length ?? 0) +
          (contenedores.data?.length ?? 0),
        ultima_sincronizacion: lastSync,
      },
    })
  } catch (error) {
    return serverError(error)
  }
})
