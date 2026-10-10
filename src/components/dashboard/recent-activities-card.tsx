import React from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import {
  History,
  FilePlus,
  ArrowRightLeft,
  FileDown,
  Edit,
} from 'lucide-react';

export interface DashboardActivity {
  id: string;
  action: string;
  metadata: {
    quote_number?: string;
    status?: string;
    total?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  } | null;
  created_at: string;
  quote?: {
    id: string;
    quote_number: string;
  } | null;
}

interface RecentActivitiesCardProps {
  activities: DashboardActivity[];
}

export function RecentActivitiesCard({ activities }: RecentActivitiesCardProps) {
  const getActionDetails = (act: DashboardActivity) => {
    switch (act.action) {
      case 'created':
        return {
          label: 'Cotización creada',
          icon: FilePlus,
          color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400',
        };
      case 'updated':
        return {
          label: 'Cotización editada',
          icon: Edit,
          color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400',
        };
      case 'status_changed':
        return {
          label: `Estado ➔ ${(act.metadata?.status as string) || 'actualizado'}`,
          icon: ArrowRightLeft,
          color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400',
        };
      case 'pdf_downloaded':
        return {
          label: 'PDF descargado',
          icon: FileDown,
          color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400',
        };
      default:
        return {
          label: act.action,
          icon: History,
          color: 'text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400',
        };
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Trazabilidad y Actividad
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registro cronológico de movimientos comerciales
          </p>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
          <History className="h-4 w-4" />
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400">
          No hay actividad registrada recientemente.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {activities.map((act) => {
            const detail = getActionDetails(act);
            const Icon = detail.icon;
            const quoteNum =
              act.quote?.quote_number || act.metadata?.quote_number || 'Cotización';

            return (
              <div
                key={act.id}
                className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${detail.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      {detail.label}
                    </div>
                    {act.quote?.id ? (
                      <Link
                        href={`/quotes/${act.quote.id}`}
                        className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {quoteNum}
                      </Link>
                    ) : (
                      <span className="text-[11px] text-slate-500">{quoteNum}</span>
                    )}
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 shrink-0">
                  {formatDate(act.created_at)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
