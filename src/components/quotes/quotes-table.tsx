'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Quote, QuoteStatus } from '@/core/domain/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { QuoteStatusBadge } from '@/components/quotes/quote-status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { deleteQuoteAction } from '@/app/(dashboard)/quotes/actions';
import {
  FileSpreadsheet,
  Search,
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuotesTableProps {
  initialQuotes: Quote[];
}

export function QuotesTable({ initialQuotes }: QuotesTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | QuoteStatus>('all');

  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filteredQuotes = useMemo(() => {
    return initialQuotes.filter((quote) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        quote.quote_number.toLowerCase().includes(query) ||
        (quote.client?.name && quote.client.name.toLowerCase().includes(query));

      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [initialQuotes, searchQuery, statusFilter]);

  const handleDelete = async () => {
    if (!quoteToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteQuoteAction(quoteToDelete.id);
      if (result.error) {
        setDeleteError(result.error);
        setIsDeleting(false);
      } else {
        setIsDeleting(false);
        setQuoteToDelete(null);
        router.refresh();
      }
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Cotizaciones Comerciales
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Control de propuestas comerciales, estados de venta y seguimiento a clientes
          </p>
        </div>

        <Link href="/quotes/new">
          <Button size="md" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Nueva Cotización</span>
          </Button>
        </Link>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Buscar por correlativo (COT-0001) o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Pestañas de estados */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium overflow-x-auto max-w-full">
          {(
            [
              { id: 'all', label: 'Todas' },
              { id: 'draft', label: 'Borrador' },
              { id: 'sent', label: 'Enviada' },
              { id: 'accepted', label: 'Aceptada' },
              { id: 'rejected', label: 'Rechazada' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as 'all' | QuoteStatus)}
              className={cn(
                'px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer',
                statusFilter === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      {filteredQuotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-4 shadow-inner">
            <FileSpreadsheet className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            No se encontraron cotizaciones
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            {searchQuery || statusFilter !== 'all'
              ? 'Prueba modificando tus términos de búsqueda o el filtro de estado.'
              : 'Emite tu primera cotización comercial con cálculo de impuestos garantizado.'}
          </p>
          <div className="mt-6">
            <Link href="/quotes/new">
              <Button size="md" className="gap-2">
                <span>Crear Primera Cotización</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    N° Cotización
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3.5 hidden md:table-cell">
                    Fechas
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredQuotes.map((quote) => (
                  <tr
                    key={quote.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Correlativo */}
                    <td className="px-6 py-4">
                      <Link
                        href={`/quotes/${quote.id}`}
                        className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1.5"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>{quote.quote_number}</span>
                      </Link>
                    </td>

                    {/* Cliente */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {quote.client?.name || 'Cliente no asignado'}
                      </div>
                      {quote.client?.tax_id && (
                        <span className="text-xs text-slate-400">
                          {quote.client.tax_id}
                        </span>
                      )}
                    </td>

                    {/* Fechas */}
                    <td className="px-6 py-4 hidden md:table-cell text-xs">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Emitida: {formatDate(quote.issue_date)}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Vence: {formatDate(quote.valid_until)}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(quote.total, quote.currency)}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 text-center">
                      <QuoteStatusBadge status={quote.status} />
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/quotes/${quote.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600"
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        {quote.status === 'draft' && (
                          <Link href={`/quotes/${quote.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600"
                              title="Editar cotización"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setQuoteToDelete(quote)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600"
                          title="Eliminar cotización"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={!!quoteToDelete}
        onClose={() => setQuoteToDelete(null)}
        title="Eliminar Cotización"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
            <AlertTriangle className="h-6 w-6 shrink-0 text-rose-600" />
            <p className="text-xs">
              Esta acción eliminará la cotización y todos sus ítems de forma permanente.
            </p>
          </div>

          {deleteError && (
            <div className="flex items-start gap-2.5 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}

          <p className="text-sm text-slate-600 dark:text-slate-300">
            ¿Confirmas la eliminación de la cotización{' '}
            <strong className="text-slate-900 dark:text-white">
              {quoteToDelete?.quote_number}
            </strong>
            ?
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setQuoteToDelete(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
