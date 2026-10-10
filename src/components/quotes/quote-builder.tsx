'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Client, Product, Quote } from '@/core/domain/types';
import { QuoteCalculator, RawQuoteItemInput } from '@/core/engine/quote-calculator';
import { createQuoteAction, updateQuoteAction } from '@/app/(dashboard)/quotes/actions';
import { getCurrencyConfig, CURRENCY_CONFIGS } from '@/lib/constants/currencies';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Receipt,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  UserPlus,
} from 'lucide-react';

interface QuoteBuilderProps {
  clients: Client[];
  products: Product[];
  defaultCurrency: string;
  defaultTaxRate: number;
  initialQuote?: Quote | null;
}

interface ItemRow {
  id: string; // ID temporal en memoria
  product_id: string;
  description: string;
  quantity: number | '';
  unit_price: number | '';
  discount_rate: number | '';
}

export function QuoteBuilder({
  clients,
  products,
  defaultCurrency,
  defaultTaxRate,
  initialQuote,
}: QuoteBuilderProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [clientId, setClientId] = useState(initialQuote?.client_id || (clients[0]?.id || ''));
  const [issueDate, setIssueDate] = useState(
    initialQuote?.issue_date || new Date().toISOString().split('T')[0]
  );
  const [validUntil, setValidUntil] = useState(() => {
    if (initialQuote?.valid_until) return initialQuote.valid_until;
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [currency, setCurrency] = useState(initialQuote?.currency || defaultCurrency);
  const [taxRate, setTaxRate] = useState<number | ''>(
    initialQuote?.tax_rate !== undefined ? initialQuote.tax_rate : defaultTaxRate
  );
  const currencyConfig = getCurrencyConfig(currency);
  const [notes, setNotes] = useState(initialQuote?.notes || '');
  const [terms, setTerms] = useState(
    initialQuote?.terms || 'Validez de la oferta: 15 días calendario. Forma de pago: 50% al aprobar y 50% al término.'
  );

  // Items State
  const [items, setItems] = useState<ItemRow[]>(() => {
    if (initialQuote?.items && initialQuote.items.length > 0) {
      return initialQuote.items.map((it, idx) => ({
        id: String(idx),
        product_id: it.product_id || '',
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price,
        discount_rate: it.discount_rate,
      }));
    }
    return [
      {
        id: '1',
        product_id: '',
        description: '',
        quantity: 1,
        unit_price: '',
        discount_rate: 0,
      },
    ];
  });

  // Cálculo financiero sincronizado en tiempo real con QuoteCalculator
  const calculation = useMemo(() => {
    const rawItems: RawQuoteItemInput[] = items.map((it) => ({
      product_id: it.product_id || null,
      description: it.description,
      quantity: Number(it.quantity) || 0,
      unit_price: Number(it.unit_price) || 0,
      discount_rate: Number(it.discount_rate) || 0,
    }));

    const safeTax = typeof taxRate === 'number' ? taxRate : 0;
    return QuoteCalculator.calculateQuote(rawItems, safeTax, 0);
  }, [items, taxRate]);

  // Manejo de productos en la tabla
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        product_id: '',
        description: '',
        quantity: 1,
        unit_price: '',
        discount_rate: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleItemChange = (id: string, field: keyof ItemRow, value: string | number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;

        if (field === 'product_id') {
          const selectedProduct = products.find((p) => p.id === value);
          if (selectedProduct) {
            return {
              ...it,
              product_id: selectedProduct.id,
              description: selectedProduct.name + (selectedProduct.description ? ` - ${selectedProduct.description}` : ''),
              unit_price: selectedProduct.unit_price,
            };
          }
          return { ...it, product_id: '' };
        }

        return { ...it, [field]: value };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!clientId) {
      setError('Debes seleccionar un cliente.');
      return;
    }

    if (items.some((it) => !it.description.trim() || Number(it.quantity) <= 0 || Number(it.unit_price) < 0)) {
      setError('Por favor completa la descripción, una cantidad mayor a 0 y un precio válido en todas las líneas.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      client_id: clientId,
      issue_date: issueDate,
      valid_until: validUntil,
      currency,
      tax_rate: typeof taxRate === 'number' ? taxRate : 0,
      notes: notes.trim() || null,
      terms: terms.trim() || null,
      items: items.map((it, idx) => ({
        product_id: it.product_id || null,
        description: it.description.trim(),
        quantity: Number(it.quantity) || 1,
        unit_price: Number(it.unit_price) || 0,
        discount_rate: Number(it.discount_rate) || 0,
        sort_order: idx,
      })),
    };

    try {
      const result = initialQuote
        ? await updateQuoteAction(initialQuote.id, payload)
        : await createQuoteAction(payload);

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        const destination = result.quoteId ? `/quotes/${result.quoteId}` : '/quotes';
        router.push(destination);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar la cotización');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Encabezado y Navegación */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/quotes">
            <Button variant="ghost" size="sm" type="button" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span>{initialQuote ? `Editar Cotización ${initialQuote.quote_number}` : 'Nueva Cotización'}</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {initialQuote
                ? 'Modifica los ítems y condiciones de la cotización existente'
                : 'Crea una propuesta comercial con cálculo automatizado de impuestos y totales'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Link href="/quotes">
            <Button variant="outline" size="md" type="button">
              Cancelar
            </Button>
          </Link>
          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={isSubmitting}
            className="shadow-md shadow-indigo-600/20"
          >
            {initialQuote ? 'Guardar Cambios' : 'Emitir Cotización'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-4 text-sm text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Datos Principales: Cliente y Fechas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Destinatario y Parámetros Comerciales</span>
          </CardTitle>
          <CardDescription>
            Indica el cliente al que va dirigida la cotización y el periodo de vigencia.
          </CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Selección de Cliente */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="client_id" required className="mb-0">
                Cliente
              </Label>
              <Link
                href="/clients"
                target="_blank"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                <UserPlus className="h-3 w-3" />
                <span>Nuevo cliente</span>
              </Link>
            </div>
            {clients.length > 0 ? (
              <select
                id="client_id"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              >
                <option value="" disabled>Selecciona un cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.tax_id ? `(${c.tax_id})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
                No tienes clientes registrados aún.{' '}
                <Link href="/clients" className="font-semibold underline">
                  Registra un cliente aquí
                </Link>{' '}
                antes de cotizar.
              </div>
            )}
          </div>

          {/* Fecha de Emisión */}
          <div>
            <Label htmlFor="issue_date" required>
              Fecha de Emisión
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                id="issue_date"
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Válida Hasta */}
          <div>
            <Label htmlFor="valid_until" required>
              Válida Hasta
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                id="valid_until"
                type="date"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Moneda e Impuestos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <Label htmlFor="quote_currency">Moneda de Cotización</Label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                id="quote_currency"
                value={currency}
                onChange={(e) => {
                  const newCurr = e.target.value;
                  setCurrency(newCurr);
                  if (!initialQuote) {
                    const cfg = getCurrencyConfig(newCurr);
                    setTaxRate(cfg.defaultTaxRate);
                  }
                }}
                className="flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              >
                {Object.values(CURRENCY_CONFIGS).map((cfg) => (
                  <option key={cfg.code} value={cfg.code}>
                    {cfg.code} ({cfg.symbol}) — {cfg.country} ({cfg.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="tax_rate">Tasa de Impuesto — {currencyConfig.taxName}</Label>
            <div className="relative">
              <Receipt className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={String(currencyConfig.defaultTaxRate)}
                className="pl-10"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Sugerido para {currencyConfig.country}: {currencyConfig.taxName}.
            </p>
          </div>
        </div>
      </Card>

      {/* Tabla Dinámica de Ítems */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-base font-semibold">Líneas de la Cotización</CardTitle>
            <CardDescription>
              Selecciona productos de tu catálogo o escribe conceptos personalizados
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Añadir Línea</span>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3 w-52">Catálogo (Opcional)</th>
                <th className="py-3 px-3">Descripción *</th>
                <th className="py-3 px-3 w-24 text-right">Cant. *</th>
                <th className="py-3 px-3 w-32 text-right">Precio Unit. *</th>
                <th className="py-3 px-3 w-24 text-right">Desc. %</th>
                <th className="py-3 px-3 w-32 text-right">Subtotal</th>
                <th className="py-3 px-2 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {items.map((item, index) => {
                const calculatedItem = calculation.items[index];
                return (
                  <tr key={item.id} className="align-top hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    {/* Selector de Producto */}
                    <td className="py-3 px-3">
                      <select
                        value={item.product_id}
                        onChange={(e) => handleItemChange(item.id, 'product_id', e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-slate-900 dark:text-white"
                      >
                        <option value="">Manual / Sin catálogo</option>
                        {products
                          .filter((p) => p.is_active || p.id === item.product_id)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({formatCurrency(p.unit_price, currency)})
                            </option>
                          ))}
                      </select>
                    </td>

                    {/* Descripción */}
                    <td className="py-3 px-3">
                      <Input
                        required
                        placeholder="Descripción del ítem o servicio..."
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        className="text-sm"
                      />
                    </td>

                    {/* Cantidad */}
                    <td className="py-3 px-3">
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            'quantity',
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        className="text-right text-sm"
                      />
                    </td>

                    {/* Precio Unitario */}
                    <td className="py-3 px-3">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={item.unit_price}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            'unit_price',
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        className="text-right text-sm font-medium"
                      />
                    </td>

                    {/* Descuento % */}
                    <td className="py-3 px-3">
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={item.discount_rate}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            'discount_rate',
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        className="text-right text-sm"
                      />
                    </td>

                    {/* Subtotal calculado */}
                    <td className="py-3 px-3 text-right font-semibold text-slate-900 dark:text-white pt-5">
                      {formatCurrency(calculatedItem?.subtotal || 0, currency)}
                    </td>

                    {/* Botón Eliminar Fila */}
                    <td className="py-3 px-2 text-center pt-3.5">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length <= 1}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed p-1.5 transition-colors cursor-pointer"
                        title="Eliminar fila"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Añadir otra línea</span>
          </Button>

          <span className="text-xs text-slate-500">
            {items.length} {items.length === 1 ? 'línea' : 'líneas'} en total
          </span>
        </div>
      </Card>

      {/* Bloque Inferior: Términos / Notas y Resumen Financiero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notas y Términos */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardTitle className="text-sm font-semibold mb-2">Términos y Condiciones</CardTitle>
            <textarea
              rows={3}
              placeholder="Condiciones de pago, tiempo de entrega, cuentas bancarias, etc."
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            />

            <CardTitle className="text-sm font-semibold mt-4 mb-2">Notas Adicionales (Opcional)</CardTitle>
            <textarea
              rows={2}
              placeholder="Mensaje de agradecimiento o aclaraciones para el cliente..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            />
          </Card>
        </div>

        {/* Resumen Financiero Calculado */}
        <div>
          <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-indigo-100 dark:border-indigo-950/60 space-y-3">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              Resumen Económico
            </h3>

            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Subtotal ítems</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(calculation.subtotal, currency)}
              </span>
            </div>

            {calculation.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                <span>Descuento total</span>
                <span className="font-medium">
                  -{formatCurrency(calculation.discount_amount, currency)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Base Imponible</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(calculation.taxable_amount, currency)}
              </span>
            </div>

            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>{currencyConfig.taxName.split(' ')[0] || 'Impuesto'} ({calculation.tax_rate}%)</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(calculation.tax_amount, currency)}
              </span>
            </div>

            <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900 dark:text-white">
                Total Final
              </span>
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(calculation.total, currency)}
              </span>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-4"
              isLoading={isSubmitting}
            >
              {initialQuote ? 'Guardar Cambios' : 'Emitir Cotización'}
            </Button>
          </Card>
        </div>
      </div>
    </form>
  );
}
