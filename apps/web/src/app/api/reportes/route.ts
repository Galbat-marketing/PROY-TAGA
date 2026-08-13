import { NextResponse } from "next/server"

const EDGE_FUNCTIONS_URL = process.env.EDGE_FUNCTIONS_URL || "https://<your-project>.supabase.co/functions/v1"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/generar-reporte`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Error generando reporte" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}