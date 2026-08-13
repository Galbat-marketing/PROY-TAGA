import { getMonedas, getUnidadesMedida, getPaises, getCategoriasProducto, getComerciales } from "@/lib/actions/codificadores"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [monedas, unidadesMedida, paises, categorias, comerciales] = await Promise.all([
      getMonedas(),
      getUnidadesMedida(),
      getPaises(),
      getCategoriasProducto(),
      getComerciales(),
    ])
    return NextResponse.json({ monedas, unidadesMedida, paises, categorias, comerciales })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
