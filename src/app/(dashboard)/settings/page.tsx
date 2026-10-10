import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/auth/session';
import { SettingsView } from '@/components/settings/settings-view';

export const metadata = {
  title: 'Ajustes de Negocio — CotizaPro',
  description: 'Configura los datos fiscales, moneda e impuestos de tu empresa en CotizaPro.',
};

export default async function SettingsPage() {
  const session = await getCurrentUserSession();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.business) {
    return null; // El layout del dashboard despliega automáticamente el OnboardingDialog
  }

  return (
    <SettingsView
      business={session.business}
      profile={session.profile}
      role={session.role}
    />
  );
}
