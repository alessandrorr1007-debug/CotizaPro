import { z } from 'zod';

export const businessSettingsSchema = z.object({
  name: z.string().min(2, 'El nombre de la empresa debe tener al menos 2 caracteres').max(150),
  tax_id: z.string().max(25).optional().nullable(),
  email: z.string().email('Ingresa un correo electrónico comercial válido').optional().or(z.literal('')).nullable(),
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  currency: z.string().length(3, 'El código de moneda debe tener 3 letras (ej. USD, PEN)').default('USD'),
  default_tax_rate: z.coerce
    .number({ message: 'Ingresa una tasa de impuesto válida' })
    .min(0, 'El impuesto no puede ser menor a 0%')
    .max(100, 'El impuesto no puede ser mayor a 100%')
    .default(18.0),
});

export const profileSettingsSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
});

export type BusinessSettingsValues = z.infer<typeof businessSettingsSchema>;
export type ProfileSettingsValues = z.infer<typeof profileSettingsSchema>;
