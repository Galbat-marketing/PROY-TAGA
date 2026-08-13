import { getClientes } from "@/lib/actions/clientes"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await getClientes()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
