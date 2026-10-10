import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, UserPlus, PackagePlus, ArrowUpRight } from 'lucide-react';

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Acción 1: Nueva Cotización */}
      <Card className="p-4 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent border-indigo-200/60 dark:border-indigo-900/40 hover:border-indigo-400 transition-all group">
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <PlusCircle className="h-5 w-5" />
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </div>
        <div className="mt-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Crear Nueva Cotización
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Propuesta comercial con impuestos y PDF automático
          </p>
        </div>
        <div className="mt-4">
          <Link href="/quotes/new">
            <Button size="sm" variant="primary" className="w-full">
              Nueva Cotización
            </Button>
          </Link>
        </div>
      </Card>

      {/* Acción 2: Nuevo Cliente */}
      <Card className="p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all group">
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <UserPlus className="h-5 w-5" />
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </div>
        <div className="mt-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Registrar Cliente
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Añade contactos con RUC/RFC para facturar
          </p>
        </div>
        <div className="mt-4">
          <Link href="/clients">
            <Button size="sm" variant="outline" className="w-full">
              Ir a Clientes
            </Button>
          </Link>
        </div>
      </Card>

      {/* Acción 3: Nuevo Producto */}
      <Card className="p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all group">
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <PackagePlus className="h-5 w-5" />
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </div>
        <div className="mt-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Añadir al Catálogo
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Configura productos o servicios con precios base
          </p>
        </div>
        <div className="mt-4">
          <Link href="/products">
            <Button size="sm" variant="outline" className="w-full">
              Ver Catálogo
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
