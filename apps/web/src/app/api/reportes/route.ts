import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"

const EDGE_FUNCTIONS_URL =
  process.env.EDGE_FUNCTIONS_URL || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${EDGE_FUNCTIONS_URL}/generar-reporte`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      return NextResponse.json(
        { error: data?.message || data?.error || "Error generando reporte" },
        { status: response.status }
      )
    }

    const blob = await response.arrayBuffer()
    const disposition = response.headers.get("Content-Disposition") ?? `attachment; filename="reporte"`

    return new NextResponse(blob, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/octet-stream",
        "Content-Disposition": disposition,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}