import { getPagos } from "@/lib/actions/pagos"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await getPagos()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
