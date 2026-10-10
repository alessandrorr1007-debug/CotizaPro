import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { QuotesTable } from '@/components/quotes/quotes-table';
import { Quote } from '@/core/domain/types';

export default async function QuotesPage() {
  const session = await getCurrentUserSession();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.business) {
    return null;
  }

  const supabase = await createClient();
  const { data: quotes, error } = await supabase
    .from('quotes')
    .select(`
      *,
      client:clients(*)
    `)
    .eq('business_id', session.business.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al cargar cotizaciones:', error.message);
  }

  return <QuotesTable initialQuotes={(quotes as unknown as Quote[]) || []} />;
}
