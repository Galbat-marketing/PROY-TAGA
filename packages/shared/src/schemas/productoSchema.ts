import { z } from 'zod';

export const productoSchema = z.object({
  codigo: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable().optional(),
  categoria_id: z.string().nullable().optional().transform(v => v === "" ? null : v),
  unidad_medida: z.string(),
  precio_base: z.number(),
  moneda: z.string(),
  fraccion_arancelaria: z.string().nullable().optional(),
  pais_origen: z.string().nullable().optional(),
  peso_kg: z.number().nullable().optional(),
  volumen_m3: z.number().nullable().optional(),
  activo: z.boolean().optional(),
  imagen_url: z.string().nullable().optional(),
  notas: z.string().nullable().optional(),
});

export type ProductoFormValues = z.infer<typeof productoSchema>;