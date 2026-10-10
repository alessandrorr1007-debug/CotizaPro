import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { QuoteStatus } from '@/core/domain/types';
import { formatCurrency } from '@/lib/utils';
import {
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface PipelineStatusCardsProps {
  currency: string;
  breakdown: Record<
    QuoteStatus,
    { count: number; amount: number; percentage: number }
  >;
}

export function PipelineStatusCards({
  currency,
  breakdown,
}: PipelineStatusCardsProps) {
  const statusMeta: Record<
    QuoteStatus,
    {
      label: string;
      color: string;
      bgColor: string;
      textColor: string;
      icon: React.ElementType;
    }
  > = {
    draft: {
      label: 'Borradores',
      color: 'bg-slate-400',
      bgColor: 'bg-slate-50 dark:bg-slate-800/50',
      textColor: 'text-slate-700 dark:text-slate-300',
      icon: FileText,
    },
    sent: {
      label: 'Enviadas',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50/50 dark:bg-blue-950/20',
      textColor: 'text-blue-700 dark:text-blue-300',
      icon: Send,
    },
    accepted: {
      label: 'Aceptadas',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      icon: CheckCircle2,
    },
    rejected: {
      label: 'Rechazadas',
      color: 'bg-rose-500',
      bgColor: 'bg-rose-50/50 dark:bg-rose-950/20',
      textColor: 'text-rose-700 dark:text-rose-300',
      icon: XCircle,
    },
    expired: {
      label: 'Vencidas',
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50/50 dark:bg-amber-950/20',
      textColor: 'text-amber-700 dark:text-amber-300',
      icon: Clock,
    },
  };

  const statuses: QuoteStatus[] = ['draft', 'sent', 'accepted', 'rejected', 'expired'];

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Distribución del Embudo Comercial
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Seguimiento financiero en tiempo real según el ciclo de venta
          </p>
        </div>
        <Link
          href="/quotes"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
        >
          <span>Ver todas</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Barra segmentada de progreso */}
      <div className="mt-5 h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
        {statuses.map((st) => {
          const item = breakdown[st];
          if (item.percentage <= 0) return null;
          return (
            <div
              key={st}
              style={{ width: `${item.percentage}%` }}
              className={statusMeta[st].color}
              title={`${statusMeta[st].label}: ${item.percentage}%`}
            />
          );
        })}
      </div>

      {/* Tarjetas individuales de estados */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statuses.map((st) => {
          const meta = statusMeta[st];
          const item = breakdown[st];
          const Icon = meta.icon;

          return (
            <Link
              key={st}
              href="/quotes"
              className={`p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 transition-all hover:scale-[1.02] cursor-pointer ${meta.bgColor}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {meta.label}
                </span>
                <Icon className={`h-4 w-4 ${meta.textColor}`} />
              </div>

              <div className="mt-2">
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {item.count}
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                  {formatCurrency(item.amount, currency)}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {item.percentage}% del total
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
