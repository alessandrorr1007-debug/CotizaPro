import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  sku: z.string().max(50).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  unit_price: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  unit: z.string().min(1, 'La unidad es requerida').max(20).default('unidad'),
  is_active: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof productSchema>;
