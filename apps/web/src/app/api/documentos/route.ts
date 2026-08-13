import { getDocumentos, crearDocumento } from "@/lib/actions/documentos"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await getDocumentos()
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
    const data = await crearDocumento(body)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
