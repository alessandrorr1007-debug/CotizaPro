'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Client } from '@/core/domain/types';
import { deleteClientAction } from '@/app/(dashboard)/clients/actions';
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface DeleteClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSuccess: () => void;
}

export function DeleteClientDialog({
  isOpen,
  onClose,
  client,
  onSuccess,
}: DeleteClientDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!client) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteClientAction(client.id);
      if (result.error) {
        setError(result.error);
        setIsDeleting(false);
      } else {
        setIsDeleting(false);
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el cliente');
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Cliente"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
          <AlertTriangle className="h-6 w-6 shrink-0 text-rose-600" />
          <p className="text-xs">
            Esta acción no se puede deshacer. Los datos del cliente se removerán permanentemente.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <p className="text-sm text-slate-600 dark:text-slate-300">
          ¿Estás seguro de que deseas eliminar al cliente{' '}
          <strong className="text-slate-900 dark:text-white font-semibold">
            {client.name}
          </strong>
          {client.tax_id && ` (${client.tax_id})`}?
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
            Eliminar Cliente
          </Button>
        </div>
      </div>
    </Modal>
  );
}
