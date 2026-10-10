'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { quoteSchema, QuoteFormValues } from '@/lib/schemas/quote.schema';
import { QuoteCalculator, RawQuoteItemInput } from '@/core/engine/quote-calculator';
import { QuoteStatus } from '@/core/domain/types';

export type QuoteActionResult = {
  success?: boolean;
  error?: string;
  quoteId?: string;
};

/**
 * Server Action: Crear nueva cotización con recálculo financiero obligatorio en servidor
 */
export async function createQuoteAction(
  payload: QuoteFormValues
): Promise<QuoteActionResult> {
  const session = await getCurrentUserSession();
  if (!session?.user || !session.business) {
    return { error: 'No tienes una sesión activa o un negocio configurado' };
  }

  const parseResult = quoteSchema.safeParse(payload);
  if (!parseResult.success) {
    return {
      error: parseResult.error.issues[0]?.message || 'Datos de la cotización inválidos',
    };
  }

  const data = parseResult.data;

  // INVARIANTE DE SEGURIDAD: Recalcular montos en el servidor usando QuoteCalculator
  const rawItems: RawQuoteItemInput[] = data.items.map((item, index) => ({
    product_id: item.product_id || null,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_rate: item.discount_rate,
    sort_order: index,
  }));

  const calc = QuoteCalculator.calculateQuote(rawItems, data.tax_rate, 0);

  const supabase = await createClient();

  // 1. Obtener correlativo consecutivo e incrementarlo atómicamente
  const { data: businessData, error: businessError } = await supabase
    .from('businesses')
    .select('consecutive_quote_number')
    .eq('id', session.business.id)
    .single();

  if (businessError || !businessData) {
    return { error: 'No se pudo obtener el correlativo del negocio' };
  }

  const currentNumber = businessData.consecutive_quote_number || 1;
  const quoteNumber = `COT-${String(currentNumber).padStart(4, '0')}`;

  // Actualizar el correlativo para la siguiente cotización
  await supabase
    .from('businesses')
    .update({ consecutive_quote_number: currentNumber + 1 })
    .eq('id', session.business.id);

  // 2. Insertar cabecera de cotización
  const { data: newQuote, error: quoteError } = await supabase
    .from('quotes')
    .insert({
      business_id: session.business.id,
      client_id: data.client_id,
      quote_number: quoteNumber,
      status: 'draft',
      issue_date: data.issue_date,
      valid_until: data.valid_until,
      currency: data.currency,
      subtotal: calc.subtotal,
      discount_amount: calc.discount_amount,
      tax_rate: calc.tax_rate,
      tax_amount: calc.tax_amount,
      total: calc.total,
      notes: data.notes?.trim() || null,
      terms: data.terms?.trim() || null,
      created_by: session.user.id,
    })
    .select('id')
    .single();

  if (quoteError || !newQuote) {
    return { error: `Error al crear cotización: ${quoteError?.message}` };
  }

  // 3. Insertar líneas de detalle
  const itemsToInsert = calc.items.map((item, index) => ({
    quote_id: newQuote.id,
    product_id: item.product_id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_rate: item.discount_rate,
    subtotal: item.subtotal,
    sort_order: index,
  }));

  const { error: itemsError } = await supabase
    .from('quote_items')
    .insert(itemsToInsert);

  if (itemsError) {
    return { error: `Error al registrar ítems: ${itemsError.message}` };
  }

  // 4. Registrar evento en bitácora de actividad
  await supabase.from('quote_activities').insert({
    quote_id: newQuote.id,
    user_id: session.user.id,
    action: 'created',
    metadata: {
      quote_number: quoteNumber,
      total: calc.total,
      items_count: itemsToInsert.length,
    },
  });

  revalidatePath('/quotes');
  revalidatePath('/dashboard');
  return { success: true, quoteId: newQuote.id };
}

/**
 * Server Action: Actualizar cotización existente con recálculo obligatorio
 */
