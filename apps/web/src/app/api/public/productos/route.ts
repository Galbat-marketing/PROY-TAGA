import { NextResponse } from "next/server"
import { supabaseService } from "@/lib/supabase-service"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

function transformarImagenUrl(url: string | null): string | null {
  if (!url) return null

  // Si ya es una URL completa de Supabase, asegurar que tenga los parámetros correctos
  if (url.startsWith(supabaseUrl)) {
    // Si es una URL de storage, asegurar que tenga ?download= para evitar CORS
    const base = url.includes("?") ? url : `${url}?download=`
    return base
  }

  // Si la URL no es de Supabase, devolverla tal cual
  return url
}

export async function GET() {
  const { data: productos, error } = await supabaseService
    .from("productos")
    .select("*, categorias_productos!left(nombre)")
    .is("deleted_at", null)
    .eq("activo", true)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const data = productos.map((p) => ({
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    descripcion: p.descripcion,
    categoria: (p.categorias_productos as { nombre?: string } | null)?.nombre ?? "Sin categoría",
    unidad_medida: p.unidad_medida,
    precio_base: p.precio_base,
    moneda: p.moneda,
    pais_origen: p.pais_origen,
    peso_kg: p.peso_kg,
    volumen_m3: p.volumen_m3,
    imagen_url: transformarImagenUrl(p.imagen_url),
    created_at: p.created_at,
  }))

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=600" },
  })
}
