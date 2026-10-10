'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Client } from '@/core/domain/types';
import { ClientTable } from '@/components/clients/client-table';
import { ClientModal } from '@/components/clients/client-modal';
import { DeleteClientDialog } from '@/components/clients/delete-client-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Users } from 'lucide-react';

interface ClientsViewProps {
  initialClients: Client[];
}

export function ClientsView({ initialClients }: ClientsViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Filtrado reactivo en memoria
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return initialClients;
    const query = searchQuery.toLowerCase().trim();
    return initialClients.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.tax_id && c.tax_id.toLowerCase().includes(query)) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        (c.phone && c.phone.toLowerCase().includes(query))
    );
  }, [initialClients, searchQuery]);

  const handleOpenCreate = () => {
    setClientToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteOpen(true);
  };

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header con Título y Botón Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Directorio de Clientes
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gestiona los contactos comerciales de tu empresa para la emisión de cotizaciones
          </p>
        </div>

        <Button onClick={handleOpenCreate} size="md" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Nuevo Cliente</span>
        </Button>
      </div>

      {/* Barra de Filtro y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Buscar por nombre, RUC/RFC, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 self-end sm:self-center">
          Total: <strong className="text-slate-900 dark:text-white">{filteredClients.length}</strong>{' '}
          {filteredClients.length === 1 ? 'cliente' : 'clientes'}
        </div>
      </div>

      {/* Tabla de Clientes */}
      <ClientTable
        clients={filteredClients}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onAddNew={handleOpenCreate}
      />

      {/* Modal para Crear/Editar Cliente */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientToEdit={clientToEdit}
        onSuccess={handleSuccess}
      />

      {/* Diálogo de Confirmación de Eliminación */}
      <DeleteClientDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        client={clientToDelete}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
