import { getOfertas } from "@/lib/actions/ofertas"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await getOfertas()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
