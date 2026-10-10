import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { QuoteBuilder } from '@/components/quotes/quote-builder';
import { Client, Product } from '@/core/domain/types';

export default async function NewQuotePage() {
  const session = await getCurrentUserSession();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.business) {
    return null;
  }

  const supabase = await createClient();

  // 1. Obtener clientes del negocio
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('business_id', session.business.id)
    .order('name', { ascending: true });

  // 2. Obtener productos activos del catálogo
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('business_id', session.business.id)
    .eq('is_active', true)
    .order('name', { ascending: true });

  return (
    <QuoteBuilder
      clients={(clients as Client[]) || []}
      products={(products as Product[]) || []}
      defaultCurrency={session.business.currency || 'USD'}
      defaultTaxRate={session.business.default_tax_rate ?? 18.0}
    />
  );
}
