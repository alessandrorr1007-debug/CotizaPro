import React from 'react';
import Link from 'next/link';
import { getCurrentUserSession } from '@/lib/auth/session';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileSpreadsheet,
  Users,
  Package,
  PlusCircle,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';

export default async function DashboardPage() {
  const session = await getCurrentUserSession();
  const business = session?.business;
  const profile = session?.profile;

  return (
    <div className="space-y-8">
      {/* Header con Bienvenida y Acciones Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hola, {profile?.full_name?.split(' ')[0] || 'Bienvenido'} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Panel de control comercial de <strong className="text-slate-700 dark:text-slate-300">{business?.name || 'tu negocio'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/quotes/new">
            <Button size="md" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Nueva Cotización</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Cotizado
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {business?.currency || 'USD'} 0.00
            </span>
            <p className="mt-1 text-xs text-slate-400">En 0 cotizaciones registradas</p>
          </div>
        </Card>

        {/* KPI 2 */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Aceptadas
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              0
            </span>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              0% tasa de conversión
            </p>
          </div>
        </Card>

        {/* KPI 3 */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pendientes
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              0
            </span>
            <p className="mt-1 text-xs text-slate-400">En espera de respuesta</p>
          </div>
        </Card>

        {/* KPI 4 */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Clientes Activos
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              0
            </span>
            <p className="mt-1 text-xs text-slate-400">Directorio de contactos</p>
          </div>
        </Card>
      </div>

      {/* Secciones de Inicio Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
          <div>
            <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Users className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-semibold">1. Registra tus Clientes</CardTitle>
            <CardDescription className="mt-1 text-xs">
              Guarda los datos de contacto y tributarios de tus prospectos para asignarlos rápidamente.
            </CardDescription>
          </div>
          <div className="mt-6">
            <Link href="/clients">
              <Button variant="outline" size="sm" className="w-full">
                Gestionar Clientes
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
          <div>
            <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Package className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-semibold">2. Carga tu Catálogo</CardTitle>
            <CardDescription className="mt-1 text-xs">
              Añade tus productos o servicios con precios base y unidades para cotizar en segundos.
            </CardDescription>
          </div>
          <div className="mt-6">
            <Link href="/products">
              <Button variant="outline" size="sm" className="w-full">
                Ver Catálogo
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
          <div>
            <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 flex items-center justify-center mb-4">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-semibold">3. Emite tu Primera Cotización</CardTitle>
            <CardDescription className="mt-1 text-xs">
              Crea propuestas comerciales elegantes con cálculo de impuestos y descárgalas en PDF.
            </CardDescription>
          </div>
          <div className="mt-6">
            <Link href="/quotes/new">
              <Button variant="primary" size="sm" className="w-full">
                Crear Cotización
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
