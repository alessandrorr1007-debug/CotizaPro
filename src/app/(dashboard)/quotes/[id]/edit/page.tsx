import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { QuoteBuilder } from '@/components/quotes/quote-builder';
import { Client, Product, Quote, QuoteItem } from '@/core/domain/types';

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getCurrentUserSession();
  if (!session?.user) {
    redirect('/login');
  }

  if (!session.business) {
    return null;
  }

  const supabase = await createClient();

  // 1. Consultar cotización
  const { data: quote, error } = await supabase
    .from('quotes')
    .select(`
      *,
      items:quote_items(*)
    `)
    .eq('id', id)
    .eq('business_id', session.business.id)
    .single();

  if (error || !quote) {
    notFound();
  }

  // Si la cotización ya no es un borrador, redirigir a la vista de detalle
  if (quote.status !== 'draft') {
    redirect(`/quotes/${id}`);
  }

  if (quote.items && Array.isArray(quote.items)) {
    (quote.items as QuoteItem[]).sort((a: QuoteItem, b: QuoteItem) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }

  // 2. Obtener clientes
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('business_id', session.business.id)
    .order('name', { ascending: true });

  // 3. Obtener productos activos
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('business_id', session.business.id)
    .order('name', { ascending: true });

  return (
    <QuoteBuilder
      clients={(clients as Client[]) || []}
      products={(products as Product[]) || []}
      defaultCurrency={quote.currency || session.business.currency || 'USD'}
      defaultTaxRate={quote.tax_rate ?? session.business.default_tax_rate ?? 18.0}
      initialQuote={quote as unknown as Quote}
    />
  );
}
