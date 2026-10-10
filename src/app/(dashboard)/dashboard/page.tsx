import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { Quote } from '@/core/domain/types';
import { DashboardCalculator } from '@/core/engine/dashboard-metrics';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { PipelineStatusCards } from '@/components/dashboard/pipeline-status-cards';
import { RecentQuotesCard } from '@/components/dashboard/recent-quotes-card';
import {
  RecentActivitiesCard,
  DashboardActivity,
} from '@/components/dashboard/recent-activities-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
  PlusCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getCurrentUserSession();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.business) {
    return null;
  }

  const business = session.business;
  const profile = session.profile;
  const currency = business.currency || 'USD';

  const supabase = await createClient();

  // Consultas concurrentes en base de datos bajo RLS
  const [quotesRes, clientsCountRes, productsCountRes, activitiesRes] =
    await Promise.all([
      // 1. Todas las cotizaciones del negocio
      supabase
        .from('quotes')
        .select(`
          id,
          business_id,
          client_id,
          quote_number,
          status,
          issue_date,
          valid_until,
          currency,
          subtotal,
          discount_amount,
          tax_rate,
          tax_amount,
          total,
          notes,
          terms,
          created_by,
          created_at,
          updated_at,
          client:clients(name)
        `)
        .eq('business_id', business.id)
        .order('created_at', { ascending: false }),

      // 2. Conteo de clientes
      supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', business.id),

      // 3. Conteo de productos
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', business.id),

      // 4. Últimas actividades registradas
      supabase
        .from('quote_activities')
        .select(`
          id,
          action,
          metadata,
          created_at,
          quote:quotes!inner(id, quote_number, business_id)
        `)
        .eq('quote.business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(6),
    ]);

  const quotes = (quotesRes.data as unknown as Quote[]) || [];
  const clientsCount = clientsCountRes.count ?? 0;
  const productsCount = productsCountRes.count ?? 0;
  const activities = (activitiesRes.data as unknown as DashboardActivity[]) || [];

  // Cálculo determinista de KPIs y agregados
  const metrics = DashboardCalculator.calculate(
    quotes,
    clientsCount,
    productsCount
  );

  const recentQuotes = quotes.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Encabezado con Bienvenida y Botón de Creación */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Hola, {profile?.full_name?.split(' ')[0] || 'Bienvenido'} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Panel de control comercial de{' '}
            <strong className="text-slate-700 dark:text-slate-200">
              {business.name}
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/quotes/new">
            <Button size="md" className="gap-2 shadow-sm">
              <PlusCircle className="h-4 w-4" />
              <span>Nueva Cotización</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <QuickActions />

      {/* Tarjetas Principales de Indicadores (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Cotizado */}
        <KpiCard
          title="Total Cotizado"
          value={formatCurrency(metrics.totalQuotedAmount, currency)}
          subtitle={`En ${metrics.totalQuotesCount} cotizaciones emitidas`}
          icon={TrendingUp}
          variant="indigo"
        />

        {/* KPI 2: Cotizaciones Aceptadas / Facturables */}
        <KpiCard
          title="Aceptadas (Cierres)"
          value={formatCurrency(metrics.acceptedAmount, currency)}
          subtitle={`${metrics.acceptedQuotesCount} cotizaciones cerradas con éxito`}
          icon={CheckCircle2}
          variant="emerald"
          trendBadge={{
            text: `${metrics.conversionRate}% conversión`,
            positive: metrics.conversionRate > 0,
          }}
        />

        {/* KPI 3: Cartera Pendiente */}
        <KpiCard
          title="Cartera Pendiente"
          value={formatCurrency(metrics.pendingAmount, currency)}
          subtitle={`${metrics.pendingQuotesCount} en borrador o enviadas`}
          icon={Clock}
          variant="amber"
        />

        {/* KPI 4: Clientes y Catálogo */}
        <KpiCard
          title="Directorio Comercial"
          value={String(metrics.clientsCount)}
          subtitle={`${metrics.productsCount} productos en catálogo`}
          icon={Users}
          variant="blue"
        />
      </div>

      {/* Visualización del Embudo de Estados */}
      <PipelineStatusCards
        currency={currency}
        breakdown={metrics.statusBreakdown}
      />

      {/* Sección Inferior: Cotizaciones Recientes y Trazabilidad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentQuotesCard quotes={recentQuotes} currency={currency} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivitiesCard activities={activities} />
        </div>
      </div>
    </div>
  );
}
