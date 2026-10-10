import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  tax_id: z.string().max(20).optional().nullable(),
  email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')).nullable(),
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
