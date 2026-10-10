'use client';

import React from 'react';
import { Client } from '@/core/domain/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Users,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building2,
  MapPin,
} from 'lucide-react';

interface ClientTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onAddNew: () => void;
}

export function ClientTable({
  clients,
  onEdit,
  onDelete,
  onAddNew,
}: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-4 shadow-inner">
          <Users className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          No hay clientes registrados
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Comienza agregando tu primer cliente para emitir cotizaciones de forma rápida y organizada.
        </p>
        <div className="mt-6">
          <Button onClick={onAddNew} size="md" className="gap-2">
            <span>Registrar Primer Cliente</span>
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
                Cliente / Razón Social
              </th>
              <th scope="col" className="px-6 py-3.5">
                Contacto
              </th>
              <th scope="col" className="px-6 py-3.5 hidden md:table-cell">
                Dirección
              </th>
              <th scope="col" className="px-6 py-3.5 hidden lg:table-cell">
                Fecha Registro
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {clients.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Nombre y RUC */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase">
                      {client.name.substring(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {client.name}
                      </div>
                      {client.tax_id && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <Building2 className="h-3 w-3" />
                          <span>RUC/RFC: {client.tax_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Contacto */}
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {client.email ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <a
                          href={`mailto:${client.email}`}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400 truncate max-w-[180px]"
                        >
                          {client.email}
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sin correo</span>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Dirección */}
                <td className="px-6 py-4 hidden md:table-cell text-xs">
                  {client.address ? (
                    <div className="flex items-start gap-1 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No especificada</span>
                  )}
                </td>

                {/* Fecha */}
                <td className="px-6 py-4 hidden lg:table-cell text-xs text-slate-500">
                  {formatDate(client.created_at)}
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(client)}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                      title="Editar cliente"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(client)}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                      title="Eliminar cliente"
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
