import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'El nombre completo debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  businessName: z.string().min(2, 'El nombre del negocio debe tener al menos 2 caracteres').max(150),
  currency: z.string().length(3).default('USD'),
  defaultTaxRate: z.coerce.number().min(0).max(100).default(18.0),
});

export const businessOnboardingSchema = z.object({
  name: z.string().min(2, 'El nombre del negocio debe tener al menos 2 caracteres').max(150),
  tax_id: z.string().max(20).optional().nullable(),
  currency: z.string().length(3).default('USD'),
  default_tax_rate: z.coerce.number().min(0).max(100).default(18.0),
  email: z.string().email('Correo de contacto inválido').optional().or(z.literal('')).nullable(),
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type BusinessOnboardingValues = z.infer<typeof businessOnboardingSchema>;
