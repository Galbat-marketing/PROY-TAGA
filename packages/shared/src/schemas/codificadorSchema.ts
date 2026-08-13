import { z } from 'zod';

export const monedaSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido').max(3, 'Máximo 3 caracteres'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  simbolo: z.string().nullable().optional(),
  activo: z.boolean().optional(),
});

export const unidadMedidaSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  categoria: z.string().min(1, 'La categoría es requerida'),
  activo: z.boolean().optional(),
});

export const paisSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido').max(3, 'Máximo 3 caracteres'),
  codigo_alpha3: z.string().nullable().optional(),
  nombre: z.string().min(1, 'El nombre es requerido'),
  nacionalidad: z.string().nullable().optional(),
  activo: z.boolean().optional(),
});

export const categoriaProductoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().nullable().optional(),
  padre_id: z.string().nullable().optional().transform(v => v === "" ? null : v),
  activo: z.boolean().optional(),
  orden: z.number().optional(),
});

export const comercialSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  activo: z.coerce.boolean().optional().default(true),
});

export type MonedaFormValues = z.infer<typeof monedaSchema>;
export type UnidadMedidaFormValues = z.infer<typeof unidadMedidaSchema>;
export type PaisFormValues = z.infer<typeof paisSchema>;
export type CategoriaProductoFormValues = z.infer<typeof categoriaProductoSchema>;
export type ComercialFormValues = z.infer<typeof comercialSchema>;
