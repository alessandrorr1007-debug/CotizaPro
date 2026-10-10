'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Client } from '@/core/domain/types';
import { createClientAction, updateClientAction } from '@/app/(dashboard)/clients/actions';
import { AlertCircle, Building2, Mail, Phone, MapPin } from 'lucide-react';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: Client | null;
  onSuccess: () => void;
}

interface ClientFormProps {
  clientToEdit?: Client | null;
  onClose: () => void;
  onSuccess: () => void;
}

function ClientForm({ clientToEdit, onClose, onSuccess }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: clientToEdit?.name || '',
    tax_id: clientToEdit?.tax_id || '',
    email: clientToEdit?.email || '',
    phone: clientToEdit?.phone || '',
    address: clientToEdit?.address || '',
    notes: clientToEdit?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('tax_id', formData.tax_id);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    data.append('notes', formData.notes);

    try {
      const result = clientToEdit
        ? await updateClientAction(clientToEdit.id, data)
        : await createClientAction(data);

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado al guardar el cliente');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="client_name" required>
            Nombre o Razón Social
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              id="client_name"
              required
              placeholder="Ej: Distribuidora Andina S.A.C."
              className="pl-10"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="client_tax_id">Identificación Fiscal (RUC/RFC)</Label>
            <Input
              id="client_tax_id"
              placeholder="Ej: 20601234567"
              value={formData.tax_id}
              onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="client_phone">Teléfono / Celular</Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                id="client_phone"
                placeholder="+51 987 654 321"
                className="pl-10"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="client_email">Correo Electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              id="client_email"
              type="email"
              placeholder="contacto@empresa.com"
              className="pl-10"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="client_address">Dirección Fiscal / Entrega</Label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              id="client_address"
              placeholder="Av. Javier Prado Este 1234, Lima"
              className="pl-10"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="client_notes">Notas Internas</Label>
          <textarea
            id="client_notes"
            rows={2}
            placeholder="Observaciones de pago, persona de contacto alternativa, etc."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            {clientToEdit ? 'Guardar Cambios' : 'Registrar Cliente'}
          </Button>
        </div>
      </form>
    </>
  );
}

export function ClientModal({
  isOpen,
  onClose,
  clientToEdit,
  onSuccess,
}: ClientModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
      description={
        clientToEdit
          ? 'Actualiza la información de contacto y fiscal del cliente'
          : 'Registra los datos del cliente para utilizarlo en tus cotizaciones'
      }
      maxWidth="md"
    >
      {isOpen && (
        <ClientForm
          key={clientToEdit ? clientToEdit.id : 'new-client'}
          clientToEdit={clientToEdit}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
