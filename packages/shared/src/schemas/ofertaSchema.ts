import { z } from 'zod';

const fichaSchema = z.object({
  producto_id: z.string().min(1, "Selecciona un producto"),
  proveedor_id: z.string().optional(),
  cantidad: z.coerce.number().positive(),
  unidad_medida: z.string().default("pieza"),
  precio_unitario: z.coerce.number().nonnegative(),
  descuento: z.coerce.number().nonnegative().default(0),
  notas: z.string().nullable().optional(),
});

export const ofertaSchema = z.object({
  folio: z.string().optional(),
  cliente_id: z.string().min(1, "Selecciona un cliente"),
  comercial_id: z.string().min(1, "Selecciona un comercial"),
  moneda: z.string().default("USD"),
  fecha_emision: z.string(),
  fecha_vigencia: z.string().optional(),
  incoterm: z.string().optional(),
  tipo_operacion: z.string().optional(),
  condiciones_pago: z.string().optional(),
  porcentaje_ganancia: z.coerce.number().nonnegative().optional(),
  estado: z.enum(['borrador', 'enviada', 'aceptada', 'rechazada', 'convertida']).default('borrador'),
  fichas: z.array(fichaSchema).optional(),
});

export const aprobarOfertaSchema = z.object({
  condiciones_pago: z.string().min(1, "Las condiciones de pago son requeridas"),
  incoterm: z.string().min(1, "El incoterm es requerido"),
  tipo_cambio: z.coerce.number().positive("El tipo de cambio debe ser mayor a 0"),
  descuento_global: z.coerce.number().nonnegative().default(0),
  fecha_vigencia: z.string().min(1, "La fecha de vigencia es requerida"),
  notas_internas: z.string().nullable().optional(),
  porcentaje_ganancia: z.coerce.number().nonnegative().optional(),
  metodo_pago: z.string().min(1, "El método de pago es requerido"),
  referencia: z.string().min(1, "La referencia es requerida"),
});

export type OfertaFormValues = z.infer<typeof ofertaSchema>;
export type FichaFormValues = z.infer<typeof fichaSchema>;
export type AprobarOfertaFormValues = z.infer<typeof aprobarOfertaSchema>;