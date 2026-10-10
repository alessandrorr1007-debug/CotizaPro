'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { registerAction, AuthActionResult } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Building2, CheckCircle2, Lock, Mail, User } from 'lucide-react';

const initialState: AuthActionResult = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  if (state?.success && state?.message) {
    return (
      <Card className="border-0 shadow-lg sm:border sm:border-slate-200/80 dark:sm:border-slate-800 text-center py-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl font-bold">¡Cuenta registrada con éxito!</CardTitle>
        <CardDescription className="mt-2 text-base max-w-sm mx-auto">
          {state.message}
        </CardDescription>
        <div className="mt-8">
          <Link href="/login">
            <Button variant="outline" size="md">
              Ir a Iniciar Sesión
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg sm:border sm:border-slate-200/80 dark:sm:border-slate-800">
      <CardHeader className="text-center sm:text-left">
        <CardTitle className="text-2xl font-bold">Crea tu Cuenta</CardTitle>
        <CardDescription>
          Configura tu negocio y comienza a emitir cotizaciones profesionales
        </CardDescription>
      </CardHeader>

      {state?.error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg bg-rose-50 p-3.5 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Nombre completo */}
        <div>
          <Label htmlFor="fullName" required>
            Nombre Completo
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Juan Pérez"
              required
              autoComplete="name"
              className="pl-10"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" required>
            Correo Electrónico
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@empresa.com"
              required
              autoComplete="email"
              className="pl-10"
            />
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <Label htmlFor="password" required>
            Contraseña (mínimo 6 caracteres)
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
              className="pl-10"
            />
          </div>
        </div>

        <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Datos iniciales de tu negocio
          </p>

          {/* Nombre de la empresa */}
          <div className="mb-4">
            <Label htmlFor="businessName" required>
              Nombre del Negocio o Empresa
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                id="businessName"
                name="businessName"
                type="text"
                placeholder="Mi Negocio S.A.C. / Consultora"
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Moneda */}
            <div>
              <Label htmlFor="currency">Moneda</Label>
              <select
                id="currency"
                name="currency"
                defaultValue="USD"
                className="flex w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="USD">USD ($ - Dólar)</option>
                <option value="PEN">PEN (S/ - Sol)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="MXN">MXN ($ - Peso Mex)</option>
                <option value="COP">COP ($ - Peso Col)</option>
                <option value="CLP">CLP ($ - Peso Ch)</option>
              </select>
            </div>

            {/* Tasa de impuesto por defecto */}
            <div>
              <Label htmlFor="defaultTaxRate">Impuesto por Defecto (%)</Label>
              <Input
                id="defaultTaxRate"
                name="defaultTaxRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                defaultValue="18.00"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-4"
          size="lg"
          isLoading={isPending}
        >
          {isPending ? 'Creando cuenta y negocio...' : 'Registrarme y Empezar'}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline transition-colors"
        >
          Iniciar sesión
        </Link>
      </div>
    </Card>
  );
}
