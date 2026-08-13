import { getAuditoriaLog, getActividadUsuarios } from "@/lib/actions/auditoria"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [auditoria, actividad] = await Promise.all([
      getAuditoriaLog(),
      getActividadUsuarios(),
    ])
    return NextResponse.json({ auditoria, actividad })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
