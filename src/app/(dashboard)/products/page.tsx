import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { ProductsView } from '@/components/products/products-view';
import { Product } from '@/core/domain/types';

export default async function ProductsPage() {
  const session = await getCurrentUserSession();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.business) {
    return null; // El layout del dashboard despliega automáticamente el OnboardingDialog
  }

  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('business_id', session.business.id)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error al cargar productos:', error.message);
  }

  return (
    <ProductsView
      initialProducts={(products as Product[]) || []}
      currency={session.business.currency || 'USD'}
    />
  );
}
