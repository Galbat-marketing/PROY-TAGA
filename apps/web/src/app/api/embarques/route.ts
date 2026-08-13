import { getEmbarques } from "@/lib/actions/embarques"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await getEmbarques()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
