import { getCategorias } from "@/lib/actions/productos"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await getCategorias()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
