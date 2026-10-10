import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { ClientsView } from '@/components/clients/clients-view';
import { Client } from '@/core/domain/types';

export default async function ClientsPage() {
  const session = await getCurrentUserSession();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.business) {
    return null; // El layout del dashboard despliega automáticamente el OnboardingDialog
  }

  const supabase = await createClient();
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .eq('business_id', session.business.id)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error al cargar clientes:', error.message);
  }

  return <ClientsView initialClients={(clients as Client[]) || []} />;
}