export async function updateQuoteAction(
  quoteId: string,
  payload: QuoteFormValues
): Promise<QuoteActionResult> {
  const session = await getCurrentUserSession();
  if (!session?.user || !session.business) {
    return { error: 'No tienes una sesión activa o un negocio configurado' };
  }

  const parseResult = quoteSchema.safeParse(payload);
  if (!parseResult.success) {
    return {
      error: parseResult.error.issues[0]?.message || 'Datos de la cotización inválidos',
    };
  }

  const data = parseResult.data;

  // INVARIANTE: Recálculo determinista en servidor
  const rawItems: RawQuoteItemInput[] = data.items.map((item, index) => ({
    product_id: item.product_id || null,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_rate: item.discount_rate,
    sort_order: index,
  }));

  const calc = QuoteCalculator.calculateQuote(rawItems, data.tax_rate, 0);

  const supabase = await createClient();

  // Verificar que la cotización existe y está en estado borrador
  const { data: existingQuote, error: fetchError } = await supabase
    .from('quotes')
    .select('status')
    .eq('id', quoteId)
    .eq('business_id', session.business.id)
    .single();

  if (fetchError || !existingQuote) {
    return { error: 'Cotización no encontrada' };
  }

  if (existingQuote.status !== 'draft') {
    return {
      error: 'Solo se pueden editar cotizaciones en estado borrador. Reabre la cotización como borrador si necesitas modificarla.',
    };
  }

  // 1. Actualizar cabecera
  const { error: quoteError } = await supabase
    .from('quotes')
    .update({
      client_id: data.client_id,
      issue_date: data.issue_date,
      valid_until: data.valid_until,
      currency: data.currency,
      subtotal: calc.subtotal,
      discount_amount: calc.discount_amount,
      tax_rate: calc.tax_rate,
      tax_amount: calc.tax_amount,
      total: calc.total,
      notes: data.notes?.trim() || null,
      terms: data.terms?.trim() || null,
    })
    .eq('id', quoteId)
    .eq('business_id', session.business.id);

  if (quoteError) {
    return { error: `Error al actualizar cotización: ${quoteError.message}` };
  }

  // 2. Reemplazar líneas de detalle
  await supabase.from('quote_items').delete().eq('quote_id', quoteId);

  const itemsToInsert = calc.items.map((item, index) => ({
    quote_id: quoteId,
    product_id: item.product_id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_rate: item.discount_rate,
    subtotal: item.subtotal,
    sort_order: index,
  }));

  const { error: itemsError } = await supabase
    .from('quote_items')
    .insert(itemsToInsert);

  if (itemsError) {
    return { error: `Error al actualizar ítems: ${itemsError.message}` };
  }

  // 3. Registrar actividad
  await supabase.from('quote_activities').insert({
    quote_id: quoteId,
    user_id: session.user.id,
    action: 'updated',
    metadata: { total: calc.total },
  });

  revalidatePath('/quotes');
  revalidatePath(`/quotes/${quoteId}`);
  revalidatePath('/dashboard');
  return { success: true, quoteId };
}

/**
 * Server Action: Cambiar estado del ciclo de vida de la cotización
 */
export async function updateQuoteStatusAction(
  quoteId: string,
  newStatus: QuoteStatus
): Promise<QuoteActionResult> {
  const session = await getCurrentUserSession();
  if (!session?.user || !session.business) {
    return { error: 'No tienes una sesión activa o un negocio configurado' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('quotes')
    .update({ status: newStatus })
    .eq('id', quoteId)
    .eq('business_id', session.business.id);

  if (error) {
    return { error: `Error al actualizar estado: ${error.message}` };
  }

  // Registrar actividad
  await supabase.from('quote_activities').insert({
    quote_id: quoteId,
    user_id: session.user.id,
    action: 'status_changed',
    metadata: { status: newStatus },
  });

  revalidatePath('/quotes');
  revalidatePath(`/quotes/${quoteId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * Server Action: Eliminar cotización
 */
export async function deleteQuoteAction(
  quoteId: string
): Promise<QuoteActionResult> {
  const session = await getCurrentUserSession();
  if (!session?.user || !session.business) {
    return { error: 'No tienes una sesión activa o un negocio configurado' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', quoteId)
    .eq('business_id', session.business.id);

  if (error) {
    return { error: `Error al eliminar cotización: ${error.message}` };
  }

  revalidatePath('/quotes');
  revalidatePath('/dashboard');
  return { success: true };
}
