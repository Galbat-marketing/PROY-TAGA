"use server"

import { createServerSupabase } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export interface SemanaComision {
  semana_inicio: string
  ventas: number
  total_ventas: number
  comision: number
  pago_id: string | null
  estado: "pendiente" | "realizado"
  fecha_pago: string | null
}

export async function getComisionesSemanales(comercialId: string): Promise<SemanaComision[]> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from("ofertas")
    .select(`
      id,
      total,
      moneda,
      facturas!inner(
        id,
        cobros!inner(
          fecha_cobro
        )
      )
    `)
    .eq("comercial_id", comercialId)
    .in("estado", ["aceptada", "convertida"])
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  if (error) throw new Error("Error al cargar comisiones: " + error.message)

  const { data: pagos } = await supabase
    .from("pago_comisiones")
    .select("*")
    .eq("comercial_id", comercialId)
    .is("deleted_at", null)

  const pagosMap = new Map<string, { id: string; monto: number; estado: string; fecha_pago: string | null }>()
  if (pagos) {
    for (const p of pagos) {
      pagosMap.set(p.semana_inicio, { id: p.id, monto: p.monto, estado: p.estado, fecha_pago: p.fecha_pago })
    }
  }

  const semanas = new Map<string, { ventas: number; total_ventas: number }>()

  for (const o of (data ?? [])) {
    const facturas = (o as { facturas: Array<{ cobros: Array<{ fecha_cobro: string }> }> } | null)?.facturas
    const cobros = facturas?.[0]?.cobros
    if (!cobros || cobros.length === 0) continue
    const fechaCobro = cobros[0].fecha_cobro
    if (!fechaCobro) continue

    const semana = getMonday(new Date(fechaCobro))
    const key = semana.toISOString().split("T")[0]

    if (!semanas.has(key)) {
      semanas.set(key, { ventas: 0, total_ventas: 0 })
    }
    const s = semanas.get(key)!
    s.ventas += 1
    s.total_ventas += Number(o.total)
  }

  const result: SemanaComision[] = []
  for (const [key, value] of semanas) {
    const pago = pagosMap.get(key)
    result.push({
      semana_inicio: key,
      ventas: value.ventas,
      total_ventas: value.total_ventas,
      comision: Math.round(value.total_ventas * 0.01 * 100) / 100,
      pago_id: pago?.id ?? null,
      estado: pago?.estado === "realizado" ? "realizado" : "pendiente",
      fecha_pago: pago?.fecha_pago ?? null,
    })
  }

  result.sort((a, b) => b.semana_inicio.localeCompare(a.semana_inicio))

  return result
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function marcarComisionPagada(pagoId: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("pago_comisiones")
    .update({
      estado: "realizado",
      fecha_pago: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", pagoId)
  if (error) throw new Error("Error al marcar comisión como pagada: " + error.message)
  revalidatePath("/comerciales/[id]")
}

export async function crearPagoComision(comercialId: string, semanaInicio: string, monto: number) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from("pago_comisiones")
    .insert({
      comercial_id: comercialId,
      semana_inicio: semanaInicio,
      monto,
      estado: "realizado",
      fecha_pago: new Date().toISOString(),
    })
  if (error) throw new Error("Error al registrar pago de comisión: " + error.message)
  revalidatePath("/comerciales/[id]")
}

