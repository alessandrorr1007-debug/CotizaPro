'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product } from '@/core/domain/types';
import { createProductAction, updateProductAction } from '@/app/(dashboard)/products/actions';
import { AlertCircle, Package, Tag } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  currency: string;
  onSuccess: () => void;
}

interface ProductFormProps {
  productToEdit?: Product | null;
  currency: string;
  onClose: () => void;
  onSuccess: () => void;
}

function ProductForm({
  productToEdit,
  currency,
  onClose,
  onSuccess,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: productToEdit?.name || '',
    sku: productToEdit?.sku || '',
    description: productToEdit?.description || '',
    unit_price: productToEdit?.unit_price !== undefined ? String(productToEdit.unit_price) : '',
    unit: productToEdit?.unit || 'unidad',
    is_active: productToEdit ? productToEdit.is_active : true,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('sku', formData.sku);
    data.append('description', formData.description);
    data.append('unit_price', formData.unit_price);
    data.append('unit', formData.unit);
    data.append('is_active', formData.is_active ? 'true' : 'false');

    try {
      const result = productToEdit
        ? await updateProductAction(productToEdit.id, data)
        : await createProductAction(data);

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado al guardar el producto');
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
          <Label htmlFor="product_name" required>
            Nombre del Producto o Servicio
          </Label>
          <div className="relative">
            <Package className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              id="product_name"
              required
              placeholder="Ej: Desarrollo de Landing Page / Resma de Papel A4"
              className="pl-10"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="product_sku">Código / SKU</Label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                id="product_sku"
                placeholder="PROD-001"
                className="pl-10"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="product_unit" required>
              Unidad de Medida
            </Label>
            <select
              id="product_unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="unidad">Unidad (und)</option>
              <option value="servicio">Servicio (serv)</option>
              <option value="hora">Hora (hr)</option>
              <option value="paquete">Paquete (pqt)</option>
              <option value="metro">Metro (m)</option>
              <option value="kg">Kilogramo (kg)</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="product_price" required>
            Precio Unitario ({currency})
          </Label>
          <Input
            id="product_price"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            value={formData.unit_price}
            onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="product_description">Descripción Detallada</Label>
          <textarea
            id="product_description"
            rows={2}
            placeholder="Especificaciones técnicas, alcance del servicio o características para la cotización."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            id="product_active"
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label
            htmlFor="product_active"
            className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Producto activo (disponible para nuevas cotizaciones)
          </label>
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
            {productToEdit ? 'Guardar Cambios' : 'Registrar Producto'}
          </Button>
        </div>
      </form>
    </>
  );
}

export function ProductModal({
  isOpen,
  onClose,
  productToEdit,
  currency,
  onSuccess,
}: ProductModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Editar Producto o Servicio' : 'Nuevo Producto o Servicio'}
      description={
        productToEdit
          ? 'Modifica las características y precios de tu catálogo'
          : 'Agrega un nuevo ítem a tu catálogo para cotizar con rapidez'
      }
      maxWidth="md"
    >
      {isOpen && (
        <ProductForm
          key={productToEdit ? productToEdit.id : 'new-product'}
          productToEdit={productToEdit}
          currency={currency}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
