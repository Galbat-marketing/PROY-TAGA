import { handleCors } from "../_shared/cors.ts"
import { createSupabaseClient } from "../_shared/supabase.ts"
import { ok, badRequest, unauthorized, serverError } from "../_shared/response.ts"

interface SearchRequest {
  q: string
  limites?: {
    productos?: number
    clientes?: number
    ofertas?: number
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

    const body: SearchRequest = await req.json()

    if (!body.q || body.q.length < 2) {
      return badRequest("La búsqueda debe tener al menos 2 caracteres")
    }

    const query = body.q
    const limite_productos = body.limites?.productos ?? 5
    const limite_clientes = body.limites?.clientes ?? 5
    const limite_ofertas = body.limites?.ofertas ?? 5

    const searchPattern = `%${query}%`

    const [productos, clientes, proveedores, ofertas] = await Promise.all([
      supabase
        .from("productos")
        .select("id, codigo, nombre, categoria_id, categorias_productos!inner(nombre)")
        .or(`nombre.ilike.${searchPattern},codigo.ilike.${searchPattern},descripcion.ilike.${searchPattern}`)
        .is("deleted_at", null)
        .eq("activo", true)
        .limit(limite_productos),

      supabase
        .from("clientes")
        .select("id, codigo, nombre, rfc, pais")
        .or(`nombre.ilike.${searchPattern},codigo.ilike.${searchPattern},rfc.ilike.${searchPattern}`)
        .is("deleted_at", null)
        .eq("activo", true)
        .limit(limite_clientes),

      supabase
        .from("proveedores")
        .select("id, codigo, nombre, pais")
        .or(`nombre.ilike.${searchPattern},codigo.ilike.${searchPattern}`)
        .is("deleted_at", null)
        .eq("activo", true)
        .limit(5),

      supabase
        .from("ofertas")
        .select("id, folio, total, estado, fecha_emision, clientes!inner(nombre)")
        .or(`folio.ilike.${searchPattern},clientes.nombre.ilike.${searchPattern}`)
        .is("deleted_at", null)
        .limit(limite_ofertas),
    ])

    return ok({
      query,
      resultados: {
        productos: productos.data?.map((p) => ({
          id: p.id,
          codigo: p.codigo,
          nombre: p.nombre,
          categoria: (p.categorias_productos as { nombre?: string } | null)?.nombre ?? null,
          url: `/productos/${p.id}`,
        })) ?? [],

        clientes: clientes.data?.map((c) => ({
          id: c.id,
          codigo: c.codigo,
          nombre: c.nombre,
          rfc: c.rfc,
          pais: c.pais,
          url: `/clientes/${c.id}`,
        })) ?? [],

        proveedores: proveedores.data?.map((p) => ({
          id: p.id,
          codigo: p.codigo,
          nombre: p.nombre,
          pais: p.pais,
          url: `/proveedores/${p.id}`,
        })) ?? [],

        ofertas: ofertas.data?.map((o) => ({
          id: o.id,
          folio: o.folio,
          total: Number(o.total),
          estado: o.estado,
          cliente: (o.clientes as { nombre?: string } | null)?.nombre ?? "—",
          fecha: o.fecha_emision,
          url: `/ofertas/${o.id}`,
        })) ?? [],
      },
      total: (productos.data?.length ?? 0) +
             (clientes.data?.length ?? 0) +
             (proveedores.data?.length ?? 0) +
             (ofertas.data?.length ?? 0),
    })
  } catch (error) {
    return serverError(error)
  }
})
