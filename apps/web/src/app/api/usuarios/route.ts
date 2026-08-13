import { getUsuarios, crearUsuario } from "@/lib/actions/usuarios"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await getUsuarios()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await crearUsuario(body)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
