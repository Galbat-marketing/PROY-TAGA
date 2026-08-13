import { createServerSupabase } from "@/lib/supabase-server"
import LandingClient from "./landing-client"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

function transformarImagenUrl(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith(supabaseUrl!)) {
    const base = url.includes("?") ? url : `${url}?download=`
    return base
  }
  return url
}

interface ProductoRaw {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
  unidad_medida: string | null
  precio_base: number
  moneda: string
  pais_origen: string | null
  peso_kg: number | null
  volumen_m3: number | null
  imagen_url: string | null
  created_at: string
  categorias_productos: { nombre?: string } | null
}

interface CategoriaRaw {
  id: string
  nombre: string
  descripcion: string | null
}

interface LandingMetrics {
  productosActivos: number
  categoriasActivas: number
  paisesOrigen: number
  clientesActivos: number
  totalProductos: number
}

export default async function Page() {
  const supabase = await createServerSupabase()

  const [
    { data: productos, error: errProd },
    { data: categorias, error: errCat },
    { data: paisesData, error: errPaises },
    { data: rawCountries, error: errCountries },
    { data: rawClientes, error: errClientes },
    { data: rawAllProductos, error: errAll },
  ] = await Promise.all([
    // 1. Productos activos (completos para el grid)
    supabase
      .from("productos")
      .select("*, categorias_productos!left(nombre)")
      .is("deleted_at", null)
      .eq("activo", true)
      .order("created_at", { ascending: false }),
    // 2. Categorías activas (para el grid)
    supabase
      .from("categorias_productos")
      .select("id, nombre, descripcion")
      .is("deleted_at", null)
      .eq("activo", true)
      .order("nombre"),
    // 3. Países (mapeo código → nombre)
    supabase
      .from("paises")
      .select("codigo, nombre")
      .is("deleted_at", null),
    // 4. Países de origen (activos, para distinct count)
    supabase
      .from("productos")
      .select("pais_origen")
      .is("deleted_at", null)
      .eq("activo", true)
      .not("pais_origen", "is", null),
    // 5. Clientes activos
    supabase
      .from("clientes")
      .select("id")
      .is("deleted_at", null)
      .eq("activo", true),
    // 6. Todos los productos gestionados (sin filtro activo)
    supabase
      .from("productos")
      .select("id")
      .is("deleted_at", null),
  ])

  // Debug: mostrar errores de conexión
  // console.debug("[Landing Page] Errores:", {
  //   errProd: errProd?.message,
  //   errCat: errCat?.message,
  //   errPaises: errPaises?.message,
  //   errCountries: errCountries?.message,
  //   errClientes: errClientes?.message,
  //   errAll: errAll?.message,
  // })

  const productosList = (productos as ProductoRaw[] | null) || []
  const categoriasList = (categorias as CategoriaRaw[] | null) || []
  const clientesList = (rawClientes as { id: string }[] | null) || []
  const allProductosList = (rawAllProductos as { id: string }[] | null) || []
  const paisesOrigenRaw = (rawCountries as { pais_origen: string | null }[] | null) || []

  // console.debug("[Landing Page] Counts:", {
  //   productos: productosList.length,
  //   categorias: categoriasList.length,
  //   clientes: clientesList.length,
  //   allProductos: allProductosList.length,
  //   paisesOrigen: paisesOrigenRaw.length,
  // })

  // Mapa código de país → nombre completo (ej. "CN" → "China")
  const paisMap = new Map<string, string>()
  ;(paisesData as { codigo: string; nombre: string }[] | null)?.forEach((p) => {
    if (p.codigo) paisMap.set(p.codigo.toLowerCase(), p.nombre)
  })

  const transformed = productosList.map((p) => ({
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    descripcion: p.descripcion,
    categoria: p.categorias_productos?.nombre ?? "Sin categoría",
    unidad_medida: p.unidad_medida,
    precio_base: p.precio_base,
    moneda: p.moneda,
    pais_origen: paisMap.get(p.pais_origen?.toLowerCase() ?? "") ?? p.pais_origen ?? null,
    peso_kg: p.peso_kg,
    volumen_m3: p.volumen_m3,
    imagen_url: transformarImagenUrl(p.imagen_url),
    created_at: p.created_at,
  }))

  const paisesNombres = paisesOrigenRaw.map((p) => ({
    pais_origen: paisMap.get(p.pais_origen?.toLowerCase() ?? "") ?? p.pais_origen,
  }))
  const paisesSet = new Set(paisesNombres.map((p) => p.pais_origen!).filter(Boolean))

  const metrics: LandingMetrics = {
    productosActivos: productosList.length,
    categoriasActivas: categoriasList.length,
    paisesOrigen: paisesSet.size,
    clientesActivos: clientesList.length,
    totalProductos: allProductosList.length,
  }

  return (
    <LandingClient
      productos={transformed}
      categorias={categoriasList}
      metrics={metrics}
      debug={{
        errors: {
          productos: errProd?.message ?? null,
          categorias: errCat?.message ?? null,
          paises: errPaises?.message ?? null,
          clientes: errClientes?.message ?? null,
        },
        counts: {
          productos: productosList.length,
          categorias: categoriasList.length,
          clientes: clientesList.length,
        },
      }}
    />
  )
}
