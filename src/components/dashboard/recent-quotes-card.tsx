import React from 'react';
import Link from 'next/link';
import { Quote } from '@/core/domain/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuoteStatusBadge } from '@/components/quotes/quote-status-badge';
import {
  FileSpreadsheet,
  ArrowRight,
  Eye,
  FileDown,
  PlusCircle,
} from 'lucide-react';

interface RecentQuotesCardProps {
  quotes: Quote[];
  currency: string;
}

export function RecentQuotesCard({ quotes, currency }: RecentQuotesCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Últimas Cotizaciones
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Documentos comerciales generados recientemente
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

      {quotes.length === 0 ? (
        <div className="py-12 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-3">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Aún no has creado cotizaciones
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
            Empieza generando tu primera propuesta formal para tus clientes.
          </p>
          <div className="mt-4">
            <Link href="/quotes/new">
              <Button size="sm" className="gap-1.5">
                <PlusCircle className="h-4 w-4" />
                <span>Nueva Cotización</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="pb-2.5">N° Cotización</th>
                <th className="pb-2.5">Cliente</th>
                <th className="pb-2.5">Fecha</th>
                <th className="pb-2.5 text-right">Monto</th>
                <th className="pb-2.5 text-center">Estado</th>
                <th className="pb-2.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {quotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 font-semibold">
                    <Link
                      href={`/quotes/${quote.id}`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {quote.quote_number}
                    </Link>
                  </td>
                  <td className="py-3 font-medium text-slate-900 dark:text-white max-w-[140px] truncate">
                    {quote.client?.name || 'Cliente'}
                  </td>
                  <td className="py-3 text-xs text-slate-500">
                    {formatDate(quote.issue_date)}
                  </td>
                  <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                    {formatCurrency(quote.total, quote.currency || currency)}
                  </td>
                  <td className="py-3 text-center">
                    <QuoteStatusBadge status={quote.status} />
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/quotes/${quote.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                          title="Ver detalle"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <a
                        href={`/quotes/${quote.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                          title="Descargar PDF"
                        >
                          <FileDown className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
