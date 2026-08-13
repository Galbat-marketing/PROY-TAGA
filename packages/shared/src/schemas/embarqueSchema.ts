import { z } from 'zod';

export const embarqueSchema = z.object({
  contenedor_id: z.string({ required_error: "El contenedor es requerido" }),
  estado: z.string({ required_error: "El estado es requerido" }),
  ubicacion_actual: z.string().nullable().optional(),
  fecha_evento: z.string({ required_error: "La fecha es requerida" }),
  descripcion: z.string().nullable().optional(),
  usuario_registra: z.string().nullable().optional(),
});

export type EmbarqueFormValues = z.infer<typeof embarqueSchema>;
