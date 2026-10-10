'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Product } from '@/core/domain/types';
import { deleteProductAction } from '@/app/(dashboard)/products/actions';
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface DeleteProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

export function DeleteProductDialog({
  isOpen,
  onClose,
  product,
  onSuccess,
}: DeleteProductDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteProductAction(product.id);
      if (result.error) {
        setError(result.error);
        setIsDeleting(false);
      } else {
        setIsDeleting(false);
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el producto');
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Producto del Catálogo"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
          <AlertTriangle className="h-6 w-6 shrink-0 text-rose-600" />
          <p className="text-xs">
            Esta acción eliminará el producto del catálogo. Si ya está incluido en cotizaciones existentes, no se podrá borrar para mantener la integridad histórica.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <p className="text-sm text-slate-600 dark:text-slate-300">
          ¿Estás seguro de que deseas eliminar{' '}
          <strong className="text-slate-900 dark:text-white font-semibold">
            {product.name}
          </strong>
          {product.sku && ` (${product.sku})`}?
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
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
            Eliminar Producto
          </Button>
        </div>
      </div>
    </Modal>
  );
}
