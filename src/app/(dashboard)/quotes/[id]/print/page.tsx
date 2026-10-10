import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { QuoteItem } from '@/core/domain/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PrintTrigger } from '@/components/pdf/print-trigger';

export default async function PrintQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getCurrentUserSession();
  if (!session?.user) {
    redirect('/login');
  }

  if (!session.business) {
    return null;
  }

  const supabase = await createClient();

  const { data: quote, error } = await supabase
    .from('quotes')
    .select(`
      *,
      client:clients(*),
      items:quote_items(*)
    `)
    .eq('id', id)
    .eq('business_id', session.business.id)
    .single();

  if (error || !quote) {
    notFound();
  }

  if (quote.items && Array.isArray(quote.items)) {
    (quote.items as QuoteItem[]).sort(
      (a: QuoteItem, b: QuoteItem) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
  }

  const business = session.business;

  return (
    <div className="bg-white min-h-screen text-slate-900 p-8 sm:p-12 max-w-4xl mx-auto font-sans print:p-0">
      <PrintTrigger />

      {/* Cabecera */}
      <div className="flex justify-between items-start pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {business.name}
          </h1>
          {business.tax_id && (
            <p className="text-xs text-slate-600 mt-0.5">RUC/RFC: {business.tax_id}</p>
          )}
          {business.address && (
            <p className="text-xs text-slate-600 mt-0.5">{business.address}</p>
          )}
          <p className="text-xs text-slate-600 mt-0.5">
            {[business.email, business.phone].filter(Boolean).join(' · ')}
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Cotización Comercial
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {quote.quote_number}
          </div>
          <div className="text-xs text-slate-600 mt-2 space-y-0.5">
            <p>Emisión: {formatDate(quote.issue_date)}</p>
            <p>Válida hasta: {formatDate(quote.valid_until)}</p>
          </div>
        </div>
      </div>

      {/* Datos Cliente */}
      <div className="py-6 border-b border-slate-200 bg-slate-50/60 p-4 rounded-xl my-6">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
          Preparado para
        </div>
        <div className="text-base font-bold text-slate-900">
          {quote.client?.name || 'Cliente'}
        </div>
        {quote.client?.tax_id && (
          <p className="text-xs text-slate-600">RUC/RFC: {quote.client.tax_id}</p>
        )}
        {quote.client?.address && (
          <p className="text-xs text-slate-600">{quote.client.address}</p>
        )}
        {quote.client?.email && (
          <p className="text-xs text-slate-600">{quote.client.email}</p>
        )}
      </div>

      {/* Tabla */}
      <table className="w-full text-left text-sm mb-8">
        <thead>
          <tr className="border-b-2 border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-600">
            <th className="py-3 px-2">Descripción</th>
            <th className="py-3 px-2 text-right w-16">Cant.</th>
            <th className="py-3 px-2 text-right w-24">P. Unit</th>
            <th className="py-3 px-2 text-right w-16">Desc.%</th>
            <th className="py-3 px-2 text-right w-28">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {quote.items?.map((item: QuoteItem, idx: number) => (
            <tr key={item.id || idx}>
              <td className="py-3 px-2 text-slate-800 font-medium">
                {item.description}
              </td>
              <td className="py-3 px-2 text-right text-slate-600">{item.quantity}</td>
              <td className="py-3 px-2 text-right text-slate-600">
                {formatCurrency(item.unit_price, quote.currency)}
              </td>
              <td className="py-3 px-2 text-right text-slate-600">
                {item.discount_rate > 0 ? `${item.discount_rate}%` : '—'}
              </td>
              <td className="py-3 px-2 text-right font-bold text-slate-900">
                {formatCurrency(item.subtotal, quote.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales y Términos */}
      <div className="flex justify-between items-start gap-8 pt-4 border-t border-slate-200">
        <div className="max-w-md text-xs text-slate-600 space-y-3">
          {quote.terms && (
            <div>
              <strong className="block text-slate-900 mb-0.5">Términos y Condiciones:</strong>
              <p className="whitespace-pre-line">{quote.terms}</p>
            </div>
          )}
          {quote.notes && (
            <div>
              <strong className="block text-slate-900 mb-0.5">Notas:</strong>
              <p className="whitespace-pre-line">{quote.notes}</p>
            </div>
          )}
        </div>

        <div className="w-64 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(quote.subtotal, quote.currency)}
            </span>
          </div>
          {quote.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-600 text-xs">
              <span>Descuento:</span>
              <span>-{formatCurrency(quote.discount_amount, quote.currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Impuesto ({quote.tax_rate}%):</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(quote.tax_amount, quote.currency)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t-2 border-slate-900 text-base font-black">
            <span>Total:</span>
            <span className="text-indigo-600">
              {formatCurrency(quote.total, quote.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Firmas */}
      <div className="mt-20 pt-8 flex justify-between text-xs text-slate-500">
        <div className="w-56 text-center border-t border-slate-300 pt-2">
          Emitido por: {business.name}
        </div>
        <div className="w-56 text-center border-t border-slate-300 pt-2">
          Aprobado por: {quote.client?.name || 'Cliente'}
        </div>
      </div>
    </div>
  );
}
