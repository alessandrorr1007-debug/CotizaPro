'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { clientSchema } from '@/lib/schemas/client.schema';

export type ClientActionResult = {
  success?: boolean;
  error?: string;
  data?: unknown;
};

/**
 * Server Action: Crear nuevo cliente
 */
export async function createClientAction(
  formData: FormData
): Promise<ClientActionResult> {
  const session = await getCurrentUserSession();
  if (!session?.user || !session.business) {
    return { error: 'No tienes una sesión activa o un negocio configurado' };
  }

  const rawData = {
    name: formData.get('name'),
    tax_id: formData.get('tax_id') || null,
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
    address: formData.get('address') || null,
    notes: formData.get('notes') || null,
  };

  const parseResult = clientSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      error: parseResult.error.issues[0]?.message || 'Datos del cliente inválidos',
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clients')
    .insert({
      business_id: session.business.id,
      name: parseResult.data.name.trim(),
      tax_id: parseResult.data.tax_id?.trim() || null,
      email: parseResult.data.email?.trim() || null,
      phone: parseResult.data.phone?.trim() || null,
      address: parseResult.data.address?.trim() || null,
      notes: parseResult.data.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return { error: `Error al crear cliente: ${error.message}` };
  }

  revalidatePath('/clients');
  return { success: true, data };
}

/**
 * Server Action: Actualizar cliente existente
 */
export async function updateClientAction(
  clientId: string,
  formData: FormData
): Promise<ClientActionResult> {
  const session = await getCurrentUserSession();
  if (!session?.user || !session.business) {
    return { error: 'No tienes una sesión activa o un negocio configurado' };
  }

  const rawData = {
    name: formData.get('name'),
    tax_id: formData.get('tax_id') || null,
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
    address: formData.get('address') || null,
    notes: formData.get('notes') || null,
  };

  const parseResult = clientSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      error: parseResult.error.issues[0]?.message || 'Datos del cliente inválidos',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('clients')
    .update({
      name: parseResult.data.name.trim(),
      tax_id: parseResult.data.tax_id?.trim() || null,
      email: parseResult.data.email?.trim() || null,
      phone: parseResult.data.phone?.trim() || null,
      address: parseResult.data.address?.trim() || null,
      notes: parseResult.data.notes?.trim() || null,
    })
    .eq('id', clientId)
    .eq('business_id', session.business.id);

  if (error) {
    return { error: `Error al actualizar cliente: ${error.message}` };
  }

  revalidatePath('/clients');
  return { success: true };
}

/**
 * Server Action: Eliminar cliente con verificación de integridad referencial
 */
export async function deleteClientAction(
  clientId: string
): Promise<ClientActionResult> {
  const session = await getCurrentUserSession();
  if (!session?.user || !session.business) {
    return { error: 'No tienes una sesión activa o un negocio configurado' };
  }

  const supabase = await createClient();

  // 1. Verificar si existen cotizaciones asociadas a este cliente
  const { count, error: countError } = await supabase
    .from('quotes')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('business_id', session.business.id);

  if (countError) {
    return { error: `Error de verificación: ${countError.message}` };
  }

  if (count && count > 0) {
    return {
      error: `No se puede eliminar el cliente porque tiene ${count} cotización(es) registrada(s). Si deseas conservarlo en el historial, te recomendamos editar sus datos.`,
    };
  }

  // 2. Proceder con la eliminación segura
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)
    .eq('business_id', session.business.id);

  if (error) {
    return { error: `Error al eliminar cliente: ${error.message}` };
  }

  revalidatePath('/clients');
  return { success: true };
}
