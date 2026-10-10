import { z } from 'zod';

export const quoteItemSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
  description: z.string().min(1, 'La descripción es obligatoria').max(500),
  quantity: z.coerce.number().positive('La cantidad debe ser mayor a 0'),
  unit_price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  discount_rate: z.coerce.number().min(0).max(100).default(0),
  sort_order: z.number().int().default(0),
});

export const quoteSchema = z.object({
  client_id: z.string().uuid('Debes seleccionar un cliente válido'),
  issue_date: z.string().min(1, 'La fecha de emisión es obligatoria'),
  valid_until: z.string().min(1, 'La fecha de vigencia es obligatoria'),
  currency: z.string().length(3).default('USD'),
  tax_rate: z.coerce.number().min(0).max(100).default(18.0),
  notes: z.string().max(1000).optional().nullable(),
  terms: z.string().max(2000).optional().nullable(),
  items: z.array(quoteItemSchema).min(1, 'Debes agregar al menos un ítem a la cotización'),
});

export type QuoteFormValues = z.infer<typeof quoteSchema>;
export type QuoteItemFormValues = z.infer<typeof quoteItemSchema>;
