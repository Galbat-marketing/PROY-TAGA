import { z } from 'zod';

export const clienteSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  tipo_persona: z.enum(['moral', 'fisica']),
  nombre: z.string().min(1, 'El nombre es requerido'),
  rfc: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  telefono: z.string().nullable().optional(),
  pais: z.string().min(1, 'El país es requerido'),
  moneda_default: z.string(),
  limite_credito: z.coerce.number().nonnegative().optional(),
  condiciones_pago: z.string().nullable().optional(),
  industria: z.string().nullable().optional(),
  rating: z.number().optional(),
  notas: z.string().nullable().optional(),
  activo: z.boolean().optional(),
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;