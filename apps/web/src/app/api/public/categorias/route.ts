import { NextResponse } from "next/server"
import { supabaseService } from "@/lib/supabase-service"

export async function GET() {
  const { data, error } = await supabaseService
    .from("categorias_productos")
    .select("*")
    .is("deleted_at", null)
    .eq("activo", true)
    .order("orden", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=600" },
  })
}
