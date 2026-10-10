'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/core/domain/types';
import { ProductTable } from '@/components/products/product-table';
import { ProductModal } from '@/components/products/product-modal';
import { DeleteProductDialog } from '@/components/products/delete-product-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductsViewProps {
  initialProducts: Product[];
  currency: string;
}

export function ProductsView({ initialProducts, currency }: ProductsViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Filtrado reactivo en memoria
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Filtro de texto
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.sku && product.sku.toLowerCase().includes(query)) ||
        (product.description && product.description.toLowerCase().includes(query));

      // Filtro de estado
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && product.is_active) ||
        (statusFilter === 'inactive' && !product.is_active);

      return matchesQuery && matchesStatus;
    });
  }, [initialProducts, searchQuery, statusFilter]);

  const handleOpenCreate = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setProductToDelete(product);
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
              <Package className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Catálogo de Productos y Servicios
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Administra precios base, códigos SKU y unidades de medida para tus cotizaciones
          </p>
        </div>

        <Button onClick={handleOpenCreate} size="md" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Nuevo Producto</span>
        </Button>
      </div>

      {/* Controles: Búsqueda y Filtros de Estado */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Buscar por nombre, SKU o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Pestañas de estado */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium self-stretch sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg transition-colors cursor-pointer',
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            Todos ({initialProducts.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={cn(
              'px-3 py-1.5 rounded-lg transition-colors cursor-pointer',
              statusFilter === 'active'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            Activos ({initialProducts.filter((p) => p.is_active).length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={cn(
              'px-3 py-1.5 rounded-lg transition-colors cursor-pointer',
              statusFilter === 'inactive'
                ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            Inactivos ({initialProducts.filter((p) => !p.is_active).length})
          </button>
        </div>
      </div>

      {/* Tabla de Productos */}
      <ProductTable
        products={filteredProducts}
        currency={currency}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onAddNew={handleOpenCreate}
        onRefresh={handleSuccess}
      />

      {/* Modal para Crear/Editar */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={productToEdit}
        currency={currency}
        onSuccess={handleSuccess}
      />

      {/* Diálogo de Eliminación */}
      <DeleteProductDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        product={productToDelete}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
