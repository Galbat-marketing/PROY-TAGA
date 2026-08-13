export const TIPOS_DOCUMENTO = [
  { value: "contrato", label: "Contrato" },
  { value: "certificado", label: "Certificado" },
  { value: "proforma", label: "Proforma" },
  { value: "factura", label: "Factura" },
  { value: "bl", label: "Bill of Lading" },
  { value: "booking", label: "Booking" },
  { value: "expediente", label: "Expediente" },
  { value: "inspeccion", label: "Inspección" },
  { value: "adjunto", label: "Adjunto" },
]

export const TIPO_COLOR: Record<string, "info" | "success" | "warning" | "neutral"> = {
  contrato: "info",
  certificado: "success",
  proforma: "warning",
  factura: "info",
  bl: "warning",
  booking: "neutral",
  expediente: "success",
  inspeccion: "warning",
  adjunto: "neutral",
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "—"
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
