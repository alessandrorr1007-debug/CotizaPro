import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { QuoteDetailView } from '@/components/quotes/quote-detail-view';
import { Quote, QuoteActivity, QuoteItem } from '@/core/domain/types';

import { isDateExpired } from '@/lib/utils';

export default async function QuoteDetailPage({
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

  // 1. Consultar cotización con cliente e ítems
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select(`
      *,
      client:clients(*),
      items:quote_items(*)
    `)
    .eq('id', id)
    .eq('business_id', session.business.id)
    .single();

  if (quoteError || !quote) {
    notFound();
  }

  // Ordenar los ítems según sort_order
  if (quote.items && Array.isArray(quote.items)) {
    (quote.items as QuoteItem[]).sort((a: QuoteItem, b: QuoteItem) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }

  // 2. Consultar historial de actividades
  const { data: activities } = await supabase
    .from('quote_activities')
    .select('*')
    .eq('quote_id', id)
    .order('created_at', { ascending: false });

  // 3. Determinar si el plazo de validez ya expiró
  const isPastValidDate = quote.status === 'sent' && isDateExpired(quote.valid_until);

  return (
    <QuoteDetailView
      quote={quote as unknown as Quote}
      business={session.business}
      activities={(activities as QuoteActivity[]) || []}
      isPastValidDate={isPastValidDate}
    />
  );
}
