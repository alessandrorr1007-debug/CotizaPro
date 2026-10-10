'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Business, Quote, QuoteActivity, QuoteStatus } from '@/core/domain/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { QuoteStatusBadge } from '@/components/quotes/quote-status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { updateQuoteStatusAction } from '@/app/(dashboard)/quotes/actions';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  Send,
  Edit2,
  FileDown,
  History,
  Clock,
  Printer,
} from 'lucide-react';

interface QuoteDetailViewProps {
  quote: Quote;
  business: Business;
  activities: QuoteActivity[];
}

export function QuoteDetailView({
  quote,
  business,
  activities,
}: QuoteDetailViewProps) {
  const router = useRouter();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: QuoteStatus) => {
    setIsUpdatingStatus(true);
    await updateQuoteStatusAction(quote.id, newStatus);
    setIsUpdatingStatus(false);
    router.refresh();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Barra Superior de Control y Pipeline */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/quotes">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Cotización {quote.quote_number}
              </h1>
              <QuoteStatusBadge status={quote.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Creada el {formatDate(quote.created_at)}
            </p>
          </div>
        </div>

        {/* Acciones de Pipeline y Documento */}
        <div className="flex flex-wrap items-center gap-2">
          {quote.status === 'draft' && (
            <>
              <Link href={`/quotes/${quote.id}/edit`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Edit2 className="h-4 w-4" />
                  <span>Editar</span>
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5"
                isLoading={isUpdatingStatus}
                onClick={() => handleStatusChange('sent')}
              >
                <Send className="h-4 w-4" />
                <span>Marcar como Enviada</span>
              </Button>
            </>
          )}

          {quote.status === 'sent' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                isLoading={isUpdatingStatus}
                onClick={() => handleStatusChange('accepted')}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Aprobar / Aceptada</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                isLoading={isUpdatingStatus}
                onClick={() => handleStatusChange('rejected')}
              >
                <XCircle className="h-4 w-4" />
                <span>Rechazada</span>
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir</span>
          </Button>

          <Link href={`/quotes/${quote.id}/pdf`} target="_blank">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <FileDown className="h-4 w-4" />
              <span>Descargar PDF</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Hoja de Cotización (Documento Presentable) */}
      <Card className="p-8 sm:p-12 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md print:shadow-none print:border-none print:p-0">
        {/* Cabecera del Documento */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b border-slate-100 dark:border-slate-800 gap-6">
          {/* Datos del Negocio */}
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {business.name}
            </div>
            {business.tax_id && (
              <p className="text-xs font-medium text-slate-500 mt-1">
                RUC/RFC: {business.tax_id}
              </p>
            )}
            {business.address && (
              <p className="text-xs text-slate-500 mt-0.5">{business.address}</p>
            )}
            <div className="text-xs text-slate-500 mt-1 space-x-2">
              {business.email && <span>{business.email}</span>}
              {business.phone && <span>· {business.phone}</span>}
            </div>
          </div>

          {/* Bloque Número de Cotización y Fechas */}
          <div className="sm:text-right">
            <div className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Cotización Comercial
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {quote.quote_number}
            </div>
            <div className="mt-3 text-xs text-slate-500 space-y-1">
              <div className="flex items-center sm:justify-end gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Emisión: {formatDate(quote.issue_date)}</span>
              </div>
              <div className="flex items-center sm:justify-end gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Válida hasta: {formatDate(quote.valid_until)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Destinatario / Cliente */}
        <div className="py-6 border-b border-slate-100 dark:border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Preparado para
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white">
            {quote.client?.name || 'Cliente'}
          </div>
          {quote.client?.tax_id && (
            <p className="text-xs text-slate-500 mt-0.5">
              RUC/RFC: {quote.client.tax_id}
            </p>
          )}
          {quote.client?.address && (
            <p className="text-xs text-slate-500 mt-0.5">{quote.client.address}</p>
          )}
          {quote.client?.email && (
            <p className="text-xs text-slate-500 mt-0.5">{quote.client.email}</p>
          )}
        </div>

        {/* Tabla de Detalle */}
        <div className="py-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500">
                <th className="py-3 px-2">Descripción</th>
                <th className="py-3 px-2 text-right w-20">Cant.</th>
                <th className="py-3 px-2 text-right w-28">Precio Unit.</th>
                <th className="py-3 px-2 text-right w-20">Desc.</th>
                <th className="py-3 px-2 text-right w-28">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {quote.items?.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-3.5 px-2 text-slate-800 dark:text-slate-200">
                    <p className="font-medium">{item.description}</p>
                  </td>
                  <td className="py-3.5 px-2 text-right text-slate-600 dark:text-slate-400">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-2 text-right text-slate-600 dark:text-slate-400">
                    {formatCurrency(item.unit_price, quote.currency)}
                  </td>
                  <td className="py-3.5 px-2 text-right text-slate-500 text-xs">
                    {item.discount_rate > 0 ? `${item.discount_rate}%` : '—'}
                  </td>
                  <td className="py-3.5 px-2 text-right font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(item.subtotal, quote.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumen de Totales e Impuestos */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start gap-6">
          {/* Notas y Términos */}
          <div className="sm:max-w-md text-xs space-y-3 text-slate-500">
            {quote.terms && (
              <div>
                <strong className="text-slate-700 dark:text-slate-300 block mb-1">
                  Términos y Condiciones:
                </strong>
                <p className="whitespace-pre-line">{quote.terms}</p>
              </div>
            )}
            {quote.notes && (
              <div>
                <strong className="text-slate-700 dark:text-slate-300 block mb-1">
                  Notas:
                </strong>
                <p className="whitespace-pre-line">{quote.notes}</p>
              </div>
            )}
          </div>

          {/* Liquidación Económica */}
          <div className="w-full sm:w-64 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(quote.subtotal, quote.currency)}
              </span>
            </div>

            {quote.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-xs">
                <span>Descuento aplicado:</span>
                <span>-{formatCurrency(quote.discount_amount, quote.currency)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Impuesto ({quote.tax_rate}%):</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(quote.tax_amount, quote.currency)}
              </span>
            </div>

            <div className="pt-2 border-t-2 border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900 dark:text-white">
                Total:
              </span>
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(quote.total, quote.currency)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Historial de Actividades / Bitácora */}
      {activities.length > 0 && (
        <Card className="print:hidden">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-4 w-4 text-slate-500" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Historial y Auditoría de la Cotización
            </h3>
          </div>

          <div className="space-y-3">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                    {act.action === 'created'
                      ? 'Cotización creada'
                      : act.action === 'updated'
                      ? 'Cotización modificada'
                      : act.action === 'status_changed'
                      ? `Estado actualizado a "${(act.metadata as { status?: string })?.status || ''}"`
                      : act.action}
                  </span>
                </div>
                <span className="text-slate-400">{formatDate(act.created_at)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
