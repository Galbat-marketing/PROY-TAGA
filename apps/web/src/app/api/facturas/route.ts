import { getFacturas } from "@/lib/actions/facturas"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await getFacturas()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
