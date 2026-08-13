import { getRoles } from "@/lib/actions/usuarios"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await getRoles()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
