'use client';

import React from 'react';
import { Product } from '@/core/domain/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Edit2,
  Trash2,
  Tag,
  Check,
  X,
} from 'lucide-react';
import { toggleProductActiveAction } from '@/app/(dashboard)/products/actions';

interface ProductTableProps {
  products: Product[];
  currency: string;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAddNew: () => void;
  onRefresh: () => void;
}

export function ProductTable({
  products,
  currency,
  onEdit,
  onDelete,
  onAddNew,
  onRefresh,
}: ProductTableProps) {
  const handleToggleActive = async (product: Product) => {
    await toggleProductActiveAction(product.id, !product.is_active);
    onRefresh();
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-4 shadow-inner">
          <Package className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Catálogo vacío
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Añade tus bienes y servicios para agilizar la creación de cotizaciones y estandarizar precios.
        </p>
        <div className="mt-6">
          <Button onClick={onAddNew} size="md" className="gap-2">
            <span>Registrar Primer Producto</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th scope="col" className="px-6 py-3.5">
                Producto / Servicio
              </th>
              <th scope="col" className="px-6 py-3.5 hidden sm:table-cell">
                SKU
              </th>
              <th scope="col" className="px-6 py-3.5">
                Unidad
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Precio Unitario
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
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Nombre y descripción */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {product.name}
                      </div>
                      {product.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* SKU */}
                <td className="px-6 py-4 hidden sm:table-cell">
                  {product.sku ? (
                    <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <Tag className="h-3 w-3 text-slate-400" />
                      {product.sku}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">—</span>
                  )}
                </td>

                {/* Unidad */}
                <td className="px-6 py-4 text-xs font-medium capitalize">
                  {product.unit}
                </td>

                {/* Precio */}
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(product.unit_price, currency)}
                  </span>
                </td>

                {/* Estado */}
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleToggleActive(product)}
                    className="cursor-pointer transition-transform active:scale-95"
                    title={product.is_active ? 'Clic para desactivar' : 'Clic para activar'}
                  >
                    {product.is_active ? (
                      <Badge variant="success" className="gap-1 cursor-pointer">
                        <Check className="h-3 w-3" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="neutral" className="gap-1 cursor-pointer opacity-75">
                        <X className="h-3 w-3" />
                        Inactivo
                      </Badge>
                    )}
                  </button>
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(product)}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                      title="Editar producto"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(product)}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                      title="Eliminar producto"
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
  );
}
