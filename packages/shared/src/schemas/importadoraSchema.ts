import { z } from 'zod';

export const importadoraSchema = z.object({
  codigo: z.string().min(1, "El código es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  rfc: z.string().optional().or(z.literal("")),
  direccion: z.string().optional().or(z.literal("")),
  aduana_asignada: z.string().optional().or(z.literal("")),
  agente_aduanal: z.string().optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z.string().optional().or(z.literal("")),
  activo: z.boolean().default(true),
})

export type ImportadoraFormValues = z.infer<typeof importadoraSchema>
