'use client';

import React, { useActionState } from 'react';
import { onboardBusinessAction, AuthActionResult } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, AlertCircle } from 'lucide-react';

const initialState: AuthActionResult = {};

export function OnboardingDialog() {
  const [state, formAction, isPending] = useActionState(onboardBusinessAction, initialState);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg border-slate-700 bg-slate-900 text-white shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl text-white">Configura tu Negocio</CardTitle>
          <CardDescription className="text-slate-400">
            Para comenzar a cotizar, completa los datos principales de tu empresa
          </CardDescription>
        </CardHeader>

        {state?.error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-rose-950/50 p-3.5 text-sm text-rose-300 border border-rose-900">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name" required className="text-slate-200">
              Nombre de la Empresa o Razón Social
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Ej: Soluciones Digitales S.A.C."
              required
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tax_id" className="text-slate-200">
                Identificación Fiscal (RUC/RFC)
              </Label>
              <Input
                id="tax_id"
                name="tax_id"
                placeholder="20123456789"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="currency" className="text-slate-200">
                Moneda Principal
              </Label>
              <select
                id="currency"
                name="currency"
                defaultValue="USD"
                className="flex w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              >
                <option value="USD">USD ($)</option>
                <option value="PEN">PEN (S/)</option>
                <option value="EUR">EUR (€)</option>
                <option value="MXN">MXN ($)</option>
                <option value="COP">COP ($)</option>
                <option value="CLP">CLP ($)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="default_tax_rate" className="text-slate-200">
                Impuesto / IGV / IVA (%)
              </Label>
              <Input
                id="default_tax_rate"
                name="default_tax_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                defaultValue="18.00"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-slate-200">
                Teléfono de Contacto
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+51 987 654 321"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="text-slate-200">
              Dirección Comercial
            </Label>
            <Input
              id="address"
              name="address"
              placeholder="Av. Los Negocios 123, Oficina 401"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full mt-4"
            isLoading={isPending}
          >
            {isPending ? 'Guardando negocio...' : 'Guardar y Continuar al Panel'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
