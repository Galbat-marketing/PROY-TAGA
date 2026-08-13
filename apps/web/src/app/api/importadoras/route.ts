import { getImportadoras } from "@/lib/actions/importadoras"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await getImportadoras()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
