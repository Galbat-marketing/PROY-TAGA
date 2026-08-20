import { handleCors, corsHeaders } from "../_shared/cors.ts"
import { createSupabaseClient } from "../_shared/supabase.ts"
import { badRequest, unauthorized } from "../_shared/response.ts"

interface ReporteRequest {
  tipo: "documentos" | "ofertas" | "clientes" | "productos" | "facturas" | "cobros" | "pagos" | "gastos"
  formato: "excel" | "csv" | "pdf"
  filtro?: Record<string, unknown>
  limit?: number
}

interface Reporte {
  id: string
  nombre: string
  tipo_documento?: string
  folio?: string
  cliente_nombre?: string | null
  total?: number
  estado?: string
  fecha?: string
  file_size?: number | null
  file_type?: string | null
  created_at?: string
}

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const supabase = createSupabaseClient(req)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorized()
    }

    const { tipo, formato, filtro, limit }: ReporteRequest = await req.json()

    if (!tipo || !formato) {
      return badRequest("Faltan campos requeridos: tipo, formato")
    }

    const results = await generarReporte(supabase, tipo, filtro, limit || 5000)

    let blob: Blob
    let extension: string

    if (formato === "csv") {
      const csv = generarCSV(results, tipo)
      blob = new Blob([csv], { type: "text/csv" })
      extension = "csv"
    } else if (formato === "excel") {
      blob = await generarExcel(results, tipo)
      extension = "xlsx"
    } else if (formato === "pdf") {
      blob = await generarPDF(results, tipo)
      extension = "pdf"
    } else {
      return badRequest("Formato no soportado")
    }

    const fileName = `${tipo}-${Date.now()}.${extension}`
    return new Response(blob, {
      headers: {
        ...corsHeaders,
        "Content-Type": blob.type,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("Error generando reporte:", error)
    return new Response(
      JSON.stringify({ error: true, message: "Error interno del servidor" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

async function generarReporte(
  supabase: any,
  tipo: string,
  filtro?: Record<string, unknown>,
  limit: number = 5000
): Promise<Reporte[]> {
  let query = supabase.from(tipo).select("*").limit(limit)

  if (filtro) {
    for (const [key, value] of Object.entries(filtro)) {
      if (typeof value === "string") {
        query = query.eq(key, value)
      } else if (typeof value === "object" && value !== null) {
        query = query.eq(key, value)
      }
    }
  }

  const { data, error } = await query

  if (error) throw error

  return data.map((item: any) => ({
    id: item.id,
    nombre: item.nombre || item.folio || "",
    tipo_documento: item.tipo_documento,
    folio: item.folio,
    cliente_nombre: item.cliente?.nombre || item.cliente_nombre,
    total: item.total,
    estado: item.estado,
    fecha: item.fecha_emision || item.fecha || item.created_at,
    file_size: item.file_size,
    file_type: item.file_type,
    created_at: item.created_at,
  }))
}

function generarCSV(data: Reporte[], tipo: string): string {
  const headers = ["ID", "Nombre", "Tipo", "Folio", "Cliente", "Total", "Estado", "Fecha", "Tamaño"]
  const rows = data.map(item => [
    item.id,
    item.nombre,
    item.tipo_documento || "",
    item.folio || "",
    item.cliente_nombre || "",
    item.total?.toString() || "",
    item.estado || "",
    item.fecha || "",
    (item.file_size || 0).toString(),
  ])

  return [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n")
}

async function generarExcel(data: Reporte[], tipo: string): Promise<Blob> {
  const { ExcelJS } = await import("npm:exceljs")
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(tipo)

  worksheet.columns = [
    { header: "ID", key: "id", width: 25 },
    { header: "Nombre", key: "nombre", width: 40 },
    { header: "Tipo", key: "tipo_documento", width: 20 },
    { header: "Folio", key: "folio", width: 20 },
    { header: "Cliente", key: "cliente_nombre", width: 30 },
    { header: "Total", key: "total", width: 15 },
    { header: "Estado", key: "estado", width: 15 },
    { header: "Fecha", key: "fecha", width: 20 },
    { header: "Tamaño (KB)", key: "file_size", width: 15 },
  ]

  data.forEach(item => worksheet.addRow(item))
  worksheet.columns.forEach(col => col.width = Math.max(col.width!, 15))

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
}

async function generarPDF(data: Reporte[], tipo: string): Promise<Blob> {
  const { PDFDocument, StandardFonts } = await import("npm:pdf-lib")
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89])
  const font = await pdfDoc.embedStandardFont(StandardFonts.Helvetica)

  const fontSize = 10
  const lineHeight = fontSize * 1.5
  let y = 800

  page.drawText(`Reporte: ${tipo}`, { x: 50, y, size: 18, font })
  y -= 30

  const headers = ["ID", "Nombre", "Tipo", "Folio", "Cliente", "Total", "Estado", "Fecha"]
  const colWidths = [80, 150, 80, 80, 120, 60, 60, 80]
  let x = 50

  headers.forEach((header, i) => {
    page.drawText(header, { x, y, size: fontSize, font })
    x += colWidths[i] || 80
  })
  y -= lineHeight * 1.5

  data.forEach(item => {
    x = 50
    const values = [
      item.id.substring(0, 8),
      item.nombre.substring(0, 20),
      item.tipo_documento || "-",
      item.folio || "-",
      item.cliente_nombre?.substring(0, 15) || "-",
      item.total?.toString() || "0",
      item.estado || "-",
      item.fecha ? new Date(item.fecha).toLocaleDateString() : "-",
    ]

    values.forEach((value, i) => {
      page.drawText(value.toString().substring(0, colWidths[i] || 80 - 5), { x, y, size: fontSize, font })
      x += colWidths[i] || 80
    })
    y -= lineHeight
  })

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: "application/pdf" })
}