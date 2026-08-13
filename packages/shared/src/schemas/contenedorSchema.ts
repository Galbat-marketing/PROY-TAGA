import { z } from 'zod';

export const contenedorSchema = z.object({
  numero_contenedor: z.string(),
  tipo: z.string(),
  tamano: z.string().nullable().optional(),
  booking: z.string().nullable().optional(),
  naviera: z.string().nullable().optional(),
  importadora_id: z.string().nullable().optional().transform(v => v === "" ? null : v),
  eta: z.string().nullable().optional(),
  etd: z.string().nullable().optional(),
  puerto_origen: z.string().nullable().optional(),
  puerto_destino: z.string().nullable().optional(),
  sello: z.string().nullable().optional(),
  peso_kg: z.number().nullable().optional(),
  volumen_m3: z.number().nullable().optional(),
  estado: z.string(),
  notas: z.string().nullable().optional(),
});

export type ContenedorFormValues = z.infer<typeof contenedorSchema>;