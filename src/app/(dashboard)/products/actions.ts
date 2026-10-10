'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { productSchema } from '@/lib/schemas/product.schema';

export type ProductActionResult = {
  success?: boolean;
  error?: string;
  data?: unknown;
};

/**
 * Server Action: Crear nuevo producto o servicio
 */
export async function createProductAction(
  formData: FormData
): Promise<ProductActionResult> {
  const session = await getCurrentUserSession();
  if (!session?.user || !session.business) {
    return { error: 'No tienes una sesión activa o un negocio configurado' };
  }

  const rawData = {
    name: formData.get('name'),
    sku: formData.get('sku') || null,
    description: formData.get('description') || null,
    unit_price: formData.get('unit_price'),
    unit: formData.get('unit') || 'unidad',
    is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on',
  };

  const parseResult = productSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      error: parseResult.error.issues[0]?.message || 'Datos del producto inválidos',
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .insert({
      business_id: session.business.id,
      name: parseResult.data.name.trim(),
      sku: parseResult.data.sku?.trim() || null,
      description: parseResult.data.description?.trim() || null,
      unit_price: parseResult.data.unit_price,
      unit: parseResult.data.unit.trim().toLowerCase(),
      is_active: parseResult.data.is_active,
    })
    .select()
    .single();

  if (error) {
    return { error: `Error al registrar producto: ${error.message}` };
  }

  revalidatePath('/products');
  return { success: true, data };
}

/**
 * Server Action: Actualizar producto o servicio existente
 */
export async function updateProductAction(
  productId: string,
  formData: FormData
): Promise<ProductActionResult> {
  const session = await getCurrentUserSession();
  if (!session?.user || !session.business) {
    return { error: 'No tienes una sesión activa o un negocio configurado' };
  }

  const rawData = {
    name: formData.get('name'),
    sku: formData.get('sku') || null,
    description: formData.get('description') || null,
    unit_price: formData.get('unit_price'),
    unit: formData.get('unit') || 'unidad',
    is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on',
  };

  const parseResult = productSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      error: parseResult.error.issues[0]?.message || 'Datos del producto inválidos',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({
      name: parseResult.data.name.trim(),
      sku: parseResult.data.sku?.trim() || null,
      description: parseResult.data.description?.trim() || null,
      unit_price: parseResult.data.unit_price,
      unit: parseResult.data.unit.trim().toLowerCase(),
      is_active: parseResult.data.is_active,
    })
    .eq('id', productId)
    .eq('business_id', session.business.id);

  if (error) {
    return { error: `Error al actualizar producto: ${error.message}` };
  }

  revalidatePath('/products');
  return { success: true };
}

/**
 * Server Action: Alternar estado activo/inactivo rápidamente
 */
export async function toggleProductActiveAction(
  productId: string,
  isActive: boolean
): Promise<ProductActionResult> {
  const session = await getCurrentUserSession();
  if (!session?.user || !session.business) {
    return { error: 'No tienes una sesión activa o un negocio configurado' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', productId)
    .eq('business_id', session.business.id);

  if (error) {
    return { error: `Error al cambiar estado: ${error.message}` };
  }

  revalidatePath('/products');
  return { success: true };
}

/**
 * Server Action: Eliminar producto con protección de histórico
 */
export async function deleteProductAction(
  productId: string
): Promise<ProductActionResult> {
  const session = await getCurrentUserSession();
  if (!session?.user || !session.business) {
    return { error: 'No tienes una sesión activa o un negocio configurado' };
  }

  const supabase = await createClient();

  // 1. Verificar si el producto se encuentra en alguna cotización
  const { count, error: countError } = await supabase
    .from('quote_items')
    .select('id, quotes!inner(business_id)', { count: 'exact', head: true })
    .eq('product_id', productId)
    .eq('quotes.business_id', session.business.id);

  if (!countError && count && count > 0) {
    return {
      error: `Este producto está referenciado en ${count} cotización(es). Te recomendamos marcarlo como "Inactivo" para que no aparezca en nuevas cotizaciones pero se conserve la integridad histórica.`,
    };
  }

  // 2. Eliminar si no tiene referencias
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('business_id', session.business.id);

  if (error) {
    return { error: `Error al eliminar producto: ${error.message}` };
  }

  revalidatePath('/products');
  return { success: true };
}
