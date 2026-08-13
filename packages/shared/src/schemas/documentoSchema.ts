import { z } from 'zod';

export const documentoSchema = z.object({
  tipo_documento: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable().optional(),
  oferta_id: z.string().nullable().optional(),
  cliente_id: z.string().nullable().optional(),
  proveedor_id: z.string().nullable().optional(),
  producto_id: z.string().nullable().optional(),
  contenedor_id: z.string().nullable().optional(),
  expediente_id: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export type DocumentoFormValues = z.infer<typeof documentoSchema>;
