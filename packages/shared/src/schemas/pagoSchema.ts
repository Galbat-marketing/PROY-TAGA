import { z } from "zod"

export const pagoSchema = z.object({
  proveedor_id: z.string().nullable().optional(),
  beneficiario: z.string().nullable().optional(),
  monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
  moneda: z.string().min(1, "La moneda es requerida"),
  tipo_cambio: z.coerce.number().positive("El tipo de cambio debe ser mayor a 0").optional(),
  fecha_pago: z.string().min(1, "La fecha es requerida"),
  metodo_pago: z.string().min(1, "El método de pago es requerido"),
  referencia: z.string().min(1, "La referencia es requerida"),
  notas: z.string().nullable().optional(),
})

export type PagoFormValues = z.infer<typeof pagoSchema>
