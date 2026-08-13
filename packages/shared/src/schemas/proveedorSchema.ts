import { z } from 'zod';

export const proveedorSchema = z.object({
  codigo: z.string(),
  nombre: z.string(),
  rfc: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  telefono: z.string().nullable().optional(),
  pais: z.string(),
  moneda_default: z.string(),
  condiciones_pago: z.string().nullable().optional(),
  tipo_proveedor: z.string().nullable().optional(),
  rating: z.number().optional(),
  activo: z.boolean().optional(),
});

export type ProveedorFormValues = z.infer<typeof proveedorSchema>;