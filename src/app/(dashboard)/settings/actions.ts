'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import {
  businessSettingsSchema,
  profileSettingsSchema,
} from '@/lib/schemas/business.schema';

export type SettingsActionResult = {
  success?: boolean;
  error?: string;
  message?: string;
};

/**
 * Server Action: Actualizar datos y configuración fiscal del negocio
 */
export async function updateBusinessSettingsAction(
  _prevState: SettingsActionResult | null,
  formData: FormData
): Promise<SettingsActionResult> {
  const session = await getCurrentUserSession();
  if (!session?.user || !session.business) {
    return { error: 'No tienes una sesión activa o un negocio configurado' };
  }

  if (session.role !== 'owner' && session.role !== 'admin') {
    return { error: 'Solo los propietarios o administradores pueden modificar los ajustes de la empresa' };
  }

  const rawData = {
    name: formData.get('name'),
    tax_id: formData.get('tax_id') || null,
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
    address: formData.get('address') || null,
    currency: formData.get('currency') || 'USD',
    default_tax_rate: formData.get('default_tax_rate') || 18.0,
  };

  const parseResult = businessSettingsSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      error: parseResult.error.issues[0]?.message || 'Datos del negocio inválidos',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('businesses')
    .update({
      name: parseResult.data.name.trim(),
      tax_id: parseResult.data.tax_id?.trim() || null,
      email: parseResult.data.email?.trim() || null,
      phone: parseResult.data.phone?.trim() || null,
      address: parseResult.data.address?.trim() || null,
      currency: parseResult.data.currency,
      default_tax_rate: parseResult.data.default_tax_rate,
    })
    .eq('id', session.business.id);

  if (error) {
    return { error: `Error al guardar los ajustes: ${error.message}` };
  }

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  revalidatePath('/quotes');
  return { success: true, message: 'Configuración del negocio actualizada exitosamente' };
}

/**
 * Server Action: Actualizar perfil de usuario
 */
export async function updateProfileSettingsAction(
  _prevState: SettingsActionResult | null,
  formData: FormData
): Promise<SettingsActionResult> {
  const session = await getCurrentUserSession();
  if (!session?.user) {
    return { error: 'No tienes una sesión activa' };
  }

  const rawData = {
    fullName: formData.get('fullName'),
  };

  const parseResult = profileSettingsSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      error: parseResult.error.issues[0]?.message || 'Nombre de usuario inválido',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parseResult.data.fullName.trim(),
    })
    .eq('id', session.user.id);

  if (error) {
    return { error: `Error al actualizar perfil: ${error.message}` };
  }

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { success: true, message: 'Perfil de usuario actualizado con éxito' };
}
