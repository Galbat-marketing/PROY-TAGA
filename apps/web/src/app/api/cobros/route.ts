import { getCobros } from "@/lib/actions/cobros"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await getCobros()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
