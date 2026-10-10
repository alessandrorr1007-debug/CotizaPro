'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { loginAction, AuthActionResult } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Lock, Mail } from 'lucide-react';

const initialState: AuthActionResult = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <Card className="border-0 shadow-lg sm:border sm:border-slate-200/80 dark:sm:border-slate-800">
      <CardHeader className="text-center sm:text-left">
        <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder a tu panel de cotizaciones
        </CardDescription>
      </CardHeader>

      {state?.error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg bg-rose-50 p-3.5 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.message && (
        <div className="mb-6 rounded-lg bg-emerald-50 p-3.5 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
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
              placeholder="tu@negocio.com"
              required
              autoComplete="email"
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password" required>
              Contraseña
            </Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="pl-10"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isPending}
        >
          {isPending ? 'Validando...' : 'Acceder a CotizaPro'}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-sm text-slate-500">
        ¿Aún no tienes cuenta?{' '}
        <Link
          href="/register"
          className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline transition-colors"
        >
          Crear cuenta para mi negocio
        </Link>
      </div>
    </Card>
  );
}
