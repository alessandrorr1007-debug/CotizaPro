import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/auth/session';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { OnboardingDialog } from '@/components/layout/onboarding-dialog';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserSession();

  // Si no está autenticado, redirigir a login
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Diálogo de Onboarding si el usuario no tiene negocio aún */}
      {!session.business && <OnboardingDialog />}

      {/* Navegación móvil */}
      <div className="print:hidden">
        <Navbar business={session.business} profile={session.profile} />
      </div>

      {/* Barra lateral en pantallas grandes */}
      <div className="hidden lg:flex lg:flex-col lg:min-h-screen print:hidden">
        <Sidebar business={session.business} profile={session.profile} />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:p-0 print:overflow-visible">
        <div className="max-w-7xl mx-auto print:max-w-none print:w-full">{children}</div>
      </main>
    </div>
  );
}
